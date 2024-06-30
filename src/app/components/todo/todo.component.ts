import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FilterType, TodoModel } from '../../models/todo';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css',
})
export class TodoComponent implements OnInit {
  todoList = signal<TodoModel[]>([
    { id: 1, title: 'Buy milk', completed: false, editing: false },
    { id: 2, title: 'Buy bread', completed: true, editing: false },
    { id: 3, title: 'Buy chese', completed: false, editing: false },
  ]);

  filter = signal<FilterType>('all');

  todoListFiltered = computed(() => {
    const filter = this.filter();
    const todos = this.todoList();
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  });

  newTodo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });

  constructor() {
    effect(() => {
      localStorage.setItem('todos', JSON.stringify(this.todoList()));
    });
  }

  ngOnInit(): void {
    const storage = localStorage.getItem('todos');
    if (storage) {
      this.todoList.set(JSON.parse(storage));
    }
  }

  changeFilter(filterType: FilterType) {
    this.filter.set(filterType);
  }

  addTodo() {
    const newTodoTitle = this.newTodo.value.trim();
    if (this.newTodo.valid && newTodoTitle !== '') {
      this.todoList.update((prevTodos) => [
        ...prevTodos,
        { id: Date.now(), title: newTodoTitle, completed: false },
      ]);
    }
    this.newTodo.reset();
  }

  toggleTodo(todoId: number) {
    return this.todoList.update((prevTodos) =>
      prevTodos.map((todo) => {
        return todo.id === todoId
          ? { ...todo, completed: !todo.completed }
          : todo;
      })
    );
  }

  removeTodo(todoId: number) {
    this.todoList.update((prevTodos) =>
      prevTodos.filter((todo) => todo.id !== todoId)
    );
  }

  updateTodoEditingMode(todoId: number) {
    return this.todoList.update((prevTodos) =>
      prevTodos.map((todo) => {
        return todo.id === todoId
          ? { ...todo, editing: true }
          : { ...todo, editing: false };
      })
    );
  }

  saveTitleTodo(todoId: number, event: Event) {
    const title = (event.target as HTMLInputElement).value;
    return this.todoList.update((prevTodos) =>
      prevTodos.map((todo) => {
        return todo.id === todoId
          ? { ...todo, title: title, editing: false }
          : todo;
      })
    );
  }
}

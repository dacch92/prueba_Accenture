import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { StorageService } from '../services/storage.service';
import { Task, CATEGORIES } from '../models/task.model';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonInput, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonSelect, IonSelectOption
  ],
})
export class Tab1Page {
  selectedCategory = '';
  taskDescription = '';
  taskDueDate = '';
  categories = CATEGORIES;
  successMessage = '';
  errorMessage = '';
  messageTimeout: any = null;

  constructor(private storage: StorageService) {}

  createTask() {
    // Validate category
    if (!this.selectedCategory) {
      this.errorMessage = 'Please select a category';
      this.successMessage = '';
      return;
    }

    // Validate description
    if (!this.taskDescription.trim()) {
      this.errorMessage = 'Description cannot be empty';
      this.successMessage = '';
      return;
    }

    // Build task object
    const task: Task = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      category: this.selectedCategory,
      description: this.taskDescription.trim(),
      createdAt: new Date().toISOString(),
      dueDate: this.taskDueDate ? new Date(this.taskDueDate).toISOString() : null,
      completed: false
    };

    // Load existing tasks, append, save
    const tasks = this.storage.read<Task[]>('tasks') || [];
    tasks.push(task);
    this.storage.create('tasks', tasks);

    // Show feedback
    const duePart = this.taskDueDate
      ? ` (due ${new Date(this.taskDueDate).toLocaleString()})`
      : '';
    this.successMessage = `Task added to "${this.selectedCategory}"${duePart}!`;
    this.errorMessage = '';

    // Clear form
    this.selectedCategory = '';
    this.taskDescription = '';
    this.taskDueDate = '';

    // Auto-clear success message after 3 seconds
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  clearForm() {
    this.selectedCategory = '';
    this.taskDescription = '';
    this.taskDueDate = '';
    this.successMessage = '';
    this.errorMessage = '';
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
  }

  clearMessages() {
    this.errorMessage = '';
  }
}

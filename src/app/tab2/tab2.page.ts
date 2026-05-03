import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonSelect, IonSelectOption, IonBadge, IonList
} from '@ionic/angular/standalone';
import { StorageService } from '../services/storage.service';
import { Task, CATEGORIES } from '../models/task.model';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, DatePipe,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonInput, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonSelect, IonSelectOption, IonBadge, IonList
  ],
})
export class Tab2Page {
  filterCategory = '';
  searchKeyword = '';
  filterDateFrom = '';
  filterDateTo = '';
  categories = CATEGORIES;
  filteredTasks: Task[] = [];
  hasSearched = false;
  editingTask: Task | null = null;
  editDescription = '';
  editCategory = '';
  editDueDate = '';
  successMessage = '';
  errorMessage = '';
  messageTimeout: any = null;

  constructor(private storage: StorageService) {}

  searchTasks() {
    const allTasks = this.storage.read<Task[]>('tasks') || [];

    // If no filters at all, show everything
    const hasFilters = this.filterCategory || this.searchKeyword.trim() ||
                       this.filterDateFrom || this.filterDateTo;

    if (!hasFilters) {
      this.filteredTasks = allTasks;
      this.hasSearched = true;
      this.editingTask = null;

      if (allTasks.length === 0) {
        this.errorMessage = 'No tasks stored yet. Add some in the Home tab!';
        this.successMessage = '';
      } else {
        this.successMessage = `Showing all ${allTasks.length} task(s)`;
        this.errorMessage = '';
      }
      this.autoClearMessage();
      return;
    }

    this.filteredTasks = allTasks.filter(task => {
      const matchesCategory = !this.filterCategory || task.category === this.filterCategory;
      const matchesKeyword = !this.searchKeyword.trim() ||
        task.description.toLowerCase().includes(this.searchKeyword.trim().toLowerCase());
      const matchesDate = this.matchesDateRange(task);
      return matchesCategory && matchesKeyword && matchesDate;
    });

    this.hasSearched = true;
    this.editingTask = null;

    if (this.filteredTasks.length > 0) {
      this.successMessage = `Found ${this.filteredTasks.length} task(s)`;
      this.errorMessage = '';
    } else {
      this.errorMessage = 'No tasks match your search criteria';
      this.successMessage = '';
    }

    this.autoClearMessage();
  }

  selectTask(task: Task) {
    this.editingTask = { ...task };
    this.editDescription = task.description;
    this.editCategory = task.category;
    // Convert ISO string back to datetime-local format for the input
    this.editDueDate = task.dueDate ? this.toDatetimeLocal(task.dueDate) : '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  updateTask() {
    if (!this.editingTask) return;

    if (!this.editDescription.trim()) {
      this.errorMessage = 'Description cannot be empty';
      this.successMessage = '';
      return;
    }

    if (!this.editCategory) {
      this.errorMessage = 'Please select a category';
      this.successMessage = '';
      return;
    }

    const allTasks = this.storage.read<Task[]>('tasks') || [];
    const index = allTasks.findIndex(t => t.id === this.editingTask!.id);

    if (index !== -1) {
      allTasks[index].description = this.editDescription.trim();
      allTasks[index].category = this.editCategory;
      allTasks[index].dueDate = this.editDueDate ? new Date(this.editDueDate).toISOString() : null;
      this.storage.create('tasks', allTasks);

      // Update local state
      this.editingTask = { ...allTasks[index] };
      this.filteredTasks = this.filteredTasks.map(t =>
        t.id === this.editingTask!.id ? { ...this.editingTask! } : t
      );

      this.successMessage = 'Task updated successfully!';
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Task not found — it may have been deleted';
      this.successMessage = '';
    }

    this.autoClearMessage();
  }

  cancelEdit() {
    this.editingTask = null;
    this.editDescription = '';
    this.editCategory = '';
    this.editDueDate = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  clearSearch() {
    this.filterCategory = '';
    this.searchKeyword = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.filteredTasks = [];
    this.hasSearched = false;
    this.editingTask = null;
    this.editDescription = '';
    this.editCategory = '';
    this.editDueDate = '';
    this.successMessage = '';
    this.errorMessage = '';
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
  }

  clearMessages() {
    this.errorMessage = '';
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'Personal': 'primary',
      'Work': 'secondary',
      'Study': 'tertiary',
      'Debts': 'danger',
      'Health': 'success',
      'Home': 'warning',
      'Finance': 'danger',
      'Family': 'primary',
      'Shopping': 'secondary',
      'Goals': 'success',
      'Urgent': 'danger'
    };
    return colors[category] || 'medium';
  }

  private toDatetimeLocal(isoString: string): string {
    const date = new Date(isoString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private matchesDateRange(task: Task): boolean {
    if (!this.filterDateFrom && !this.filterDateTo) return true;
    if (!task.dueDate) return false;

    const due = new Date(task.dueDate).getTime();
    const from = this.filterDateFrom ? new Date(this.filterDateFrom).getTime() : 0;
    const to = this.filterDateTo ? new Date(this.filterDateTo + 'T23:59:59').getTime() : Infinity;
    return due >= from && due <= to;
  }

  private autoClearMessage() {
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }
}

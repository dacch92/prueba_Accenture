import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonButton, IonNote,
  IonItemSliding, IonItemOptions, IonItemOption, IonIcon,
  IonItemDivider, IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { StorageService } from '../services/storage.service';
import { Task } from '../models/task.model';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    DatePipe,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonButton, IonNote,
    IonItemSliding, IonItemOptions, IonItemOption, IonIcon,
    IonItemDivider, IonBadge
  ],
})
export class Tab3Page implements OnInit {
  allTasks: Task[] = [];

  constructor(private storage: StorageService) {
    addIcons({ trashOutline });
  }

  ngOnInit() {
    this.loadTasks();
  }

  ionViewWillEnter() {
    this.loadTasks();
  }

  loadTasks() {
    const tasks = this.storage.read<Task[]>('tasks') || [];
    const now = new Date().getTime();

    this.allTasks = tasks.sort((a, b) => {
      const aOverdue = a.dueDate ? new Date(a.dueDate).getTime() < now : false;
      const bOverdue = b.dueDate ? new Date(b.dueDate).getTime() < now : false;

      // Past-due tasks first
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      // Within same group, sort by due date (earliest first)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }

      // Tasks with due dates before tasks without
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      return 0;
    });
  }

  deleteTask(id: string) {
    const tasks = this.allTasks.filter(t => t.id !== id);
    this.storage.create('tasks', tasks);
    this.allTasks = tasks;
  }

  clearAll() {
    this.storage.create('tasks', []);
    this.allTasks = [];
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate) return false;
    return new Date(task.dueDate).getTime() < new Date().getTime();
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
}

# Tab1 Add Task — Implementation Plan

**Date:** May 1, 2026  
**Project:** myApp (Ionic/Angular Tab Application)  
**Feature:** Tab1 Add Task UI (Categories + Due Dates)  
**Status:** ✅ Implemented (current)

---

## Table of Contents
1. [Overview](#overview)
2. [Current State](#current-state)
3. [Implementation Goals](#implementation-goals)
4. [Architecture & Design](#architecture--design)
5. [Step-by-Step Implementation](#step-by-step-implementation)
6. [Code Behavior](#code-behavior)
7. [Testing & Verification](#testing--verification)
8. [Rollback Plan](#rollback-plan)

---

## Overview

### What
Implement **Tab1 (“Home”)** as a **form-only** “Add Task” screen that lets the user:
- Select a **category** (from `CATEGORIES`)
- Enter a **task description**
- Optionally set a **due date/time** (`datetime-local`)
- Save tasks to `localStorage` via `StorageService`
- Receive **success/error feedback** (auto-clears after 3 seconds)
- Clear form fields manually

### Why
The previous version of Tab1 mixed an “Add” form with a “Saved Tasks” list. Tab1 is now focused only on **creating** tasks; browsing/editing/deleting is handled by Tab2/Tab3.

### Data model used by Tab1
Tab1 stores tasks as an array:
- `localStorage['tasks']` → `Task[]`

`Task { id, category, description, createdAt, dueDate }`

---

## Current State

### Files
- `src/app/tab1/tab1.page.ts`
- `src/app/tab1/tab1.page.html`
- `src/app/tab1/tab1.page.scss`

### Current Component State (Tab1Page)
- `selectedCategory: string`
- `taskDescription: string`
- `taskDueDate: string` (datetime-local string; converted to ISO on save)
- `successMessage: string`
- `errorMessage: string`
- `messageTimeout: any`

### Current UI Summary
- `ion-select` for **Category**
- `ion-input` for **Task Description**
- `ion-input type="datetime-local"` for **Due Date & Time (optional)**
- `Save Task` and `Clear` buttons
- Angular 20 control flow uses `@if` for messages

---

## Implementation Goals

### Functional Requirements (Current)
- Category is required
- Description is required
- Due date is optional
- Saving creates a new task entry in `tasks: Task[]`
- Success message is shown and auto-clears after ~3 seconds
- Error message is shown and stays until cleared by user typing / next save
- Clear resets all form inputs + messages

### Non-Functional Requirements (Current)
- Standalone component with explicit `imports`
- Uses `StorageService` singleton (`providedIn: 'root'`)
- No data is loaded on page init (stateless form)
- No new dependencies

---

## Architecture & Design

### Event Flow (createTask)
1. Validate `selectedCategory`
2. Validate `taskDescription.trim()`
3. Build `Task`:
   - `id`: generated locally (`Date.now()` + random suffix)
   - `createdAt`: ISO timestamp
   - `dueDate`:
     - if provided: `new Date(taskDueDate).toISOString()`
     - else: `null`
4. Persist:
   - `const tasks = storage.read<Task[]>('tasks') || []`
   - `tasks.push(task)`
   - `storage.create('tasks', tasks)`
5. UI feedback:
   - set `successMessage`
   - clear `errorMessage`
   - clear form fields
6. Auto-clear `successMessage` after 3000ms

### Notes on Storage usage
Tab1 uses:
- `StorageService.read<Task[]>('tasks')`
- `StorageService.create('tasks', tasks)`

It does **not** use `StorageService.update/delete/getAll` in current UI.

---

## Step-by-Step Implementation

### Step 1 — Update Tab1 component logic
**File:** `src/app/tab1/tab1.page.ts`

- Remove any legacy key/value logic
- Keep only:
  - form fields (`selectedCategory`, `taskDescription`, `taskDueDate`)
  - message fields (`successMessage`, `errorMessage`)
  - methods:
    - `createTask()`
    - `clearForm()`
    - `clearMessages()`

### Step 2 — Update Tab1 template
**File:** `src/app/tab1/tab1.page.html`

- Replace the old layout with:
  - `ion-select` for category
  - `ion-input` for description
  - `ion-input type="datetime-local"` for due date
- Show feedback using:
  - `@if (errorMessage) { ... }`
  - `@if (successMessage) { ... }`
- Add `(ionChange)` / `(ionInput)` handlers to call `clearMessages()`.

### Step 3 — Styling
**File:** `src/app/tab1/tab1.page.scss`
- Consistent card layout and message banners
- Responsive button stacking on mobile

---

## Code Behavior

### createTask (high-level)
- Validates:
  - `selectedCategory` not empty
  - `taskDescription` trimmed not empty
- Saves:
  - reads current `Task[]` from `tasks`
  - appends new `Task`
  - writes full `Task[]` back under `tasks`
- Updates UI:
  - sets success/error messages
  - clears input fields

### clearForm
- Resets `selectedCategory`, `taskDescription`, `taskDueDate`
- Clears success/error messages
- Clears any active timeout

### clearMessages
- Clears only `errorMessage` while the user edits inputs

---

## Testing & Verification

### Suggested manual checks
1. Save with category + description, no due date:
   - Success message appears
   - Form clears
   - `localStorage['tasks']` gains a new item with `dueDate: null`
2. Save with due date:
   - `dueDate` saved as ISO string
   - Success message appears
3. Missing category:
   - `errorMessage = 'Please select a category'`
   - nothing is written to storage
4. Missing description:
   - `errorMessage = 'Description cannot be empty'`
5. Refresh page:
   - Tab1 remains blank (form-only)
   - tasks persist

---

## Rollback Plan
If you need to revert Tab1 behavior:
1. Restore previous Tab1 component files from git:
   - `src/app/tab1/tab1.page.ts`
   - `src/app/tab1/tab1.page.html`
   - `src/app/tab1/tab1.page.scss`
2. Verify:
   - `ng build` has no errors
   - Tab routes still load: `/tabs/tab1`

---

**Document Status:** ✅ Implemented (Category + Due Dates)

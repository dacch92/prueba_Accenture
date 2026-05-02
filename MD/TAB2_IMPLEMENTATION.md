# Tab2 Search & Edit — Implementation Plan

**Date:** May 1, 2026  
**Project:** myApp (Ionic/Angular Tab Application)  
**Feature:** Tab2 Search & Edit UI (Filters + Inline Edit)  
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
Implement **Tab2 (“Task Viewer / Search & Edit”)** as a filter-driven screen that:
- Filters stored tasks by:
  - **Category**
  - **Keyword** (task description)
  - **Due date range** (from/to)
- Shows filtered results in a list
- Lets the user select a task and **edit**:
  - category
  - description
  - due date/time (optional)
- Persists edits back into `localStorage` via `StorageService`

### Why
Tab2 provides a UX-focused “find tasks quickly and update them” experience:
- Messages provide success/error feedback
- UI stays consistent with Tab1 (cards + message banners)
- Uses Angular 20 `@if` / `@for` control flow

---

## Current State

### Files
- `src/app/tab2/tab2.page.ts`
- `src/app/tab2/tab2.page.html`
- `src/app/tab2/tab2.page.scss`

### Current Tab2 component state (`Tab2Page`)
- Filter state:
  - `filterCategory: string`
  - `searchKeyword: string`
  - `filterDateFrom: string`
  - `filterDateTo: string`
- Results state:
  - `filteredTasks: Task[]`
  - `hasSearched: boolean`
- Edit state:
  - `editingTask: Task | null`
  - `editDescription: string`
  - `editCategory: string`
  - `editDueDate: string` (datetime-local string; empty means null)
- Messaging state:
  - `successMessage: string`
  - `errorMessage: string`
  - `messageTimeout: any`

### Task model + persistence key
- `Task` stored as a `Task[]` under `localStorage['tasks']`
- Tab2 persists by writing the entire updated `tasks` array back using:
  - `storage.read<Task[]>('tasks')`
  - mutate by index/id
  - `storage.create('tasks', updatedTasksArray)`

---

## Implementation Goals

### Functional Requirements (current)
- User can run a search with any combination of filters.
- If no filters are provided:
  - show all tasks (or show a helpful message if there are none)
- If filters are provided:
  - show only tasks matching all conditions
- Selecting a task opens the edit card populated with current values.
- Updating a task:
  - validates `editDescription` and `editCategory`
  - converts `editDueDate` from `datetime-local` string to ISO string (or `null`)
  - saves to `tasks` in localStorage
  - updates UI state immediately
- All success/error messaging auto-clears after ~3 seconds.
- While typing in filter inputs, `errorMessage` clears.

### Non-Functional Requirements (current)
- No new dependencies/packages
- Uses Angular 20 `@if` / `@for`
- Consistent card layout and banner styles with Tab1
- Responsive layout for mobile and desktop

---

## Architecture & Design

### Data flow
1. Filters change (inputs + selects)
2. User clicks **Search**
3. `searchTasks()`:
   - reads all tasks (`read<Task[]>('tasks')`)
   - computes `hasSearched`, `filteredTasks`
   - sets `successMessage` / `errorMessage`
4. User selects an item:
   - `selectTask(task)` sets `editingTask` and edit fields
5. User clicks **Update Task**:
   - `updateTask()` validates + saves back to `tasks`
   - updates `editingTask` and the matching item in `filteredTasks`

### Due date conversion helpers
- Tab2 uses a conversion to translate:
  - task `dueDate` ISO → `datetime-local` string for edit input
  - edit input `datetime-local` → ISO string for storage

---

## Step-by-Step Implementation

### Step 1 — Update Tab2 component logic
**File:** `src/app/tab2/tab2.page.ts`

Ensure it contains methods:
- `searchTasks()`
- `selectTask(task: Task)`
- `updateTask()`
- `cancelEdit()`
- `clearSearch()`
- `clearMessages()`
- helper methods:
  - `toDatetimeLocal(isoString: string)`
  - `matchesDateRange(task: Task)`

### Step 2 — Rebuild Tab2 template
**File:** `src/app/tab2/tab2.page.html`

Template structure:
- Search card (filters + Search/Clear)
- Results card:
  - shown when `hasSearched && filteredTasks.length > 0`
  - displays `@for (task of filteredTasks; track task.id)`
- Edit card:
  - shown when `editingTask`
  - category select + description input + due datetime-local input
  - Update and Cancel actions

### Step 3 — Styling
**File:** `src/app/tab2/tab2.page.scss`
- Reuse the same message banner colors/pattern as Tab1:
  - `.error-message`
  - `.success-message`
- Add layout for:
  - `.search-form`
  - `.results-card`
  - `.edit-card`
  - `.button-group`

---

## Code Behavior

### searchTasks()
- Reads all tasks: `this.storage.read<Task[]>('tasks') || []`
- Determines whether filters are present.
- If no filters:
  - shows everything and sets a message (or empty-state guidance)
- Else:
  - filters by:
    - `task.category === filterCategory` (when set)
    - `task.description` contains `searchKeyword` (case-insensitive)
    - dueDate within range (when either from/to is set)
- Sets:
  - `filteredTasks`
  - `hasSearched`
  - `successMessage` / `errorMessage`
- Auto-clears messaging via `autoClearMessage()`

### selectTask(task)
- Sets `editingTask = { ...task }`
- Populates:
  - `editDescription`
  - `editCategory`
  - `editDueDate` (ISO → datetime-local string)
- Clears messages.

### updateTask()
- Validates:
  - `editDescription.trim()` not empty
  - `editCategory` selected
- Reads `tasks` again from storage
- Finds task by `id` and updates:
  - description
  - category
  - dueDate (convert input → ISO or null)
- Persists by writing the full array:
  - `storage.create('tasks', allTasks)`
- Updates local UI state and shows success/error.

### clearSearch()
- Resets all filters and UI state:
  - `filterCategory/searchKeyword/filterDateFrom/filterDateTo`
  - `filteredTasks/hasSearched`
  - `editingTask` + edit fields
  - messages + timeout

---

## Testing & Verification

### Manual scenarios
1. With no tasks stored:
   - open Tab2 → press Search (empty filters)
   - verify helpful “no tasks stored” message
2. Add tasks in Tab1, then:
   - search with category filter only
   - search with keyword only
   - search with due date range only
   - search with combinations
3. Select a task from results:
   - ensure edit card populates correctly
4. Update a task:
   - change category/description/due date
   - verify success message
   - verify Tab3 reflects updated sort/overdue state
5. Cancel edit:
   - verify edit card disappears and state resets

---

## Rollback Plan
If you need to revert Tab2 behavior:
1. Restore previous Tab2 files from git:
   - `src/app/tab2/tab2.page.ts`
   - `src/app/tab2/tab2.page.html`
   - `src/app/tab2/tab2.page.scss`
2. Verify:
   - `/tabs/tab2` route still loads
   - search and edit flows work without runtime errors

---

**Document Status:** ✅ Implemented (Filters + Inline Edit)

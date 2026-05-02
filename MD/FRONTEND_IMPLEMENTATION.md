# Frontend Implementation - Current State (Categories + Due Dates)
**Date:** April 30, 2026 (Updated: May 1, 2026)  
**Project:** myApp (Ionic/Angular Tab Application)  
**Document Type:** Frontend Implementation Guide & Refactor Notes

---

## Current Application Architecture (May 1, 2026)

### Data Model
Tasks are stored in `localStorage` under the single key: **`"tasks"`**.

**`Task { id, category, description, createdAt, dueDate }`**
- `id: string` (generated in Tab1)
- `category: string` (11 categories from `CATEGORIES`)
- `description: string`
- `createdAt: string` (ISO)
- `dueDate: string | null` (ISO string; controlled via `datetime-local` inputs)

### Storage layer
All tab pages use the same singleton:
- `StorageService.read<Task[]>('tasks')`
- `StorageService.create('tasks', updatedTasksArray)`

> Note: current UI does **not** use `StorageService.update()`, `delete()`, `getAll()`.

---

## Tab-by-Tab Summary

| Tab | Purpose | Main state | Persistence calls |
|-----|---------|-------------|-------------------|
| **Tab1 — Add Task** | Create a task with category + description + optional due date | `selectedCategory`, `taskDescription`, `taskDueDate`, `successMessage`, `errorMessage` | `read('tasks')` → push → `create('tasks', array)` |
| **Tab2 — Search & Edit** | Filter tasks (category + keyword + due date range), then edit selected task | `filterCategory`, `searchKeyword`, `filterDateFrom`, `filterDateTo`, `filteredTasks`, `editingTask`, `editDescription`, `editCategory`, `editDueDate`, `successMessage`, `errorMessage` | `read('tasks')` → filter → update in-memory → `create('tasks', array)` |
| **Tab3 — Manage** | Sort tasks (overdue first), delete per-task, or clear all | `allTasks` | `read('tasks')` on view enter → `create('tasks', array)` after delete/clear |

---

## Angular 20 Notes
- All tabs use Angular 20 control flow: **`@if` / `@for`**
- Tabs are standalone components with explicit `imports` arrays
- Ionic UI components (e.g., `ion-card`, `ion-select`, `ion-input`, `ion-list`) are used for consistent layout

---

## Tab Implementations

## Tab1 — Add Task (Current)
**File:** `src/app/tab1/tab1.page.ts` + `tab1.page.html`

### UI Fields
- **Category**: `ion-select` (`selectedCategory`)
- **Task Description**: `ion-input` (`taskDescription`)
- **Due Date & Time (optional)**: `ion-input type="datetime-local"` (`taskDueDate`)

### Component behavior
- `createTask()`
  1. Validate category selected
  2. Validate description non-empty
  3. Create a `Task` object:
     - `id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5)`
     - `createdAt: new Date().toISOString()`
     - `dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : null`
  4. Persist:
     - `const tasks = storage.read<Task[]>('tasks') || []`
     - `tasks.push(task)` then `storage.create('tasks', tasks)`
  5. Show success feedback (auto-clears after 3s)
  6. Clear form inputs

- `clearForm()` clears inputs + messages.
- `clearMessages()` clears only `errorMessage` when the user edits inputs.

### Template (high level)
- Form-only layout in an `ion-card`
- Uses `@if (errorMessage)` and `@if (successMessage)` blocks

---

## Tab2 — Search & Edit (Current)
**Files:** `src/app/tab2/tab2.page.ts` + `tab2.page.html`

### Filter state
- `filterCategory: string` (empty means “All Categories”)
- `searchKeyword: string` (matches `task.description`)
- `filterDateFrom: string` and `filterDateTo: string` (datetime-local strings)

### Results state
- `filteredTasks: Task[]`
- `hasSearched: boolean` (controls whether results card renders)
- `editingTask: Task | null` (controls whether edit card renders)

### Main actions
- `searchTasks()`
  - Reads all tasks: `read<Task[]>('tasks') || []`
  - If *no filters provided*:
    - show all tasks (or show a helpful message if empty)
  - Otherwise:
    - filter by:
      - category match
      - description keyword match (case-insensitive)
      - due date range match
  - Sets `successMessage` / `errorMessage` and auto-clears after 3s

- `selectTask(task: Task)`
  - Sets `editingTask = { ...task }`
  - Copies editable fields into:
    - `editDescription`
    - `editCategory`
    - `editDueDate` (converted from ISO to datetime-local format)

- `updateTask()`
  - Validates:
    - `editDescription.trim()` not empty
    - `editCategory` not empty
  - Persists by replacing the matching task in the full `tasks` array:
    - `read('tasks')` → find index by `id` → mutate fields → `create('tasks', allTasks)`
  - Updates local UI state:
    - replaces `editingTask`
    - updates the matching item in `filteredTasks`
  - Shows `successMessage` or `errorMessage` and auto-clears

- `cancelEdit()` and `clearSearch()` reset edit/search state.
- `clearMessages()` clears only `errorMessage` while typing.

---

## Tab3 — Manage (Current)
**Files:** `src/app/tab3/tab3.page.ts` + `tab3.page.html`

### Behavior
- `ngOnInit()` and `ionViewWillEnter()` both call `loadTasks()`
- `loadTasks()`:
  - `read<Task[]>('tasks') || []`
  - sorts:
    1. overdue tasks first (`dueDate < now`)
    2. then tasks with due dates by earliest due date
    3. then tasks without due dates

### Actions
- `deleteTask(id: string)`:
  - filters out matching task and persists:
  - `create('tasks', updatedArray)`
- `clearAll()`:
  - `create('tasks', [])`

### Template
- Shows a “Clear All” button (disabled when empty)
- Each task shows:
  - description
  - due date label (or “No due date”)
  - category badge
  - delete button (per-item)

---

## Implementation Consistency Checks (Current)
- [x] Tab pages inject `StorageService` via constructor
- [x] All persistence uses the shared `tasks` key and `Task[]` array
- [x] Messaging patterns are consistent (success/error + auto-clear)
- [x] Tabs use `@if`/`@for` control flow
- [x] Task due dates are stored as ISO and displayed via Angular date pipe
- [x] Due date inputs use `datetime-local` with conversion when editing (Tab2)

---

## Status
✅ Implemented and aligned with current project code (May 1, 2026).

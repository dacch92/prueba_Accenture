# myApp — Task Manager

A mobile-first task management app built with **Ionic 8 + Angular 20**, packaged for Android and iOS via **Apache Cordova**, with **Firebase Remote Config** for feature flags.

---

## Features

- **Add tasks** with category, description, and optional due date/time
- **Search & edit** tasks by category, keyword, and date range
- **Complete / undo tasks** with visual separation (Pending / Completed sections)
- **Delete** individual tasks or clear all at once
- **Overdue detection** — past-due tasks sorted to the top with visual indicator
- **11 task categories**: Personal, Work, Study, Debts, Health, Home, Finance, Family, Shopping, Goals, Urgent
- **Stats card** — total/pending/completed counts, toggled remotely via Firebase
- **localStorage persistence** — tasks survive app restarts
- **Cross-platform** — runs in browser, Android, and iOS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Ionic 8 + Angular 20 |
| Language | TypeScript 5.9 |
| Build tool | Angular CLI v20 |
| Runtime | Node.js v22.22.2 |
| Native | Apache Cordova (Android + iOS) |
| Storage | `localStorage` via `StorageService` |
| Feature flags | Firebase JS SDK v12 — Remote Config |
| Styling | Custom SCSS per tab |

---

## App Structure

```
src/app/
├── models/
│   └── task.model.ts          Task interface + CATEGORIES constant
├── services/
│   ├── storage.service.ts     localStorage CRUD wrapper (singleton)
│   ├── feature-flag.service.ts Firebase Remote Config wrapper (singleton)
│   └── backend-flow.mmd       Architecture diagram (Mermaid)
├── tab1/                      Add Task
├── tab2/                      Search & Edit
├── tab3/                      Manage (complete / delete / stats)
└── tabs/                      Tab navigation shell
```

### Data Model

```typescript
interface Task {
  id: string;           // Date.now() + random suffix
  category: string;     // one of 11 CATEGORIES
  description: string;
  createdAt: string;    // ISO timestamp
  dueDate: string | null; // ISO timestamp or null
  completed: boolean;   // false on creation, toggled in Tab3
}
```

All tasks stored as `Task[]` under `localStorage` key `"tasks"`.

---

## Tab Breakdown

### Tab 1 — Add Task
- Select category (required)
- Enter description (required)
- Set due date/time — optional, native `datetime-local` input
- Saves task with `completed: false`
- Success/error feedback auto-clears after 3 seconds

### Tab 2 — Search & Edit
- Filter by category, keyword (description), and due date range
- Shows all tasks if no filters are provided
- Select any result to open inline edit card
- Edit category, description, and due date — `completed` field is preserved unchanged
- Success/error feedback with auto-clear

### Tab 3 — Manage
- **Stats card** at the top (shown when Firebase flag `enable_task_stats = true`)
  - Displays Total / Pending (orange) / Completed (green) counts
- **Pending section** — tasks with checkmark + delete buttons; swipe to reveal
- **Completed section** — strikethrough style, undo + delete buttons; hidden when empty
- Overdue tasks sorted to the top with ⚠ indicator
- "Clear All" button (disabled when list is empty)
- Legacy tasks (stored before `completed` field) automatically migrated to `false`

---

## Services

### `StorageService`
Singleton (`providedIn: 'root'`) localStorage wrapper with 6 methods:

| Method | Description |
|---|---|
| `create(key, value)` | JSON-serialize and save |
| `read<T>(key)` | Parse and return typed value (or `null`) |
| `update(key, value)` | Overwrite existing entry |
| `delete(key)` | Remove by key |
| `getAll()` | Return all stored entries |
| `clear()` | Wipe all localStorage |

All methods wrapped in `try/catch` — errors are logged, never thrown.

### `FeatureFlagService`
Singleton Firebase Remote Config wrapper:

| Method | Description |
|---|---|
| `init()` | Fetches and activates Remote Config (silent fail on error) |
| `getBoolean(key)` | Returns boolean flag value (defaults to `false`) |

Dev mode always fetches fresh values (`minimumFetchIntervalMillis: 0`). Production uses Firebase's default 12-hour cache.

---

## Firebase Remote Config

**Project:** `myapp-eea52`  
**Parameter:** `enable_task_stats` (Boolean)

| Value | Result |
|---|---|
| `true` | Stats card **visible** in Tab3 |
| `false` | Stats card **hidden** |

### To toggle the flag
1. [console.firebase.google.com](https://console.firebase.google.com) → project **myapp-eea52**
2. DevOps & Engagement → **Remote Config**
3. Edit `enable_task_stats` → change value → **Save → Publish changes**
4. Reload the app — change takes effect immediately (dev) or within 12h (prod)

---

## Performance Optimizations

Three techniques are applied across the app targeting startup time, data handling, and memory efficiency.

### `ChangeDetectionStrategy.OnPush`

All three tab components use `OnPush` instead of Angular's default change detection. This limits re-renders to only when a component's own data changes, rather than on every zone.js event (keystrokes, timers, lifecycle hooks).

| Component | File |
|---|---|
| `Tab1Page` | `src/app/tab1/tab1.page.ts` |
| `Tab2Page` | `src/app/tab2/tab2.page.ts` |
| `Tab3Page` | `src/app/tab3/tab3.page.ts` |

Tab3 additionally injects `ChangeDetectorRef` and calls `markForCheck()` after the async Firebase `fetchAndActivate()` resolves, ensuring the stats card visibility updates are propagated to the view:

```typescript
async ngOnInit() {
  await this.featureFlags.init();                          // async Firebase call
  this.statsEnabled = this.featureFlags.getBoolean('enable_task_stats');
  this.loadTasks();
  this.cdr.markForCheck();                                 // force view update
}
```

### `track` in `@for` (trackBy equivalent)

All task list loops use `track task.id` so Angular can identify exactly which DOM node changed on any add, edit, delete, or complete operation — instead of destroying and re-creating the entire list:

```html
@for (task of filteredTasks; track task.id) { ... }
```

### Lazy Loading

All three tab components are loaded on demand via `loadComponent` in `tabs.routes.ts`. Angular CLI splits each into a separate chunk bundle, so only the initially-visible tab is downloaded on startup:

```
chunk | tab1-page |   5.59 kB
chunk | tab2-page |  11.31 kB
chunk | tab3-page |   9.12 kB
```

> Full implementation details: [MD/PERFORMANCE_OPTIMIZATIONS.md](MD/PERFORMANCE_OPTIMIZATIONS.md)

---

## Installation & Running Locally

### Prerequisites
- Node.js v18+
- Angular CLI v20: `npm install -g @angular/cli`

### Setup
```bash
git clone <repo-url>
cd myApp
npm install
```

### Run in browser
```bash
ng serve
# open http://localhost:4200
```

### Build for production
```bash
ng build
# output → www/
```

### Run tests
```bash
ng test --watch=false --browsers=ChromeHeadless
```

---

## Mobile Builds (Cordova)

### Android

**Prerequisites:** JDK 11, Android Studio, SDK API 36

```bash
# Debug APK
ng build && ionic cordova build android

# Release APK (unsigned)
ionic cordova build android --release
```

**APK output:** `platforms/android/app/build/outputs/apk/debug/app-debug.apk`

**SDK config:**
| Setting | Value |
|---|---|
| Min SDK | 24 (Android 7.0) |
| Target SDK | 36 (Android 16) |
| Gradle | 8.14.2 |
| AGP | 8.10.1 |

#### Sign and export (Android Studio)
1. Open `platforms/android` in Android Studio
2. **Build → Generate Signed Bundle / APK**
3. Select APK → provide keystore → export

---

### iOS

**Prerequisites:** macOS, Xcode 15+, CocoaPods, Apple Developer account

```bash
# Install CocoaPods deps
cd platforms/ios && pod install && cd ../..

# Build
ng build && ionic cordova build ios

# Run on simulator
ionic cordova run ios --emulator
```

**iOS deployment target:** iOS 11.0  
**Xcode workspace:** `platforms/ios/MyApp.xcworkspace`

> Always open `.xcworkspace`, **not** `.xcodeproj`

#### Export IPA (Xcode)
1. Open `platforms/ios/MyApp.xcworkspace`
2. Set Team + Bundle ID (`io.ionic.starter`)
3. **Product → Archive**
4. Organizer → **Distribute App → Ad Hoc / App Store Connect**

---

## Cordova Plugins

| Plugin | Version | Purpose |
|---|---|---|
| `cordova-plugin-statusbar` | 2.4.2 | Status bar color/visibility |
| `cordova-plugin-device` | 2.0.2 | Device hardware info |
| `cordova-plugin-splashscreen` | 5.0.2 | Launch splash screen |
| `cordova-plugin-ionic-webview` | ^5.0.0 | WKWebView (iOS) / modern WebView (Android) |
| `cordova-plugin-ionic-keyboard` | ^2.0.5 | Keyboard events and resize behavior |

---

## Project Status

| Feature | Status |
|---|---|
| Add / edit / delete tasks | ✅ |
| Task categories (11) | ✅ |
| Due date support | ✅ |
| Overdue detection + sorting | ✅ |
| Task completion (complete / undo) | ✅ |
| localStorage persistence | ✅ |
| Search & filter (Tab2) | ✅ |
| Firebase Remote Config flag | ✅ |
| Stats card (feature-flagged) | ✅ |
| Android platform configured | ✅ |
| iOS platform configured | ✅ |
| Unit tests (17/17 pass) | ✅ |
| `OnPush` change detection (all tabs) | ✅ |
| `track task.id` in all `@for` loops | ✅ |
| Lazy loading via `loadComponent` | ✅ |
| Git repository (public) | ✅ |

---

## Documentation

Detailed docs in the `MD/` folder:

| File | Description |
|---|---|
| [PROJECT_STATUS.md](MD/PROJECT_STATUS.md) | Full build history and phase log |
| [FRONTEND_IMPLEMENTATION.md](MD/FRONTEND_IMPLEMENTATION.md) | Tab-by-tab implementation reference |
| [TAB1_IMPLEMENTATION.md](MD/TAB1_IMPLEMENTATION.md) | Add Task tab — architecture and behavior |
| [TAB2_IMPLEMENTATION.md](MD/TAB2_IMPLEMENTATION.md) | Search & Edit tab — architecture and behavior |
| [COMPLETED_TASKS_IMPLEMENTATION.md](MD/COMPLETED_TASKS_IMPLEMENTATION.md) | Task completion feature — model, logic, UI |
| [FIREBASE_REMOTE_CONFIG.md](MD/FIREBASE_REMOTE_CONFIG.md) | Firebase setup and feature flag usage |
| [SERVICES_ARCHITECTURE.md](MD/SERVICES_ARCHITECTURE.md) | StorageService + FeatureFlagService reference |
| [BACKEND_ARCHITECTURE.md](MD/BACKEND_ARCHITECTURE.md) | Service patterns, DI, state management |
| [MOBILE_BUILD_CORDOVA.md](MD/MOBILE_BUILD_CORDOVA.md) | Android and iOS build guide |
| [PERFORMANCE_OPTIMIZATIONS.md](MD/PERFORMANCE_OPTIMIZATIONS.md) | OnPush, trackBy, lazy loading — implementation plan |
| [PROBLEMS_AND_SOLUTIONS.md](MD/PROBLEMS_AND_SOLUTIONS.md) | Issue log and troubleshooting reference |

---

## License

Private project — all rights reserved.

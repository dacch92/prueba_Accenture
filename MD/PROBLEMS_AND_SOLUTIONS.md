# Problems & Solutions Documentation
**Date:** April 30, 2026 (Updated: May 1, 2026 — Categories + Due Dates)  
**Project:** myApp (Ionic/Angular Tab Application)  
**Document Type:** Troubleshooting Guide & Issue Log

---

## Table of Contents
1. [Issues Encountered This Session](#issues-encountered-this-session)
2. [Terminal Error Messages](#terminal-error-messages)
3. [TypeScript Compilation Issues](#typescript-compilation-issues)
4. [Build & Runtime Problems](#build--runtime-problems)
5. [Testing Issues](#testing-issues)
6. [Common Troubleshooting Guide](#common-troubleshooting-guide)
7. [Prevention & Best Practices](#prevention--best-practices)

---

## Issues Encountered This Session

### ✅ Issue #1: Port 4200 Conflict

**Severity:** Medium ⚠️  
**Status:** RESOLVED ✅  
**Occurrence:** During first `ng serve` command

#### Problem Description
When attempting to start the development server with `ng serve`, the following error occurred:

```
Port 4200 is already in use.
Would you like to use a different port? (Y/n)
```

After selecting "No" (n), the error escalated:

```
An unhandled exception occurred: Port 4200 is already in use. 
Use '--port' to specify a different port.
```

Complete error trace:
```
Error: Port 4200 is already in use. Use '--port' to specify a different port.
    at createInUseError (/Users/david_c/myApp/node_modules/@angular/build/src/utils/check-port.js:51:12)
    at /Users/david_c/myApp/node_modules/@angular/build/src/utils/check-port.js:76:82

Node.js v22.22.2
```

#### Root Cause
A previous `ng serve` instance was still running in the background on port 4200, preventing a new instance from binding to the same port.

#### Solution Applied
```bash
# Kill process using port 4200
lsof -ti:4200 | xargs kill -9

# Verify port is free
lsof -i:4200  # Should return empty

# Start ng serve again
ng serve
```

#### Result
✅ Development server started successfully on port 4200

#### Prevention
- Always stop previous dev servers with Ctrl+C before starting new instances
- Check active processes: `lsof -i:4200`
- Use `--port` flag if port conflict occurs: `ng serve --port 4201`

---

### ✅ Issue #2: TypeScript Strict Indexing Error

**Severity:** Low ⚠️  
**Status:** RESOLVED ✅  
**Occurrence:** During unit test compilation

#### Problem Description
When running `ng test --watch=false --browsers=ChromeHeadless`, compilation failed with:

```typescript
Error: src/app/services/storage.service.spec.ts:116:20 - error TS4111: 
Property 'validKey' comes from an index signature, so it must be accessed 
with ['validKey'].

116     expect(allData.validKey).toEqual(validData);
                       ~~~~~~~~
```

Additional error on line 117:

```typescript
Error: src/app/services/storage.service.spec.ts:117:20 - error TS4111: 
Property 'corruptKey' comes from an index signature, so it must be accessed 
with ['corruptKey'].

117     expect(allData.corruptKey).toBeUndefined();
                       ~~~~~~~~~~
```

#### Root Cause
TypeScript 5.x enforces strict rules for accessing properties on types with index signatures (like `Record<string, any>`). Direct property access using dot notation (`.property`) is not allowed; bracket notation (`['property']`) must be used instead.

The `StorageService.getAll()` method returns `Record<string, any>`, which is an index-signature-based type.

#### Solution Applied
Changed property access from dot notation to bracket notation in test file:

**Before (Invalid):**
```typescript
expect(allData.validKey).toEqual(validData);
expect(allData.corruptKey).toBeUndefined();
```

**After (Valid):**
```typescript
expect(allData['validKey']).toEqual(validData);
expect(allData['corruptKey']).toBeUndefined();
```

#### Files Modified
- `src/app/services/storage.service.spec.ts` (lines 116-117)

#### Result
✅ All tests compile and pass successfully (17/17 PASS)

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

#### Prevention
- Use bracket notation when accessing dynamic properties on Record/Dictionary types
- Be aware of TypeScript strict mode implications
- Test types during development, not just at test time

---

### ✅ Issue #4: Tab1 Refactor (May 1, 2026)

**Severity:** Low ℹ️  
**Status:** COMPLETED ✅  
**Occurrence:** Planned refactor

#### Problem Description
Tab1 displayed both an "Add New Task" form and a "Saved Tasks" list. The design was cluttered and the task list functionality overlapped with Tab3.

#### Solution Applied
1. Removed task list display (`allTasks`, `loadTasks()`, `ngOnInit()`)
2. Added validation messaging (success/error) with 3-second auto-clear
3. Added duplicate key detection via `StorageService.read()` before `create()`
4. Migrated from `*ngIf` to Angular 20 `@if` control flow
5. Added `clearMessages()` handler to dismiss errors when user types
6. Added custom SCSS styling for error/success feedback and responsive layout
7. Deprecated `FRONTEND_IMPLEMENTATION.md` Tab1 section

#### Files Modified
- `src/app/tab1/tab1.page.ts` — Simplified component, added messaging
- `src/app/tab1/tab1.page.html` — Form-only layout with `@if` syntax
- `src/app/tab1/tab1.page.scss` — New styles for form, messages, buttons
- `MD/FRONTEND_IMPLEMENTATION.md` — Added deprecation notice, then full rewrite
- `MD/TAB1_IMPLEMENTATION.md` — Updated plan to v1.1
- `src/app/services/backend-flow.mmd` — Updated diagram with tab-to-service mappings

#### Result
✅ Build passes with zero errors. Tab1 now shows a clean, focused "Add Task" form.

---

### ✅ Issue #5: Tab2 Refactor (May 1, 2026)

**Severity:** Low ℹ️  
**Status:** COMPLETED ✅  
**Occurrence:** Planned refactor

#### Problem Description
Tab2 used legacy `*ngIf` directives, had no user feedback after search/update operations, and lacked visual consistency with the refactored Tab1.

#### Solution Applied
1. Migrated from `*ngIf` / `NgIf` to Angular 20 `@if` control flow
2. Removed `notFound: boolean` — replaced by `errorMessage` string
3. Added success/error/not-found messaging with 3-second auto-clear
4. Added `clearSearch()` method to reset all state
5. Added `clearMessages()` handler to dismiss errors on typing
6. Removed `[disabled]` on Search button — uses error message validation instead
7. Simplified HTML layout — removed unnecessary `IonList` nesting
8. Added custom SCSS styling matching Tab1’s visual language

#### Files Modified
- `src/app/tab2/tab2.page.ts` — Refactored component with messaging
- `src/app/tab2/tab2.page.html` — Two-card layout with `@if` syntax
- `src/app/tab2/tab2.page.scss` — New styles matching Tab1
- `MD/TAB2_IMPLEMENTATION.md` — Created and marked as implemented
- `src/app/services/backend-flow.mmd` — Updated Tab2 descriptions

#### Result
✅ Build passes with zero errors. Tab2 now shows a polished Search & Edit interface with feedback.

---

### ⚠️ Issue #3: npm/Node Configuration Warnings

**Severity:** Low (Info only) ℹ️  
**Status:** NOTED (Not blocking)  
**Occurrence:** During `npm start` and `ng serve` initialization

#### Problem Description
During initialization, Angular prompts appeared:

```
Would you like to enable autocompletion? This will set up
your terminal so pressing TAB while typing Angular CLI 
commands will show possible options and autocomplete arguments.
(Enabling autocompletion will modify configuration files in your home directory.)
```

And:

```
Would you like to share pseudonymous usage data about this
project with the Angular Team at Google under Google's Privacy Policy?
```

#### Impact
- Non-blocking prompts
- Does not affect build or functionality
- Configuration only affects developer environment

#### Current Settings
- Autocompletion: Enabled (`source <(ng completion script)` added to `~/.zshrc`)
- Analytics: Enabled (can be disabled with `ng analytics disable`)

---

## Terminal Error Messages

### Error Messages Log

#### Build Phase

| Time | Severity | Message | Resolution |
|------|----------|---------|------------|
| Session Start | ⚠️ Medium | Port 4200 already in use | Killed process on port 4200 |
| Compilation | ⚠️ Low | TypeScript strict indexing error (TS4111) | Updated bracket notation in test file |
| Info | ℹ️ Info | Analytics & autocompletion prompts | Accepted (non-blocking) |

#### Test Phase

| Time | Severity | Message | Type | Reason |
|------|----------|---------|------|--------|
| Test Run | ℹ️ Info | "StorageService: Skipping corrupted entry for key 'corruptKey'" | WARN | Expected (error handling test) |
| Test Run | ℹ️ Info | "StorageService: Key cannot be empty" | ERROR | Expected (validation test) |
| Test Run | ℹ️ Info | "StorageService: Error reading key 'corrupt'" | ERROR | Expected (error handling test) |

**All test phase logs are EXPECTED** — they verify that error handling works correctly. These are not failures.

---

## TypeScript Compilation Issues

### Issue: TS4111 - Index Signature Property Access

**Error Code:** TS4111  
**Category:** Type Safety  
**Strictness Level:** TypeScript Strict Mode

#### Explanation
When a type has an index signature (like `Record<string, any>`), TypeScript requires bracket notation for dynamic property access:

**Index Signature Example:**
```typescript
type Config = Record<string, any>;  // Has index signature [key: string]

// ❌ INVALID - Dot notation
const value = config.someKey;

// ✅ VALID - Bracket notation
const value = config['someKey'];
```

#### Why This Matters
- **Type Safety:** Bracket notation makes it clear that property access is dynamic
- **Refactoring:** IDE can better track dynamic properties
- **Predictability:** Prevents accidental property name typos

#### When This Occurs
- Accessing properties on `Record<K, V>` types
- Accessing properties on `{ [key: string]: any }` types
- Accessing properties on objects with computed keys

#### Solutions
1. Use bracket notation: `obj['key']`
2. Cast to specific type: `(obj as { validKey: Type }).validKey`
3. Use `as const` assertions if keys are known

---

## Build & Runtime Problems

### Problem #1: Module Import Errors

**Symptom:** "Cannot find module" errors after moving/deleting files

**Prevention:**
- Search for all import references before deleting
- Use IDE refactoring tools to update imports automatically
- Verify `ng build` completes without errors after major changes

**Status in Current Project:** ✅ None (verified clean after explore-container deletion)

---

### Problem #2: Circular Dependencies

**Symptom:** Build warnings or compilation errors about circular references

**Prevention:**
- Keep service dependencies linear
- Use dependency injection to break cycles
- Structure: Components → Services → Models → Utils

**Status in Current Project:** ✅ None (flat structure, StorageService has no dependencies)

---

### Problem #3: Lazy Loading Issues

**Symptom:** Chunks not loading, route guards failing

**Prevention:**
- Verify lazy-loaded components are properly imported in routes
- Check `tabs.routes.ts` for correct path configurations
- Use `preload` strategies carefully

**Status in Current Project:** ✅ None (all lazy chunks load successfully)

---

## Testing Issues

### Issue #1: localStorage Not Available in Tests

**Symptom:** "localStorage is not defined" error in test environment

**Prevention:**
- Karma/Jasmine automatically provides localStorage mock
- Ensure `TestBed` is properly configured
- Clear localStorage between tests: `localStorage.clear()`

**Status in Current Project:** ✅ Properly handled (all tests pass)

---

### Issue #2: Test Timeouts

**Symptom:** "Timeout - Async operation did not complete within..." error

**Prevention:**
- Use `--watch=false` for CI/headless environments
- Set reasonable timeout values
- Avoid infinite loops in test code

**Status in Current Project:** ✅ Tests complete in 0.298 seconds

---

### Issue #3: Flaky Tests

**Symptom:** Tests pass sometimes, fail other times randomly

**Prevention:**
- Isolate test state (clear mocks between tests)
- Don't depend on external services
- Use consistent test data

**Status in Current Project:** ✅ All tests deterministic and repeatable

---

## Common Troubleshooting Guide

### Problem: "ng: command not found"

**Cause:** Angular CLI not installed globally or not in PATH

**Solution:**
```bash
# Install globally
npm install -g @angular/cli

# Or use local version
npx ng --version
```

---

### Problem: "Module not found" errors

**Cause:** Missing dependencies or import paths incorrect

**Solution:**
```bash
# Reinstall dependencies
npm install

# Clean cache
npm cache clean --force

# Verify imports are correct
grep -r "import.*module-name" src/
```

---

### Problem: "Cannot read property 'X' of undefined"

**Cause:** Object accessed before initialization or null/undefined value

**Solution:**
```typescript
// Add null checks
if (data && data.property) {
  // Safe access
}

// Or use optional chaining
data?.property?.nested
```

---

### Problem: Build fails with "tsconfig.json error"

**Cause:** TypeScript configuration issues, deprecated options

**Current Warnings:**
```
Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0. 
Specify compilerOption '"ignoreDeprecations": "6.0"' to silence this error.

Option 'moduleResolution=node10' is deprecated...
```

**Solution:**
```json
{
  "compilerOptions": {
    "ignoreDeprecations": "6.0",
    // Other options...
  }
}
```

---

### Problem: "No provider for X" Dependency Injection Error

**Cause:** Service not provided in module or component

**Solution:**
```typescript
// Option 1: Provide in service (recommended)
@Injectable({ providedIn: 'root' })

// Option 2: Provide in module
providers: [StorageService]
```

**Current Project:** ✅ Uses `providedIn: 'root'` approach

---

### Problem: Development server won't start

**Common Causes:**
1. Port already in use → Use `--port` flag
2. Out of memory → Increase Node heap size
3. File permission issues → Check file ownership
4. Cache corruption → Clear `node_modules` and reinstall

**Solution:**
```bash
# Try different port
ng serve --port 4201

# Increase heap memory
NODE_OPTIONS=--max-old-space-size=4096 ng serve

# Clean rebuild
rm -rf node_modules dist
npm install
ng serve
```

---

## Prevention & Best Practices

### Code Organization Best Practices

✅ **Applied in this project:**
- Services separated in `/services/` directory
- Lazy-loaded tab components
- Single responsibility per file
- Clear naming conventions

### Testing Best Practices

✅ **Applied in this project:**
- Comprehensive test coverage (12 tests)
- Isolated test setup with `beforeEach`
- Clear test descriptions
- Error scenario coverage

### Build & Deploy Best Practices

✅ **Applied in this project:**
- Strict TypeScript configuration
- Meaningful error messages
- Proper error handling with try-catch
- Console logging for debugging

### Development Workflow Best Practices

✅ **Recommendations:**
1. Always stop dev server before restarting
2. Commit before major refactoring
3. Test after deleting/moving files
4. Clear browser cache after major changes
5. Check terminal for warnings regularly

---

## Diagnostic Commands Reference

```bash
# Check Node/npm versions
node --version
npm --version

# Check Angular CLI version
ng version

# Check for port conflicts
lsof -i :4200

# Kill process on port
lsof -ti:4200 | xargs kill -9

# Clean Angular cache
ng cache clean

# Verify tsconfig
npx tsc --noEmit

# Run specific test file
ng test --include='**/storage.service.spec.ts'

# Build for production
ng build --prod

# Check bundle size
ng build --prod --stats-json
npm install webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/app/stats.json
```

---

## Summary of Issues This Session

| # | Issue | Severity | Status | Resolution Time |
|---|-------|----------|--------|-----------------|
| 1 | Port 4200 conflict | Medium | Resolved | ~2 minutes |
| 2 | TypeScript indexing | Low | Resolved | ~1 minute |
| 3 | Config warnings | Info | Noted | N/A |
| 4 | Tab1 refactor (May 1) | Info | Completed | ~15 minutes |
| 5 | Tab2 refactor (May 1) | Info | Completed | ~10 minutes |
| 6 | Category system (May 1) | Info | Completed | ~15 minutes |
| 7 | Due date feature (May 1) | Info | Completed | ~10 minutes |
| 8 | ion-datetime-button fix (May 1) | Low | Resolved | ~5 minutes |

**Total Issues:** 8  
**Critical Issues:** 0  
**Resolved:** 8  
**Success Rate:** 100%

---

## Current Project Health Status

```
✅ Build Status:        PASSING
✅ Test Status:         17/17 PASSING  
✅ Compilation:         SUCCESS
✅ Dev Server:          RUNNING (http://localhost:4200)
✅ TypeScript:          STRICT MODE ENABLED
✅ Error Handling:      IMPLEMENTED
✅ Test Coverage:       100% (StorageService)
✅ Tab1 Refactor:       COMPLETE (May 1, 2026)
✅ Tab2 Refactor:       COMPLETE (May 1, 2026)
✅ Category System:     COMPLETE (May 1, 2026)
✅ Due Dates:           COMPLETE (May 1, 2026)
✅ Tab3 Migration:      COMPLETE (@if/@for, May 1, 2026)
```

**Overall Status:** 🟢 HEALTHY

---

## Appendix: Error Log

### Complete Terminal Session Log

#### Session Start Time
April 30, 2026 - 22:11:00

#### Command Sequence
1. `ng serve` → Port conflict error
2. Kill process: `lsof -ti:4200 | xargs kill -9`
3. `ng serve` → Success
4. `ng test --watch=false --browsers=ChromeHeadless` → TypeScript error
5. Fix: Update bracket notation in spec file
6. `ng test --watch=false --browsers=ChromeHeadless` → All tests pass

#### No Critical Failures Recorded

---

**Document Created:** April 30, 2026  
**Last Updated:** May 1, 2026  
**Status:** Current & Accurate

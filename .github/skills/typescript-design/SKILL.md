---
name: typescript-design
description: TypeScript and React design conventions for the PeerSend.io frontend. Use when writing, reviewing, or modifying any TypeScript or React code in the web/ directory.
---

You are writing TypeScript/React code for PeerSend.io. Follow these conventions exactly.

## Code Style

### Formatting

- Double quotes, no trailing commas, 100 character print width, arrow parens always
- Curly braces required for multi-line blocks (`curly: "multi-line"`)
- Strict equality only (`===`, never `==`)
- No `console.*` calls (use the scoped logger instead). No `debugger` statements
- Max 5 ESLint warnings allowed across the entire project

### Functions & Types

- **Every function must have an explicit return type** — enforced as an ESLint error, no exceptions
- Components return `React.ReactNode`. Callbacks and arrow functions must be typed too
- Named exports only — no default exports. Barrel files use `export * from`. Type-only exports use `export type`
- Libraries and state must have their own `types.ts` file for library specific interfaces, unless these are generic they are placed in `@/types/misc.ts`

### JSX

- Self-closing components: `<Component />` not `<Component></Component>`
- Boolean shorthand: `<Input disabled />` not `<Input disabled={true} />`
- No unnecessary curly braces: `<Text>hello</Text>` not `<Text>{"hello"}</Text>`

### Naming

| Entity               | Convention                 | Example                                              |
| -------------------- | -------------------------- | ---------------------------------------------------- |
| Files & directories  | `kebab-case`               | `use-app-state.ts`, `file-transfer/`                 |
| Components           | PascalCase function        | `SessionStatusBar`                                   |
| Hooks                | `use` prefix, camelCase    | `useAppState`, `useTimeDistance`                     |
| Types & interfaces   | PascalCase                 | `AppState`, `ConnectionErrorData`                    |
| Constants            | `UPPER_SNAKE_CASE`         | `DEFAULT_SESSION_STATE`                              |
| Reducer action types | `UPPER_SNAKE_CASE` strings | `SET_SESSION_INFORMATION`, `RESET_CONNECTING_STATES` |
| Event handlers       | `handle` prefix            | `handleLastError`, `handleClick`                     |
| Store instances      | camelCase                  | `appState`, `fileTransferState`                      |

### Imports

- Use the `@/*` path alias for all `src/` imports — never traverse upward with `../../`
- Type-only imports use `import type`

## File Organisation

- One component/hook/utility per file
- Co-locate types with their feature; put shared types in `types/`
- State stores live in `state/{feature-name}/` with their own types and actions
- There must be one major React component per file, unless there is reason for multiple React components per file, such as if they are one line components or all share the same parent component that may be rendered as a list or different heading sizes etc or they are shared logic. Typescript files can contain multiple functions

## Architecture & Patterns

### State Management

State uses a custom `StateStore<S, M>` abstract class — not React Context, not Redux. Stores are singleton class instances that live outside React, consumed in components via `useSyncExternalStore`. Dispatch is type-safe: payload type is inferred from the action map.

### Hooks

- State hooks bind to external stores via `useSyncExternalStore`
- Utility hooks manage local effects (intervals, subscriptions) with proper cleanup in the return function
- `useDefinedContext()` validates that a required React context is not undefined

### Routing

React Router v7 with loader-based guards. Loaders run before render and use `throw redirect()` for access control — never render an unauthorised view.

### UI Framework

- Mantine v8 is the primary component library (teal primary color, Geist font, forced light scheme)
- TailwindCSS v4 for utility classes alongside Mantine
- Framer Motion for animations, Lucide React for icons

## Error Handling

- Connection/session errors stored as `ConnectionErrorData` (`{ title, message }`) in app state
- Displayed via Mantine `notifications.show()` with `color: "red"`, `position: "top-right"`
- Router loaders throw `redirect()` on failure — never render an unauthorised view
- `useDefinedContext()` throws with a descriptive message if a required context is undefined
- Non-critical failures logged via `createLogger(scope)` — never use raw `console.*`

## Type Utilities

Reuse existing utilities from `@/types/misc` before creating your own

## Logging & Env Vars

Use `createLogger(scope)` from `@/utils/logger`. Log level is controlled by `VITE_LOG_LEVEL`.

Access env vars via `envVar` from `@/config/constants`, not directly via `import.meta.env`.

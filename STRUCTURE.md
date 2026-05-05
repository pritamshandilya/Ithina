## Purpose

This document defines the **canonical architecture and repository structure** for this frontend codebase.

All implementations, refactors, and new features **must follow this structure**.

The project uses:

* **React**
* **TypeScript**
* **Vite**
* **TanStack Router**
* **TanStack Query**

Models modifying the codebase must **preserve this architecture and dependency direction**.

If the existing code deviates from this structure, it should be **refactored toward this structure**.

---

# 1. Architectural Principles

The application follows a **layered architecture with domain grouping**.

Primary goals:

* predictable structure
* strict separation of UI and data logic
* clear dependency direction
* scalable feature organization

High-level layers:

```
routes → components/hooks → queries/lib → models/types
```

Each layer has a **strict responsibility**.

---

# 2. Technology Stack

The project uses the following core technologies.

| Layer        | Tool            |
| ------------ | --------------- |
| UI           | React           |
| Routing      | TanStack Router |
| Server State | TanStack Query  |
| Language     | TypeScript      |
| Build Tool   | Vite            |

These tools **must not be replaced without architectural approval**.

---

# 3. Canonical Repository Structure

The repository must follow this structure.

```
/
├── docs/
│   ├── architecture.md
│   └── structure.md
│
├── public/
│
├── src/
│
│   ├── main.tsx
│   ├── App.tsx
│   ├── bootstrap.ts
│   ├── global.css
│   ├── routeTree.gen.ts
│
│   ├── assets/
│
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   └── <domain>/**/index.tsx
│
│   ├── components/
│   │   ├── ui/
│   │   ├── layouts/
│   │   ├── navigation/
│   │   ├── errors/
│   │   └── <domain>/
│
│   ├── queries/
│   │   ├── <domain>/
│   │   └── shared.ts
│
│   ├── hooks/
│   │   ├── <domain>/
│   │   └── shared hooks
│
│   ├── providers/
│   │   └── auth/
│
│   ├── context/
│
│   ├── store/
│   │   ├── index.ts
│   │   └── reducers/
│
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── notifications/
│   │   └── utils.ts
│
│   ├── models/
│
│   ├── types/
│
│   └── exceptions/
│
├── types/
│   └── vite-env.d.ts
│
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
├── prettier.config.js
├── components.json
├── .env.example
└── package.json
```

This structure is **the source of truth** for organizing the application.

---

# 4. Layer Responsibilities

## Routes

Location

```
src/routes/*
```

Routes act as **page controllers**.

Responsibilities:

* route definitions
* page layout composition
* query loading
* mutation wiring
* navigation

Routes **must not contain API logic**.

Routes should use **TanStack Router loaders and hooks**.

Example:

```tsx
export const Route = createFileRoute("/products")({
  component: ProductsPage,
})
```

---

## Components

Location

```
src/components/*
```

Responsibilities:

* UI rendering
* UI composition
* local state

Components must remain **pure UI**.

Components **must not perform API calls**.

---

## Queries

Location

```
src/queries/*
```

Responsibilities:

* API requests
* request/response handling
* TanStack Query hooks

All server communication **must be centralized here**.

Example:

```
src/queries/products/getProducts.ts
```

---

## Hooks

Location

```
src/hooks/*
```

Responsibilities:

* reusable behaviors
* orchestration between queries, stores, and helpers

Example:

```
useDelete.ts
useTenantScope.ts
```

---

## Store

Location

```
src/store/*
```

Responsibilities:

* global client state
* workflow state
* UI state shared across routes

This layer must **not store server state**.

Server state belongs to **TanStack Query**.

---

## Providers

Location

```
src/providers/*
```

Responsibilities:

* authentication providers
* integration providers
* cross-app services

Providers are registered in **main.tsx**.

---

## Context

Location

```
src/context/*
```

Used for React contexts that do not belong in the global store.

---

## Lib

Location

```
src/lib/*
```

Responsibilities:

* API clients
* framework adapters
* utilities
* shared helpers

This layer should remain **framework-agnostic when possible**.

---

## Models

Location

```
src/models/*
```

Responsibilities:

* domain entities
* business objects

Example:

```
Product.ts
Order.ts
User.ts
```

---

## Types

Location

```
src/types/*
```

Responsibilities:

* shared TypeScript types
* utility types

---

## Exceptions

Location

```
src/exceptions/*
```

Responsibilities:

* structured error classes

Example:

```
ApiError.ts
ValidationError.ts
```

---

# 5. Dependency Direction

Dependencies must follow this direction.

```
routes
   ↓
components / hooks
   ↓
queries / lib
   ↓
models / types
```

Forbidden dependencies:

* queries must not import UI components
* models must not import application code
* components must not import routes
* lib must not import UI or routes

---

# 6. TanStack Router Conventions

Routes follow **file-based routing**.

Pattern:

```
src/routes/<segment>/.../index.tsx
```

Examples:

```
src/routes/index.tsx
src/routes/products/index.tsx
src/routes/products/$productId/index.tsx
```

Root route must exist:

```
src/routes/__root.tsx
```

Responsibilities:

* auth/session checks
* root layout
* error boundaries

---

# 7. TanStack Query Conventions

All server state uses **TanStack Query**.

Rules:

* query functions live in `src/queries`
* queries are grouped by domain
* components never call APIs directly

Example structure:

```
src/queries/products/
   getProducts.ts
   getProduct.ts
   createProduct.ts
   updateProduct.ts
```

---

# 8. Application Bootstrap

Application initialization occurs in:

```
src/main.tsx
```

Provider stack example:

```
<QueryClientProvider>
  <AuthProvider>
    <StoreProvider>
      <RouterProvider>
        <App />
      </RouterProvider>
  </StoreProvider>
</AuthProvider>
```

HTTP configuration must be centralized in:

```
src/bootstrap.ts
```

This file configures:

* API base URL
* interceptors
* authentication headers

---

# 9. Domain Organization

Features must be organized by domain.

Example domains:

```
products
orders
customers
settings
```

Each domain should include:

```
routes/<domain>
components/<domain>
queries/<domain>
hooks/<domain>
```

This keeps the system **vertically organized by feature**.

---

# 10. Naming Conventions

Rules:

* route segments use **kebab-case**
* domain folders must match route names
* shared UI belongs in `components/ui`

Example:

```
routes/products
components/products
queries/products
hooks/products
```

---

# 11. Environment Configuration

Environment variables must be defined in:

```
.env.example
```

All client variables must use the prefix:

```
VITE_
```

Example:

```
VITE_API_BASE_URL
VITE_AUTH_URL
VITE_APP_MODE
VITE_ANALYTICS_KEY
```

---

# 12. Refactoring Rules

When modifying the codebase:

1. Preserve the architectural layers.
2. Move API logic into `queries`.
3. Move reusable logic into `hooks`.
4. Move UI primitives into `components/ui`.
5. Move domain entities into `models`.
6. Remove cross-layer imports that violate dependency direction.

The structure defined here is the **target architecture**.
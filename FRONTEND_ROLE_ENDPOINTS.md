# Frontend Role and Endpoint Contract

Use this document in the frontend as the source of truth for role-based UI behavior and API integration. It reflects the current backend implementation in this repository.

## Current backend structure (routing + scope)

- Route modules:
  - `app/routes/auth.py`
  - `app/routes/organizations.py`
  - `app/routes/stores.py`
  - `app/routes/shelves.py`
  - `app/routes/users.py`
- All protected routes are mounted behind `require_current_user` in `app/routes/__init__.py`.
- Store-scoped routes use header-based scope via `require_store_scope` in `app/core/store_scope.py`.
- Store-scoped routes require `X-Store-Id` (UUID), not `/{store_id}` path params.

## Valid roles

The backend supports exactly these user roles:

- `admin`
- `maker`
- `checker`

No other role values are valid.

## Core integration rules

- All protected endpoints require a bearer token.
- If the user is inactive, protected requests fail with `403` and `User account is disabled`.
- If the user lacks a required role guard, the API returns `403` with `Insufficient role`.
- Organization boundaries are enforced server-side. Cross-organization store/user access returns `404`.
- `maker` and `checker` are both store-assigned roles.
- Store-scoped requests require `X-Store-Id`; missing/invalid header returns `400`.
- For store-scoped requests, unassigned `maker`/`checker` users receive `403` with `Store access denied`.

## Role descriptions

### Admin

Admin is the organization-wide management role.

Admins can:

- log in
- fetch their own authenticated profile
- fetch organization details
- view all stores in their organization
- open a specific store via `GET /store` (with `X-Store-Id`)
- create stores
- update stores
- delete stores
- assign makers and checkers to stores (one user per call)
- remove makers and checkers from stores (one user per call)
- list all users in their organization
- filter organization users by role via `user_type`
- create users
- invite users
- view individual user details
- update users
- deactivate users (soft delete)
- view store user lists for any store in their organization
- create, update, and delete shelves
- list and view shelves

Admins cannot:

- assign stores to admin users
- add admin users to stores
- change their own role away from `admin`
- deactivate themselves
- delete themselves

### Maker

Maker is a store-scoped operational role.

Makers can:

- log in
- fetch their own authenticated profile
- fetch organization details
- view only stores they are assigned to
- open only stores they are assigned to
- view the user list for stores they are assigned to
- list shelves in assigned stores
- view shelf details in assigned stores

Makers cannot:

- view stores they are not assigned to
- create/update/delete stores
- assign/remove users to/from stores
- list all organization users
- create/invite/update/deactivate users
- view arbitrary user details
- create/update/delete shelves

### Checker

Checker is a store-scoped operational role.

Checkers can:

- log in
- fetch their own authenticated profile
- fetch organization details
- view only stores they are assigned to
- open only stores they are assigned to
- view the user list for stores they are assigned to
- list shelves in assigned stores
- view shelf details in assigned stores
- create shelves in assigned stores
- update shelves in assigned stores
- delete shelves in assigned stores

Checkers cannot:

- view stores they are not assigned to
- create/update/delete stores
- assign/remove users to/from stores
- list all organization users
- create/invite/update/deactivate users
- view arbitrary user details

## Frontend implementation guidance

- Treat `admin` as the only role with user/store management permissions.
- Treat `maker` and `checker` as store-scoped roles.
- Do not expose store or user management UI to `maker` or `checker`.
- Do not treat `maker` and `checker` as equal for shelves:
  - `checker`: mutate + read shelves
  - `maker`: read-only shelves
- For `maker` and `checker`, expect `GET /stores` to return only assigned stores.
- For store-scoped routes, always send `X-Store-Id`.
- Backend currently uses `/store` and `/store/users` (singular); old `/{store_id}` routes are removed.

## Endpoint contract by area

### Public authentication endpoints

These do not require an existing access token.

- `POST /auth/login` (JSON body)
- `POST /auth/token` (OAuth2 form data)

### Authenticated endpoints available to all active users

- `GET /auth/me`
- `GET /organization`
- `GET /stores`
- `GET /store` (requires `X-Store-Id`)
- `GET /store/users` (requires `X-Store-Id`)
- `GET /shelves` (requires `X-Store-Id`)
- `GET /shelves/{shelf_id}` (requires `X-Store-Id`)

### Admin-only endpoints

- `POST /stores`
- `PUT /store` (requires `X-Store-Id`)
- `DELETE /store` (requires `X-Store-Id`)
- `POST /store/users/{user_id}` (requires `X-Store-Id`)
- `DELETE /store/users/{user_id}` (requires `X-Store-Id`)
- `GET /users`
- `POST /users`
- `POST /users/invite`
- `GET /users/{user_id}`
- `PUT /users/{user_id}`
- `DELETE /users/{user_id}`

### Admin + checker shelf mutation endpoints

- `POST /shelves` (requires `X-Store-Id`)
- `PUT /shelves/{shelf_id}` (requires `X-Store-Id`)
- `DELETE /shelves/{shelf_id}` (requires `X-Store-Id`)

## Endpoint behavior by role

### `POST /auth/login`

- `admin`: allowed
- `maker`: allowed
- `checker`: allowed

### `POST /auth/token`

- `admin`: allowed
- `maker`: allowed
- `checker`: allowed

### `GET /auth/me`

- `admin`: allowed
- `maker`: allowed
- `checker`: allowed

### `GET /organization`

- `admin`: allowed
- `maker`: allowed
- `checker`: allowed

### `GET /stores`

- `admin`: allowed, returns all stores in the organization
- `maker`: allowed, returns only assigned stores
- `checker`: allowed, returns only assigned stores

### `GET /store` (`X-Store-Id`)

- `admin`: allowed for any store in same organization
- `maker`: allowed only if assigned to that store
- `checker`: allowed only if assigned to that store

### `GET /store/users` (`X-Store-Id`)

- `admin`: allowed for any store in same organization
- `maker`: allowed only if assigned to that store
- `checker`: allowed only if assigned to that store

Supports optional query param:

- `user_type=admin|maker|checker`

Returned users for a store can include:

- all admins in the organization
- assigned makers for that store
- assigned checkers for that store

### `POST /stores`

- `admin`: allowed
- `maker`: forbidden
- `checker`: forbidden

### `PUT /store` (`X-Store-Id`)

- `admin`: allowed
- `maker`: forbidden
- `checker`: forbidden

### `DELETE /store` (`X-Store-Id`)

- `admin`: allowed
- `maker`: forbidden
- `checker`: forbidden

### `POST /store/users/{user_id}` (`X-Store-Id`)

- `admin`: allowed
- `maker`: forbidden
- `checker`: forbidden

Notes:

- only active users can be added
- only users with role `maker` or `checker` can be added
- admin users cannot be added to stores

### `DELETE /store/users/{user_id}` (`X-Store-Id`)

- `admin`: allowed
- `maker`: forbidden
- `checker`: forbidden

Notes:

- only store assignments for makers and checkers are removable

### `GET /users`

- `admin`: allowed
- `maker`: forbidden
- `checker`: forbidden

Supports optional query param:

- `user_type=admin|maker|checker`

### `POST /users`

- `admin`: allowed
- `maker`: forbidden
- `checker`: forbidden

Notes:

- admins may create `admin`, `maker`, or `checker` users
- only `maker` and `checker` may receive `store_ids`

### `POST /users/invite`

- `admin`: allowed
- `maker`: forbidden
- `checker`: forbidden

Behavior is currently the same as `POST /users`.

### `GET /users/{user_id}`

- `admin`: allowed
- `maker`: forbidden
- `checker`: forbidden

### `PUT /users/{user_id}`

- `admin`: allowed
- `maker`: forbidden
- `checker`: forbidden

Notes:

- request is partial-update style; at least one field is required
- only `maker` and `checker` may have `store_ids`
- changing a user to `admin` removes store assignments
- admins cannot change their own role away from `admin`
- admins cannot deactivate themselves

### `DELETE /users/{user_id}`

- `admin`: allowed
- `maker`: forbidden
- `checker`: forbidden

Notes:

- this is a soft delete by deactivation
- store assignments for that user are removed
- admins cannot delete themselves

### `GET /shelves` (`X-Store-Id`)

- `admin`: allowed for any store in same organization
- `maker`: allowed only if assigned to store
- `checker`: allowed only if assigned to store

Supports optional query param:

- `fixture_id=<uuid>`

### `GET /shelves/{shelf_id}` (`X-Store-Id`)

- `admin`: allowed for any store in same organization
- `maker`: allowed only if assigned to store
- `checker`: allowed only if assigned to store

### `POST /shelves` (`X-Store-Id`)

- `admin`: allowed
- `maker`: forbidden
- `checker`: allowed only if assigned to store

### `PUT /shelves/{shelf_id}` (`X-Store-Id`)

- `admin`: allowed
- `maker`: forbidden
- `checker`: allowed only if assigned to store

### `DELETE /shelves/{shelf_id}` (`X-Store-Id`)

- `admin`: allowed
- `maker`: forbidden
- `checker`: allowed only if assigned to store

## Recommended frontend permission model

Use this permission map in the frontend:

```ts
type Role = "admin" | "maker" | "checker";

const permissionsByRole: Record<
  Role,
  {
    canManageUsers: boolean;
    canManageStores: boolean;
    canAssignStoreUsers: boolean;
    canViewAllStores: boolean;
    canReadShelves: boolean;
    canMutateShelves: boolean;
    requiresStoreAssignmentForStoreAccess: boolean;
  }
> = {
  admin: {
    canManageUsers: true,
    canManageStores: true,
    canAssignStoreUsers: true,
    canViewAllStores: true,
    canReadShelves: true,
    canMutateShelves: true,
    requiresStoreAssignmentForStoreAccess: false,
  },
  maker: {
    canManageUsers: false,
    canManageStores: false,
    canAssignStoreUsers: false,
    canViewAllStores: false,
    canReadShelves: true,
    canMutateShelves: false,
    requiresStoreAssignmentForStoreAccess: true,
  },
  checker: {
    canManageUsers: false,
    canManageStores: false,
    canAssignStoreUsers: false,
    canViewAllStores: false,
    canReadShelves: true,
    canMutateShelves: true,
    requiresStoreAssignmentForStoreAccess: true,
  },
};
```

## Summary for frontend Codex

If you are generating frontend code against this backend:

- show store/user management screens only for `admin`
- show store lists for all logged-in users
- expect `maker` and `checker` store lists to already be filtered to assigned stores
- always send `X-Store-Id` for store-scoped endpoints
- build against `/store` and `/store/users` (not `/stores/{store_id}` routes)
- show shelf read UI to `maker`, `checker`, and `admin`
- show shelf create/update/delete UI to `checker` and `admin` only
- still rely on backend enforcement for all permissions
- treat `POST /users/invite` as equivalent to `POST /users`

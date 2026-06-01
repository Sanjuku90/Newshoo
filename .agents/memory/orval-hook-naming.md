---
name: Orval Generated Hook Naming
description: How orval-generated hooks are named for GET queries vs mutations in this project — prevents wrong imports.
---

## Rule
The orval-generated API client (`lib/api-client-react/src/generated/api.ts`) follows this naming convention:

- **Queries (GET):** `use` + PascalCase of the underlying async function name.
  - `getMe` → `useGetMe`
  - `listPlans` → `useListPlans`
  - `listInvestments` → `useListInvestments`
  - `listDeposits` → `useListDeposits`
  - `listWithdrawals` → `useListWithdrawals`
  - `listReferrals` → `useListReferrals`
  - `getDashboardSummary` → `useGetDashboardSummary`
  - `listTransactions` → `useListTransactions`
  - `getKycStatus` → `useGetKycStatus`
  - `listTickets` → `useListTickets`
  - `getTicket(id)` → `useGetTicket` (takes `id: number`)
  - `getAdminStats` → `useGetAdminStats`
  - `listAdminUsers` → `useListAdminUsers`
  - `listAdminDeposits` → `useListAdminDeposits`
  - `listAdminWithdrawals` → `useListAdminWithdrawals`
  - `listAdminKyc` → `useListAdminKyc`
  - `listAdminTickets` → `useListAdminTickets`

- **Mutations (POST/PUT/PATCH/DELETE):** `use` + PascalCase of function name.
  - e.g. `useRegister`, `useLogin`, `useLogout`, `useCreateInvestment`, etc.

## Mutation call signatures
All orval mutations wrap the body in `{ data: <body> }`:
- Body-only: `mutate({ data: { email, password } })`
- Path param + body: `mutate({ id: number, data: { ... } })`
- Path param only (no body): `mutate({ id: number })`

**Why:** Orval's `custom-instance` template generates `MutationFunction<Result, {data: BodyType<Input>}>` for body mutations and `{id: number}` for path-only ones. Wrong signatures cause TypeScript errors and silent runtime failures.

**How to apply:** Any time you import from `@workspace/api-client-react` for a GET, check the function name in generated/api.ts and prefix with `use`. For mutations, always wrap body in `{ data: ... }` and add `id` for path params.

# Build8 RBAC Permissions Matrix

## Roles

| Role | Slug | Description |
|------|------|-------------|
| Founder | `founder` | Full system access including equity management |
| Admin | `admin` | Administrative access, user management |
| Project Manager | `project_manager` | Client, project, and task management |
| Developer | `developer` | Project and task access |
| Designer | `designer` | Project and task access |
| Finance | `finance` | Financial records, invoices, reports |

## Permissions Matrix

| Permission | Founder | Admin | PM | Developer | Designer | Finance |
|-----------|:-------:|:-----:|:--:|:---------:|:--------:|:-------:|
| **Dashboard** |
| dashboard:view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Clients** |
| clients:view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| clients:create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| clients:update | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| clients:delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Leads** |
| leads:view | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| leads:create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| leads:update | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| leads:delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Projects** |
| projects:view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| projects:create | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| projects:update | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| projects:delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Tasks** |
| tasks:view | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| tasks:create | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| tasks:update | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| tasks:delete | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **People** |
| people:view | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| people:create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| people:update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| people:delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Candidates** |
| candidates:view | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| candidates:create | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| candidates:update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| candidates:delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Finance** |
| finance:view | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| finance:create | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| finance:update | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| finance:delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Equity** |
| equity:view | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| equity:manage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| equity:withdraw | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| equity:approve | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Quotations** |
| quotations:view | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| quotations:create | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| quotations:update | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| quotations:delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Invoices** |
| invoices:view | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| invoices:create | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| invoices:update | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| invoices:delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Documents** |
| documents:view | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| documents:upload | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| documents:delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Reports** |
| reports:view | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| reports:export | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Settings** |
| settings:view | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| settings:manage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| roles:manage | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| users:manage | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

## Implementation

Permissions are stored in the database and seeded from `src/lib/rbac/permissions.ts`. Server actions call `requirePermission()` before executing:

```typescript
import { requirePermission } from "@/lib/rbac/check-permission";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export async function createClient(input: ClientFormData) {
  await requirePermission(PERMISSIONS.CLIENTS_CREATE);
  // ... business logic
}
```

## Configurable Permissions

The Settings page allows founders to modify role-permission mappings at runtime via the `role_permissions` table. System roles (`isSystem: true`) cannot be deleted but their permissions can be adjusted.

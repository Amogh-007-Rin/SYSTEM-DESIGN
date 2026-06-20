/**
 * RBAC Permission Engine
 * Module: 15 — Security
 * Concept: Role-Based Access Control — permissions are attached to roles,
 *   not directly to users, and users are assigned one or more roles. This
 *   lets you reason about access as "which roles can do X?" instead of
 *   enumerating permissions per user, which is what makes RBAC scale
 *   organizationally compared to a raw ACL.
 *
 *   This example also shows where RBAC's known weak spot shows up: it
 *   struggles to express "editors can edit posts they authored, but not
 *   posts authored by others" without proliferating roles. We layer a
 *   small ABAC-style ownership check on top to fix exactly that case,
 *   which is the standard real-world pattern (RBAC for coarse-grained
 *   access, attribute checks for fine-grained resource ownership).
 *
 * Run: npx ts-node rbac-engine.ts
 * Dependencies: none (Node.js built-ins only)
 */

// --- Domain types -----------------------------------------------------

type Action = "create" | "read" | "update" | "delete";
type ResourceType = "post" | "billing" | "user";

interface Resource {
  type: ResourceType;
  id: string;
  ownerId: string;
}

// A permission is "this role may perform this action on this resource type."
// Using a Set of "action:resourceType" strings keeps the lookup O(1) instead
// of scanning an array of permission objects on every check.
type RoleName = "admin" | "editor" | "viewer" | "billing-manager";

interface User {
  id: string;
  roles: RoleName[];
}

// --- Role -> permission mapping ---------------------------------------

// This is the heart of RBAC: permissions live on roles, not on users.
// Onboarding a new editor is "assign the editor role" — nothing here
// needs to change per-user.
const ROLE_PERMISSIONS: Record<RoleName, Set<string>> = {
  admin: new Set([
    "create:post", "read:post", "update:post", "delete:post",
    "create:billing", "read:billing", "update:billing", "delete:billing",
    "create:user", "read:user", "update:user", "delete:user",
  ]),
  editor: new Set([
    "create:post", "read:post", "update:post", "delete:post",
  ]),
  viewer: new Set([
    "read:post",
  ]),
  "billing-manager": new Set([
    "read:billing", "update:billing",
  ]),
};

// Resource types where "own it" is the deciding factor once the coarse
// role check passes. Billing and user-admin actions are intentionally
// NOT in this set — ownership doesn't make sense as an override there
// (an editor doesn't get to bypass billing rules by "owning" an invoice).
const OWNERSHIP_SENSITIVE: Set<ResourceType> = new Set(["post"]);

// --- The permission engine ---------------------------------------------

class RBACEngine {
  /**
   * Decides whether `user` may perform `action` on `resource`.
   *
   * Two-stage check:
   *   1. RBAC stage — does ANY role assigned to the user grant this
   *      action on this resource TYPE at all? This is the coarse,
   *      role-level gate RBAC is good at.
   *   2. Ownership stage — for resource types where ownership matters
   *      (e.g. posts), an "editor" may only update/delete posts they
   *      authored, UNLESS they also hold a role (admin) that grants
   *      blanket access regardless of ownership. This is the
   *      ABAC-style attribute check layered on top of RBAC to handle
   *      what RBAC alone cannot express cleanly.
   */
  hasPermission(user: User, action: Action, resource: Resource): boolean {
    const permissionKey = `${action}:${resource.type}`;

    const grantingRoles = user.roles.filter((role) =>
      ROLE_PERMISSIONS[role].has(permissionKey)
    );

    if (grantingRoles.length === 0) {
      return false; // No role grants this action on this resource type at all.
    }

    // Admin bypasses ownership checks entirely — a blanket grant.
    if (grantingRoles.includes("admin")) {
      return true;
    }

    // For non-ownership-sensitive resource types (billing, user-admin),
    // role membership alone is sufficient — there's no "owner" concept.
    if (!OWNERSHIP_SENSITIVE.has(resource.type)) {
      return true;
    }

    // Ownership-sensitive: the user must actually own the resource for
    // a non-admin role (e.g. editor) to act on it. "read" is left
    // permissive in this example (viewers can read any post); only
    // mutating actions are ownership-gated, which mirrors a common
    // real-world rule: "anyone with read access can read; only the
    // author or an admin can change it."
    if (action === "read") {
      return true;
    }

    return resource.ownerId === user.id;
  }
}

// === USAGE EXAMPLE ===

const engine = new RBACEngine();

const alice: User = { id: "user-alice", roles: ["editor"] };
const bob: User = { id: "user-bob", roles: ["editor"] };
const carol: User = { id: "user-carol", roles: ["viewer"] };
const dave: User = { id: "user-dave", roles: ["admin"] };
const erin: User = { id: "user-erin", roles: ["billing-manager"] };

const alicesPost: Resource = { type: "post", id: "post-1", ownerId: "user-alice" };
const invoice: Resource = { type: "billing", id: "inv-1", ownerId: "user-alice" };

interface Check {
  label: string;
  user: User;
  action: Action;
  resource: Resource;
}

const checks: Check[] = [
  { label: "Alice (editor) updates her own post", user: alice, action: "update", resource: alicesPost },
  { label: "Bob (editor) updates Alice's post", user: bob, action: "update", resource: alicesPost },
  { label: "Bob (editor) deletes Alice's post", user: bob, action: "delete", resource: alicesPost },
  { label: "Carol (viewer) reads Alice's post", user: carol, action: "read", resource: alicesPost },
  { label: "Carol (viewer) updates Alice's post", user: carol, action: "update", resource: alicesPost },
  { label: "Dave (admin) deletes Alice's post (ownership bypassed)", user: dave, action: "delete", resource: alicesPost },
  { label: "Erin (billing-manager) reads an invoice", user: erin, action: "read", resource: invoice },
  { label: "Erin (billing-manager) deletes an invoice (not granted to this role)", user: erin, action: "delete", resource: invoice },
  { label: "Alice (editor) reads billing (wrong role entirely)", user: alice, action: "read", resource: invoice },
];

console.log("=== RBAC + ownership permission checks ===\n");
for (const check of checks) {
  const allowed = engine.hasPermission(check.user, check.action, check.resource);
  console.log(`${allowed ? "ALLOW" : "DENY "} — ${check.label}`);
}

console.log("\n=== Key behavior demonstrated ===");
console.log("- Two editors with IDENTICAL roles get DIFFERENT outcomes on the same action,");
console.log("  because the ownership check is layered on top of the role check.");
console.log("- This is exactly the case plain RBAC struggles with on its own (Module 15,");
console.log("  01-concepts/README.md, 'Authorization Models').");

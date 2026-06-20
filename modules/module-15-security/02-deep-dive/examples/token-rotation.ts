/**
 * Refresh Token Rotation + Reuse Detection
 * Module: 15 — Security
 * Concept: Refresh token rotation bounds the damage of a stolen long-lived
 *   refresh token: every time a refresh token is used, the server issues a
 *   brand-new one and immediately invalidates the old one. If an already-
 *   invalidated (rotated-out) refresh token is ever presented again, that's
 *   a strong signal it was stolen and a copy now exists outside the
 *   legitimate client — the standard response is to revoke the ENTIRE
 *   token family descended from that refresh chain, not just deny the one
 *   request, since the legitimate client and the attacker may now be
 *   racing each other with copies of the same compromised chain.
 *
 * Run: npx ts-node token-rotation.ts
 * Dependencies: none (Node.js built-in crypto only)
 */

import * as crypto from "crypto";

// --- Domain types -----------------------------------------------------

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

type TokenStatus = "active" | "rotated" | "revoked";

interface RefreshTokenRecord {
  token: string;
  familyId: string; // all tokens descended from the same original login share this
  status: TokenStatus;
  issuedAt: number;
}

// --- The authorization server -------------------------------------------

class AuthServer {
  // Keyed by refresh token value -> its record. In a real system this is a
  // database table, not an in-memory map, but the logic is identical.
  private refreshTokens = new Map<string, RefreshTokenRecord>();

  private randomToken(): string {
    return crypto.randomBytes(24).toString("hex");
  }

  /** Initial login: mints a brand-new token family. */
  login(userId: string): TokenPair {
    const familyId = crypto.randomUUID();
    return this.issueTokenPair(familyId);
  }

  private issueTokenPair(familyId: string): TokenPair {
    const accessToken = `access.${this.randomToken()}`;
    const refreshToken = `refresh.${this.randomToken()}`;

    this.refreshTokens.set(refreshToken, {
      token: refreshToken,
      familyId,
      status: "active",
      issuedAt: Date.now(),
    });

    return { accessToken, refreshToken };
  }

  /**
   * Exchanges a refresh token for a new token pair, rotating it.
   *
   * Three outcomes:
   *  - Unknown token            -> reject (never issued, or family long gone)
   *  - Active token             -> rotate: issue new pair, mark this one "rotated"
   *  - Rotated/revoked token    -> REUSE DETECTED: revoke the entire family
   */
  refresh(presentedToken: string): { success: true; tokens: TokenPair } | { success: false; reason: string } {
    const record = this.refreshTokens.get(presentedToken);

    if (!record) {
      return { success: false, reason: "unknown refresh token" };
    }

    if (record.status === "revoked") {
      return { success: false, reason: "token family revoked (already detected as compromised)" };
    }

    if (record.status === "rotated") {
      // This exact token was already exchanged once before. A second
      // presentation means two different parties now hold (or held) a
      // copy of it — the legitimate client got its new pair already, so
      // this second use can only be an attacker replaying a stolen token.
      this.revokeFamily(record.familyId);
      return {
        success: false,
        reason: `REUSE DETECTED on family ${record.familyId} — entire token family revoked`,
      };
    }

    // Normal case: token is active and being used for the first time.
    record.status = "rotated";
    const newTokens = this.issueTokenPair(record.familyId);
    return { success: true, tokens: newTokens };
  }

  /** Revokes every refresh token that belongs to the same family. */
  private revokeFamily(familyId: string): void {
    for (const record of this.refreshTokens.values()) {
      if (record.familyId === familyId) {
        record.status = "revoked";
      }
    }
  }

  /** Diagnostic helper for the demo output below. */
  describe(token: string): string {
    const record = this.refreshTokens.get(token);
    return record ? `status=${record.status} family=${record.familyId.slice(0, 8)}` : "not found";
  }
}

// === USAGE EXAMPLE ===

const server = new AuthServer();

console.log("=== Step 1: Client logs in ===");
const initialTokens = server.login("user-42");
console.log("Issued refresh token:", initialTokens.refreshToken);
console.log("  ->", server.describe(initialTokens.refreshToken));

console.log("\n=== Step 2: Legitimate client refreshes normally ===");
const firstRefresh = server.refresh(initialTokens.refreshToken);
if (firstRefresh.success) {
  console.log("Refresh succeeded. New refresh token:", firstRefresh.tokens.refreshToken);
  console.log("  Old token is now:", server.describe(initialTokens.refreshToken));
  console.log("  New token is now:", server.describe(firstRefresh.tokens.refreshToken));
} else {
  console.log("Unexpected failure:", firstRefresh.reason);
}

console.log("\n=== Step 3: An attacker who stole the OLD (already-rotated) refresh token tries to reuse it ===");
const reuseAttempt = server.refresh(initialTokens.refreshToken);
console.log("Reuse attempt result:", reuseAttempt.success ? "ALLOWED (bug!)" : `REJECTED — ${reuseAttempt.reason}`);

console.log("\n=== Step 4: Even the LEGITIMATE client's new token is now revoked, since the family was compromised ===");
if (firstRefresh.success) {
  const legitimateRetry = server.refresh(firstRefresh.tokens.refreshToken);
  console.log(
    "Legitimate client's next refresh result:",
    legitimateRetry.success ? "ALLOWED" : `REJECTED — ${legitimateRetry.reason}`
  );
  console.log("\nThis is the correct (if harsh) outcome: once reuse is detected, the server cannot tell which");
  console.log("party is the real client and which is the attacker, so the whole family is killed and the user");
  console.log("must log in again — re-establishing a fresh, uncontaminated token family.");
}

console.log("\n=== Step 5: A brand-new login starts an unrelated, healthy token family ===");
const freshLogin = server.login("user-42");
console.log("New family refresh token:", server.describe(freshLogin.refreshToken));

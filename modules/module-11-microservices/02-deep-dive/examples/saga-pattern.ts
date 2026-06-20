/**
 * Saga Pattern: Orchestrated Order Flow with Compensating Transactions
 * Module: 11 — Microservices Architecture
 * Concept: A logical "place an order" transaction now spans three services
 *   (Order, Inventory, Payment), each with its own database — there is no
 *   single ACID transaction across all three. A saga orchestrator calls
 *   each service's local transaction in sequence. If a later step fails
 *   (here: Payment), the orchestrator explicitly runs compensating
 *   transactions for every step that already succeeded, in reverse order,
 *   so the system ends up in a consistent state (order cancelled, stock
 *   released) instead of a half-committed one (stock reserved forever for
 *   an order that was never paid for).
 * Run: npx ts-node saga-pattern.ts
 * Dependencies: none
 */

interface OrderContext {
  orderId: string;
  customerId: string;
  itemSku: string;
  quantity: number;
  amountCents: number;
  // Populated as the saga progresses, so compensations know what to undo.
  inventoryReservationId?: string;
  paymentId?: string;
}

/** Each service exposes a local transaction and its own compensation. */
interface OrderService {
  createOrder(ctx: OrderContext): Promise<void>;
  cancelOrder(ctx: OrderContext): Promise<void>;
}

interface InventoryService {
  reserveStock(ctx: OrderContext): Promise<void>;
  releaseStock(ctx: OrderContext): Promise<void>;
}

interface PaymentService {
  /** Simulates a real charge — fails deterministically for one demo customer. */
  chargeCustomer(ctx: OrderContext): Promise<void>;
}

// === Mock service implementations ===
// Each one owns its own "database" (a Map) — there is no shared transaction
// across them, which is exactly why a saga is needed instead of a plain
// multi-table commit.

class MockOrderService implements OrderService {
  private orders = new Map<string, string>(); // orderId -> status

  async createOrder(ctx: OrderContext): Promise<void> {
    this.orders.set(ctx.orderId, "PENDING");
    console.log(`  [order] order ${ctx.orderId} created (status: PENDING)`);
  }

  async cancelOrder(ctx: OrderContext): Promise<void> {
    this.orders.set(ctx.orderId, "CANCELLED");
    console.log(`  [order] COMPENSATION: order ${ctx.orderId} marked CANCELLED`);
  }

  getStatus(orderId: string): string | undefined {
    return this.orders.get(orderId);
  }
}

class MockInventoryService implements InventoryService {
  private stock = new Map<string, number>();
  private reservations = new Map<string, { sku: string; quantity: number }>();

  constructor(initialStock: Record<string, number>) {
    for (const [sku, qty] of Object.entries(initialStock)) {
      this.stock.set(sku, qty);
    }
  }

  async reserveStock(ctx: OrderContext): Promise<void> {
    const available = this.stock.get(ctx.itemSku) ?? 0;
    if (available < ctx.quantity) {
      throw new Error(`Insufficient stock for ${ctx.itemSku} (have ${available}, need ${ctx.quantity})`);
    }
    this.stock.set(ctx.itemSku, available - ctx.quantity);
    const reservationId = `res-${ctx.orderId}`;
    this.reservations.set(reservationId, { sku: ctx.itemSku, quantity: ctx.quantity });
    ctx.inventoryReservationId = reservationId;
    console.log(
      `  [inventory] reserved ${ctx.quantity}x ${ctx.itemSku} (reservation ${reservationId}); ${available - ctx.quantity} left`
    );
  }

  async releaseStock(ctx: OrderContext): Promise<void> {
    if (!ctx.inventoryReservationId) return; // nothing was ever reserved
    const reservation = this.reservations.get(ctx.inventoryReservationId);
    if (!reservation) return;
    const current = this.stock.get(reservation.sku) ?? 0;
    this.stock.set(reservation.sku, current + reservation.quantity);
    this.reservations.delete(ctx.inventoryReservationId);
    console.log(
      `  [inventory] COMPENSATION: released ${reservation.quantity}x ${reservation.sku} ` +
        `(reservation ${ctx.inventoryReservationId}); stock restored to ${current + reservation.quantity}`
    );
  }

  getStock(sku: string): number {
    return this.stock.get(sku) ?? 0;
  }
}

class MockPaymentService implements PaymentService {
  // Simulates a real-world failure mode: this customer's card is declined.
  constructor(private readonly decliningCustomerId: string) {}

  async chargeCustomer(ctx: OrderContext): Promise<void> {
    if (ctx.customerId === this.decliningCustomerId) {
      throw new Error(`Payment declined for customer ${ctx.customerId} (card issuer rejected charge)`);
    }
    ctx.paymentId = `pay-${ctx.orderId}`;
    console.log(`  [payment] charged customer ${ctx.customerId} $${(ctx.amountCents / 100).toFixed(2)} (payment ${ctx.paymentId})`);
  }
}

/**
 * The Saga Orchestrator: holds the explicit sequence of steps and, critically,
 * the explicit compensation for each step. On any step's failure, it runs
 * compensations for every step that already committed, in reverse order —
 * this is the core mechanic that replaces a distributed 2PC transaction.
 */
class OrderSagaOrchestrator {
  constructor(
    private orderService: OrderService,
    private inventoryService: InventoryService,
    private paymentService: PaymentService
  ) {}

  async run(ctx: OrderContext): Promise<{ success: boolean; reason?: string }> {
    const completedSteps: Array<() => Promise<void>> = [];

    try {
      console.log(`\n--- Saga started for order ${ctx.orderId} ---`);

      console.log("Step 1: create order");
      await this.orderService.createOrder(ctx);
      completedSteps.push(() => this.orderService.cancelOrder(ctx));

      console.log("Step 2: reserve inventory");
      await this.inventoryService.reserveStock(ctx);
      completedSteps.push(() => this.inventoryService.releaseStock(ctx));

      console.log("Step 3: charge payment");
      await this.paymentService.chargeCustomer(ctx);
      // Payment has no compensation pushed because it never succeeds in a
      // path that needs undoing — if it fails, it simply never committed.

      console.log(`--- Saga completed successfully for order ${ctx.orderId} ---`);
      return { success: true };
    } catch (err) {
      const reason = (err as Error).message;
      console.log(`\n!!! Saga step failed: ${reason}`);
      console.log("Running compensating transactions in reverse order...");

      // Reverse order matters: undo the most recent commit first, mirroring
      // how a stack of completed work should be unwound.
      for (const compensate of completedSteps.reverse()) {
        await compensate();
      }

      console.log(`--- Saga compensated and order ${ctx.orderId} ended in a consistent CANCELLED state ---`);
      return { success: false, reason };
    }
  }
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  const orderService = new MockOrderService();
  const inventoryService = new MockInventoryService({ "sku-widget-42": 10 });
  // customer "cust-declined" always fails payment, simulating a card decline
  // discovered only *after* inventory has already been reserved.
  const paymentService = new MockPaymentService("cust-declined");

  const orchestrator = new OrderSagaOrchestrator(orderService, inventoryService, paymentService);

  console.log("=== Happy path: payment succeeds, saga completes end-to-end ===");
  const happyCtx: OrderContext = {
    orderId: "order-1",
    customerId: "cust-ok",
    itemSku: "sku-widget-42",
    quantity: 3,
    amountCents: 4999,
  };
  const happyResult = await orchestrator.run(happyCtx);
  console.log("Result:", happyResult);
  console.log("Order status:", orderService.getStatus(happyCtx.orderId));
  console.log("Remaining stock:", inventoryService.getStock("sku-widget-42"));

  console.log("\n\n=== Failure path: inventory reserved, then payment fails -> compensation fires ===");
  const failingCtx: OrderContext = {
    orderId: "order-2",
    customerId: "cust-declined",
    itemSku: "sku-widget-42",
    quantity: 5,
    amountCents: 8999,
  };
  const stockBefore = inventoryService.getStock("sku-widget-42");
  const failResult = await orchestrator.run(failingCtx);
  console.log("Result:", failResult);
  console.log("Order status:", orderService.getStatus(failingCtx.orderId));
  console.log(
    `Stock before saga: ${stockBefore}, stock after compensation: ${inventoryService.getStock("sku-widget-42")} ` +
      "(restored to the same value — the reservation was fully undone)"
  );

  console.log("\n=== Takeaway ===");
  console.log(
    "No global lock was ever held across Order/Inventory/Payment. Each local transaction " +
      "committed independently, and when Payment failed, the orchestrator explicitly undid " +
      "exactly the steps that had already succeeded — that's the saga pattern replacing 2PC."
  );
}

main();

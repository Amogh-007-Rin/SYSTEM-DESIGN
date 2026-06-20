/**
 * Feature Store: Online vs. Offline, and Training-Serving Skew
 * Module: 19 — ML Systems & AI Infrastructure
 * Concept: A feature store materializes the SAME feature definition into two
 *   stores tuned for two access patterns — an offline store for training
 *   (batch, point-in-time correct) and an online store for real-time
 *   inference (single-key, low-latency). This file simulates both paths and
 *   then deliberately demonstrates training-serving skew: what happens to a
 *   model's prediction when the online feature computation logic quietly
 *   drifts from the offline logic it was trained against.
 * Run: npx ts-node feature-store-skew.ts
 * Dependencies: none (Node.js built-ins only)
 */

interface Order {
  userId: string;
  amount: number;
  timestampMs: number;
}

// Raw event log — the kind of data that lands in a data lake via the batch/
// stream pipelines covered in Module 17. Both the offline and online paths
// derive features from data shaped like this.
const ORDER_HISTORY: Order[] = [
  { userId: "user-1", amount: 40, timestampMs: daysAgo(2) },
  { userId: "user-1", amount: 60, timestampMs: daysAgo(10) },
  { userId: "user-1", amount: 20, timestampMs: daysAgo(25) },
  { userId: "user-1", amount: 500, timestampMs: daysAgo(45) }, // outside the 30-day window
  { userId: "user-2", amount: 15, timestampMs: daysAgo(1) },
  { userId: "user-2", amount: 25, timestampMs: daysAgo(5) },
];

function daysAgo(n: number): number {
  return Date.now() - n * 24 * 60 * 60 * 1000;
}

// ---------------------------------------------------------------------------
// SHARED FEATURE DEFINITION (the ideal: one source of truth)
//
// "avg_order_value_30d" = average order amount over the trailing 30 days.
// In a real feature store, this single function (or a single declarative
// transform) would back BOTH the offline batch job and the online store —
// that sharing is the entire mechanism that prevents skew.
// ---------------------------------------------------------------------------
function computeAvgOrderValue30dCorrect(orders: Order[], asOfMs: number): number {
  const windowMs = 30 * 24 * 60 * 60 * 1000;
  const inWindow = orders.filter((o) => asOfMs - o.timestampMs <= windowMs);
  if (inWindow.length === 0) return 0;
  const total = inWindow.reduce((sum, o) => sum + o.amount, 0);
  return Math.round((total / inWindow.length) * 100) / 100;
}

// ---------------------------------------------------------------------------
// OFFLINE STORE — populated by a batch job at training time.
// Optimized for large, point-in-time-correct reads over many users/timestamps
// at once. Backed conceptually by a data warehouse (Module 17 territory).
// ---------------------------------------------------------------------------
class OfflineFeatureStore {
  private materialized = new Map<string, number>();

  // Simulates a nightly batch job materializing the feature for every user,
  // using the CORRECT, agreed-upon feature definition.
  runBatchJob(allOrders: Order[], asOfMs: number): void {
    const userIds = [...new Set(allOrders.map((o) => o.userId))];
    for (const userId of userIds) {
      const userOrders = allOrders.filter((o) => o.userId === userId);
      const value = computeAvgOrderValue30dCorrect(userOrders, asOfMs);
      this.materialized.set(userId, value);
    }
  }

  getTrainingFeature(userId: string): number {
    const value = this.materialized.get(userId);
    if (value === undefined) throw new Error(`No offline feature materialized for ${userId}`);
    return value;
  }
}

// ---------------------------------------------------------------------------
// ONLINE STORE — a low-latency key-value store serving real-time inference.
// In a healthy design, this would be populated by streaming the SAME
// transformation used above. This class intentionally accepts an injected
// "compute" function so we can demonstrate what happens when someone
// reimplements the logic instead of reusing it — the real-world root cause
// of training-serving skew.
// ---------------------------------------------------------------------------
class OnlineFeatureStore {
  constructor(private readonly computeFn: (orders: Order[], asOfMs: number) => number) {}

  // Real-time inference path: single-key lookup, computed (or refreshed)
  // on the fly against live, low-latency storage — must return in
  // milliseconds, unlike the offline batch job above.
  getFeaturesForInference(userId: string, allOrders: Order[], asOfMs: number): number {
    const userOrders = allOrders.filter((o) => o.userId === userId);
    return this.computeFn(userOrders, asOfMs);
  }
}

// ---------------------------------------------------------------------------
// A trained "model" — deliberately trivial (linear rule) so the demonstration
// is about the FEATURE VALUE that flows in, not about model internals.
// ---------------------------------------------------------------------------
function predictCreditLimit(avgOrderValue30d: number): number {
  // A model "trained" to roughly 10x the 30-day average order value.
  return Math.round(avgOrderValue30d * 10);
}

// === USAGE EXAMPLE ===
function main(): void {
  const now = Date.now();

  console.log("=== Step 1: Offline batch job materializes training features ===");
  const offlineStore = new OfflineFeatureStore();
  offlineStore.runBatchJob(ORDER_HISTORY, now);
  const trainingFeature = offlineStore.getTrainingFeature("user-1");
  console.log(`Training-time feature for user-1 (avg_order_value_30d): ${trainingFeature}`);
  console.log("The model is trained using this exact number as input.\n");

  const trainedPrediction = predictCreditLimit(trainingFeature);
  console.log(`Model learns to associate input ${trainingFeature} -> output ${trainedPrediction}`);
  console.log("(this is the relationship baked into the model's weights at training time)\n");

  console.log("=== Step 2a: HEALTHY online store — reuses the SAME feature definition ===");
  const healthyOnlineStore = new OnlineFeatureStore(computeAvgOrderValue30dCorrect);
  const healthyServingFeature = healthyOnlineStore.getFeaturesForInference("user-1", ORDER_HISTORY, now);
  console.log(`Online feature for user-1 at inference time: ${healthyServingFeature}`);
  console.log(`Matches training-time feature? ${healthyServingFeature === trainingFeature}`);
  const healthyPrediction = predictCreditLimit(healthyServingFeature);
  console.log(`Prediction served to the user: ${healthyPrediction}`);
  console.log("Correct — the model sees the same feature shape it was trained on.\n");

  console.log("=== Step 2b: SKEWED online store — a SECOND, slightly different implementation ===");
  console.log("(e.g., an engineer reimplemented the '30-day window' in application code");
  console.log(" and used a 45-day window by mistake, or measured calendar months instead");
  console.log(" of a rolling 30-day window — a realistic, easy-to-miss bug)\n");

  function computeAvgOrderValueSkewed(orders: Order[], asOfMs: number): number {
    const windowMs = 45 * 24 * 60 * 60 * 1000; // BUG: should be 30 days, not 45
    const inWindow = orders.filter((o) => asOfMs - o.timestampMs <= windowMs);
    if (inWindow.length === 0) return 0;
    const total = inWindow.reduce((sum, o) => sum + o.amount, 0);
    return Math.round((total / inWindow.length) * 100) / 100;
  }

  const skewedOnlineStore = new OnlineFeatureStore(computeAvgOrderValueSkewed);
  const skewedServingFeature = skewedOnlineStore.getFeaturesForInference("user-1", ORDER_HISTORY, now);
  console.log(`Online feature for user-1 at inference time: ${skewedServingFeature}`);
  console.log(`Matches training-time feature? ${skewedServingFeature === trainingFeature}`);
  const skewedPrediction = predictCreditLimit(skewedServingFeature);
  console.log(`Prediction served to the user: ${skewedPrediction}`);
  console.log(`Training-time prediction was: ${trainedPrediction}`);
  const delta = skewedPrediction - trainedPrediction;
  console.log(`Prediction is off by ${delta} (${((delta / trainedPrediction) * 100).toFixed(1)}%)`);

  console.log("\n=== Lesson ===");
  console.log("No exception was thrown anywhere in this program. The skewed code ran");
  console.log("successfully and returned a confident-looking number. The ONLY reason the");
  console.log("prediction is wrong is that the online feature logic silently diverged");
  console.log("from the offline logic the model was trained against — training-serving");
  console.log("skew. A real feature store prevents this by sharing one transformation");
  console.log("definition between training and serving, instead of letting two");
  console.log("implementations of 'the same feature' drift apart undetected.");
}

main();

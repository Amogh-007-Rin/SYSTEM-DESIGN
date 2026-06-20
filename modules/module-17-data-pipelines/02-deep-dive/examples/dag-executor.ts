/**
 * Minimal DAG Executor (Airflow in Miniature)
 * Module: 17 — Data Pipelines & Stream Processing
 * Concept: Apache Airflow schedules a pipeline's tasks as a Directed Acyclic
 *   Graph (DAG): each task declares which other tasks must complete first,
 *   and the scheduler runs every task whose dependencies are satisfied,
 *   running independent tasks concurrently, until the whole graph is done.
 *   This example builds a minimal version of that scheduler: it validates
 *   the graph has no cycles, then repeatedly runs every task that's
 *   currently "ready" (all dependencies finished) in parallel, exactly like
 *   Airflow fanning out independent tasks instead of running everything in
 *   one strict serial line.
 * Run: npx ts-node dag-executor.ts
 * Dependencies: none (Node.js built-ins only)
 */

interface TaskDefinition {
  id: string;
  dependsOn: string[];
  // Simulated work duration in ms, standing in for "this task calls a real
  // Spark job / SQL query / API and takes some time to finish."
  durationMs: number;
}

type TaskStatus = "pending" | "running" | "done" | "failed";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// A small pipeline: extract from two independent sources, wait for both,
// transform, then fan out to two independent loads, then a final report --
// a shape that's impossible to express correctly as one serial list, which
// is exactly why Airflow models pipelines as a graph instead of a list.
const PIPELINE_TASKS: TaskDefinition[] = [
  { id: "extract_orders", dependsOn: [], durationMs: 120 },
  { id: "extract_users", dependsOn: [], durationMs: 90 },
  { id: "transform_join", dependsOn: ["extract_orders", "extract_users"], durationMs: 150 },
  { id: "load_warehouse", dependsOn: ["transform_join"], durationMs: 100 },
  { id: "load_search_index", dependsOn: ["transform_join"], durationMs: 80 },
  { id: "send_completion_report", dependsOn: ["load_warehouse", "load_search_index"], durationMs: 50 },
];

class DagExecutor {
  private readonly tasksById = new Map<string, TaskDefinition>();
  private readonly status = new Map<string, TaskStatus>();

  constructor(tasks: TaskDefinition[]) {
    for (const task of tasks) {
      this.tasksById.set(task.id, task);
      this.status.set(task.id, "pending");
    }
    this.assertNoCycles();
  }

  // A DAG must be acyclic by definition -- Airflow itself refuses to load a
  // DAG with a cycle, because a cycle would mean no task could ever be the
  // "first" one to run. We detect cycles with a simple depth-first search.
  private assertNoCycles(): void {
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (taskId: string, path: string[]): void => {
      if (visited.has(taskId)) return;
      if (visiting.has(taskId)) {
        throw new Error(`Cycle detected in DAG: ${[...path, taskId].join(" -> ")}`);
      }
      visiting.add(taskId);
      const task = this.tasksById.get(taskId);
      if (!task) throw new Error(`Unknown task dependency: ${taskId}`);
      for (const dep of task.dependsOn) visit(dep, [...path, taskId]);
      visiting.delete(taskId);
      visited.add(taskId);
    };

    for (const taskId of this.tasksById.keys()) visit(taskId, []);
  }

  private isReady(task: TaskDefinition): boolean {
    if (this.status.get(task.id) !== "pending") return false;
    return task.dependsOn.every((depId) => this.status.get(depId) === "done");
  }

  private async runTask(task: TaskDefinition, startedAt: number): Promise<void> {
    this.status.set(task.id, "running");
    console.log(`  [t+${Date.now() - startedAt}ms] STARTED  ${task.id} (depends on: ${task.dependsOn.join(", ") || "none"})`);
    await sleep(task.durationMs);
    this.status.set(task.id, "done");
    console.log(`  [t+${Date.now() - startedAt}ms] FINISHED ${task.id}`);
  }

  // The scheduling loop: on every tick, launch every currently-ready task
  // concurrently (mirroring Airflow running independent tasks in parallel
  // across its worker pool), then wait for that whole wave to finish before
  // checking what's ready next. Repeats until every task is done.
  async run(): Promise<void> {
    const startedAt = Date.now();
    const allTaskIds = [...this.tasksById.keys()];

    while (allTaskIds.some((id) => this.status.get(id) !== "done")) {
      const readyTasks = [...this.tasksById.values()].filter((task) => this.isReady(task));

      if (readyTasks.length === 0) {
        const stuck = allTaskIds.filter((id) => this.status.get(id) !== "done");
        throw new Error(`Scheduler stalled -- no ready tasks but pipeline incomplete: ${stuck.join(", ")}`);
      }

      console.log(`--- Wave: running ${readyTasks.length} task(s) concurrently: ${readyTasks.map((t) => t.id).join(", ")} ---`);
      await Promise.all(readyTasks.map((task) => this.runTask(task, startedAt)));
    }

    console.log(`\nAll ${allTaskIds.length} tasks completed in ${Date.now() - startedAt}ms wall-clock time.`);
  }
}

// === USAGE EXAMPLE ===
async function main(): Promise<void> {
  console.log("=== Pipeline DAG ===");
  for (const task of PIPELINE_TASKS) {
    console.log(`  ${task.id}  <-  [${task.dependsOn.join(", ") || "no dependencies"}]`);
  }

  console.log("\n=== Executing DAG (independent tasks run concurrently, dependents wait) ===");
  const executor = new DagExecutor(PIPELINE_TASKS);
  await executor.run();

  console.log("\n=== Demonstrating cycle detection on a broken DAG ===");
  try {
    new DagExecutor([
      { id: "a", dependsOn: ["b"], durationMs: 10 },
      { id: "b", dependsOn: ["a"], durationMs: 10 },
    ]);
    console.log("ERROR: cycle was not detected (this should not print)");
  } catch (err) {
    console.log(`Correctly rejected cyclic DAG: ${(err as Error).message}`);
  }

  console.log("\n=== Lesson ===");
  console.log("extract_orders and extract_users ran in the SAME wave because neither depends");
  console.log("on the other; transform_join had to wait for both. load_warehouse and");
  console.log("load_search_index then ran concurrently off the same transform_join output.");
  console.log("This fan-out/fan-in shape -- not a single serial chain -- is exactly why");
  console.log("Airflow models pipelines as a DAG instead of an ordered list of steps.");
}

main();

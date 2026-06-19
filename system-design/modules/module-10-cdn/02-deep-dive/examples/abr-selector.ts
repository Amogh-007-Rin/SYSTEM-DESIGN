/**
 * Adaptive Bitrate (ABR) Rendition Selector
 * Module: 10 — Content Delivery Networks (CDNs)
 * Concept: HLS/DASH players choose which encoded rendition to request for the
 *   *next* segment based on two signals: recently measured download
 *   throughput, and current buffer health (how many seconds of already-
 *   downloaded video are queued up before playback would stall). This models
 *   a simplified version of that decision loop — the same kind of logic
 *   real players (hls.js, Shaka Player, ExoPlayer) run continuously.
 * Run: npx ts-node abr-selector.ts
 * Dependencies: none
 */

// A single encoded quality level, as listed in an HLS/DASH manifest.
// kbps = the bitrate this rendition was encoded at; a player needs download
// throughput comfortably above this to play it back without stalling.
interface Rendition {
  name: string;
  kbps: number;
}

// Renditions are listed low-to-high; real manifests do the same so a player
// can iterate from the bottom up and stop at the best one it can sustain.
const RENDITION_LADDER: Rendition[] = [
  { name: "240p", kbps: 400 },
  { name: "480p", kbps: 1000 },
  { name: "720p", kbps: 2500 },
  { name: "1080p", kbps: 5000 },
];

// Safety margin: never select a rendition whose bitrate is within this
// fraction of measured throughput. Real players use a similar margin
// (commonly 10-30%) because measured throughput is noisy and a rendition
// that exactly matches current bandwidth will stall on any dip at all.
const SAFETY_MARGIN = 0.8;

// Buffer health thresholds (seconds of already-downloaded video queued up).
// Below LOW_BUFFER_SECONDS the player gets conservative regardless of
// measured bandwidth, because a stall is imminent if it guesses wrong.
const LOW_BUFFER_SECONDS = 8;
const HEALTHY_BUFFER_SECONDS = 20;

interface PlayerState {
  measuredThroughputKbps: number;
  bufferHealthSeconds: number;
}

// Picks the best sustainable rendition for the next segment given current
// network and buffer conditions. This is a simplified version of the
// "throughput-based" class of real ABR algorithms (as opposed to more
// sophisticated buffer-based or hybrid approaches), but it captures the
// core idea every variant shares: don't pick a rendition you can't sustain,
// and get more conservative when the buffer is running low.
function selectRendition(state: PlayerState): Rendition {
  // Low buffer means a stall is close — fall back to the safest rendition
  // regardless of how good measured bandwidth looks, since a sudden drop
  // would cause visible rebuffering with almost no cushion to absorb it.
  if (state.bufferHealthSeconds < LOW_BUFFER_SECONDS) {
    return RENDITION_LADDER[0];
  }

  // Effective bandwidth budget shrinks further when the buffer isn't fully
  // healthy yet — be a little more conservative until it builds back up.
  const bufferConfidence =
    state.bufferHealthSeconds >= HEALTHY_BUFFER_SECONDS ? 1.0 : 0.9;
  const sustainableKbps = state.measuredThroughputKbps * SAFETY_MARGIN * bufferConfidence;

  // Walk the ladder top-down; pick the highest rendition whose bitrate fits
  // within the sustainable bandwidth budget. Falls back to the lowest
  // rendition if nothing fits (better to play something than stall).
  for (let i = RENDITION_LADDER.length - 1; i >= 0; i--) {
    if (RENDITION_LADDER[i].kbps <= sustainableKbps) {
      return RENDITION_LADDER[i];
    }
  }
  return RENDITION_LADDER[0];
}

// === USAGE EXAMPLE ===
// Simulates a playback session where network conditions change over time —
// exactly the kind of trace a mobile viewer walking between WiFi and
// cellular coverage would produce.
interface SimulatedTick {
  secondsIntoPlayback: number;
  measuredThroughputKbps: number;
  bufferHealthSeconds: number;
}

const session: SimulatedTick[] = [
  { secondsIntoPlayback: 0, measuredThroughputKbps: 6000, bufferHealthSeconds: 2 }, // just started, buffer still filling
  { secondsIntoPlayback: 6, measuredThroughputKbps: 6000, bufferHealthSeconds: 12 }, // buffer healthy, great bandwidth
  { secondsIntoPlayback: 20, measuredThroughputKbps: 7500, bufferHealthSeconds: 24 }, // sustained excellent conditions, buffer fully healthy
  { secondsIntoPlayback: 35, measuredThroughputKbps: 900, bufferHealthSeconds: 18 }, // bandwidth craters (e.g. left WiFi)
  { secondsIntoPlayback: 45, measuredThroughputKbps: 850, bufferHealthSeconds: 6 }, // buffer draining, still poor bandwidth
  { secondsIntoPlayback: 60, measuredThroughputKbps: 4500, bufferHealthSeconds: 9 }, // bandwidth recovers, buffer still rebuilding
  { secondsIntoPlayback: 75, measuredThroughputKbps: 4800, bufferHealthSeconds: 22 }, // fully recovered
];

console.log("=== Adaptive Bitrate Rendition Selection Over a Playback Session ===\n");
console.log(
  "t(s)".padEnd(6) +
    "throughput".padEnd(13) +
    "buffer(s)".padEnd(11) +
    "-> selected rendition"
);

for (const tick of session) {
  const chosen = selectRendition({
    measuredThroughputKbps: tick.measuredThroughputKbps,
    bufferHealthSeconds: tick.bufferHealthSeconds,
  });
  console.log(
    `${String(tick.secondsIntoPlayback).padEnd(6)}${String(tick.measuredThroughputKbps + "kbps").padEnd(
      13
    )}${String(tick.bufferHealthSeconds).padEnd(11)}-> ${chosen.name} (${chosen.kbps}kbps)`
  );
}

console.log("\n=== Why this matters ===");
console.log("Notice the player drops to 240p the instant bandwidth craters at t=35-45s,");
console.log("not because 1080p stopped existing, but because the segment-by-segment");
console.log("decision loop reacts to throughput AND buffer health every few seconds —");
console.log("exactly the mechanism that lets a video recover from a bad network blip");
console.log("without the user ever having to manually change quality settings.");

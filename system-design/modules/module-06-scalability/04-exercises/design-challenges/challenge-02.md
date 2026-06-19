# Design Challenge 02: Scalable Image Upload and Processing Pipeline

**Difficulty:** Medium–Hard

## Prompt

Design a system that lets users upload images (think: a profile picture or a post photo on a social app) which then need to be **processed** — resized into multiple sizes (thumbnail, medium, full), and made available via URL — and must handle **10,000 uploads per minute at peak**, each upload averaging 5MB.

## What to Produce

1. **Upload path:** how does the image get from the user's device into your system? Does it go through your application servers, or somewhere else? Justify the choice in terms of what it does to your app servers' bottleneck profile.
2. **Where does processing happen?** Is resizing done synchronously in the request, or offloaded? Justify using the CPU-bound vs. I/O-bound distinction from [02-deep-dive](../../02-deep-dive/README.md).
3. **How does processing scale independently from the upload path?** What happens if processing falls behind during a traffic spike — what does the user see, and what guarantees (if any) do you make about when processing completes?
4. **Where are the processed images stored and served from**, and how does that choice avoid re-introducing the bottleneck you just removed?
5. **At least 2 trade-offs** in your design.

A full worked solution is in [`challenge-02-solution.md`](./challenge-02-solution.md).

# Company Architectures

This section contains real-world system architecture case studies — how actual companies built and evolved the systems described abstractly in the [`modules/`](../modules/). Theory tells you the patterns exist; these case studies show which patterns get picked, in what combination, and why, when real constraints (cost, team size, legacy systems, deadlines) are involved.

---

## How to Read These Case Studies

Each company entry follows the same template (see [`_template/README.md`](./_template/README.md)) so you can compare across companies quickly:

1. **Company & Product Overview** — what the product is and why its scale is interesting
2. **Scale** — concrete numbers: DAU, QPS, storage
3. **Architecture diagram** — the high-level system
4. **Key components** — what each piece does
5. **Key design decisions and trade-offs** — what they chose and what they gave up
6. **Evolution** — how the architecture changed as scale grew (rarely is the v1 architecture the current one)
7. **Lessons learned** — what's unique or counter-intuitive about this system
8. **References** — the original engineering blog posts or talks the case study is sourced from

> 💡 **Note:** Read these *after* you've covered the relevant modules. A case study on Discord's architecture will make far more sense once you understand [Module 08 — Message Queues](../modules/module-08-message-queues/) and [Module 16 — Real-Time Systems](../modules/module-16-real-time-systems/).

---

## Index

This index is intentionally empty in the base repository — case studies are added by the repository owner and contributors over time. If you'd like to contribute one, copy [`_template/`](./_template/) into a new folder named after the company (e.g. `company-architectures/discord/`) and follow the structure.

| Company | System | Module(s) Most Relevant |
|---|---|---|
| _(none yet — be the first contributor)_ | | |

---

## Folder Structure

```
company-architectures/
├── README.md
├── _template/
│   └── README.md           ← Template for adding a new company
└── (company folders added by repo owner / contributors)
```

See [CONTRIBUTING.md](../CONTRIBUTING.md) for the PR process.

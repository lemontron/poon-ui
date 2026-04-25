# AGENTS

## Code Quality

- Prefer direct implementations over generic defensive plumbing. If a component API expects a specific shape, trust it and let misuse fail.
- Do not add helpers for one-use logic. Keep the code inline unless naming the helper removes meaningful complexity.
- Keep logic close to the state and props it uses. Do not pass functions or values around just to preserve generic helper signatures.
- Remove alternate, previous, and legacy implementation paths once one path covers the behavior.
- Avoid normalization ceremony. Use existing values directly. If it can't be used directly, you're fighting the code. Time to take a step back and consider refactoring.
- When cleaning code, question every intermediate variable, wrapper function, and defensive branch. If it does not make the behavior clearer, remove it.
- Keep app components free of pass-through props that only exist for plumbing.
- Prefer one event path across platforms. If pointer events solve desktop and mobile, do not keep parallel native drag/drop code.
- Avoid chains like `normalize(getTarget(...))` when `getTarget(...)` can return the right shape.

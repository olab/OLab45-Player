# Release Notes

## 2026-10-17 (Vite migration)

Branch: `dev` (commits `ce1bb68` to `5cab8f4`)

### Build

- Migrated from Create React App to Vite. `vite.config.mjs` handles JSX in `.js` files, Flow annotation stripping, SVG imports (`?react`) and the `build/` output layout (`static/js`, `static/media`).
- `index.html` moved from `public/` to the project root and loads `/src/index.js` as a module.
- Replaced `require()` calls with ES `import` and made `src/services/constants.js` an ES default export.
- Env files converted to Vite modes: `REACT_APP_*` is now `VITE_*`, `PUBLIC_URL` is now `VITE_PUBLIC_URL`, and `.env.local`, `.env.azure.dev` and `.env.azure.local` were renamed to `.env.localhost`, `.env.azure-dev` and `.env.azure-local`.
- npm scripts now call `vite` / `vite build --mode <name>`. `react-scripts`, `postcss-loader`, `react-dev-utils` and `env-cmd` were removed, and the `test` and `eject` scripts are gone.
- Removed `build.sh` and `update.sh`.
- Replaced `void ... ||` expressions in `Contents.js` and `AssigneeSearchableList.js` with explicit statements. Behavior is unchanged.

### Documentation

- `README.md` rewritten for the Vite setup: project description, configuration variables, modes and npm scripts.
- `OLabClientApi.md` and `ReleaseNotes.md` moved to `docs/`.
- Version set to `26.10.17-0`.

## 2026-10-17

Branch: `dev` (commit `7b297dd`)

### OLabClientApi

- Added `getMapName()`, `getMapId()`, `getNodeName()` and `getNodeId()` to read the current map and node from the player props.
- `jumpToNode(nodeId, onShutdownCallback)` now does nothing when `nodeId` is already the current node.

### Documentation

- `OLabClientApi.md` updated with the new "Current map and node" section and the `jumpToNode` behaviour.

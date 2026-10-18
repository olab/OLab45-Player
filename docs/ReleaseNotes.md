# Release Notes

## 2026-10-18

### Home And Navigation

- Changed `HomeWrapper` padding from `1rem` to `0rem`.
- Updated `OLabClientApi.jumpToNode()` to navigate using the current map ID instead of a hard-coded map ID, and include the map ID in its debug log.

### Vite Source Files

- Renamed JSX-bearing React source files from `.js` to `.jsx` and updated the Vite entry point to `/src/index.jsx`.

### Timers

- `OLabClientApi.createOneShotTimer()` now passes its callback the timer info object (`startedAt`, `lastFiredAt`, `periodMs`), with `lastFiredAt` set to the time the timer fired.
- `OLabClientApi.createRecurringTimer()` now passes the timer info object on every call instead of `(api, document)`, and no longer calls the callback immediately at creation; the first call happens after the first interval.

### Tooling

- Updated `.vscode/launch.json`: the Firefox configuration now opens `http://localhost:3000`, and the `General` Chrome configuration was renamed to `Chrome`.

### Check-ins

Git committer times on branch `dev` (UTC-06:00):

| Commit    | Time     | Summary                                                   |
| --------- | -------- | --------------------------------------------------------- |
| `1f5fa45` | 09:23:47 | Adjust Home padding and fix map ID passed by `jumpToNode` |
| `1917e09` | 09:26:41 | Update release notes for Home and navigation changes      |
| `0051720` | 09:53:53 | Rename React source modules from `.js` to `.jsx`          |
| `0e4ac34` | 09:54:45 | Update Vite HTML entry point to `index.jsx`               |
| `e408ae7` | 09:58:35 | Update release notes for Vite source file changes         |
| `03f8565` | 10:54:05 | Pass timer info to timer callbacks; update launch config  |

## 2026-10-17

### Build And Deployment

- Migrated the React app from Create React App to Vite, including Vite configuration for JSX in `.js` files, Flow type stripping, SVG React components, and CRA-compatible build output paths.
- Moved `index.html` to the project root, converted source modules from `require()` to ES imports, and moved environment settings to Vite modes and `VITE_*` variables.
- Updated npm scripts for Vite and removed CRA-specific dependencies and scripts, along with `build.sh` and `update.sh`.
- Updated both Azure Static Web Apps workflows to build with Node 20 and deploy the prebuilt Vite output.
- Added `scripts/bump-version.mjs` and `version:bump`; CI versions builds as `YY.MM.DD-<GitHub run number>`.

### Player API And UI

- Added current map and node getters to `OLabClientApi`; navigation now skips a request when the target is the current node.
- Standardized API getters to log errors and return `null`, renamed `loadExternalDiv` to `loadDivFromUrl`, and regenerated API documentation from source JSDoc.
- Updated the Header to display the build version without a `Version:` label.
- Added `ListWithSearch` pagination, with 10 rows per page by default and options for 25 or 50; search resets to the first page.
- Replaced two `void ... ||` expressions with explicit statements without changing behavior.

### Documentation

- Rewrote the README for the Vite setup and moved `OLabClientApi.md` into `docs/`.
- Set the package version to `26.10.17-0`.

### Check-ins

Git committer times on branch `dev` (UTC-06:00):

| Commit    | Time     | Summary                                  |
| --------- | -------- | ---------------------------------------- |
| `7b297dd` | 08:55:22 | Map/node getters and navigation behavior |
| `ce1bb68` | 09:01:46 | API docs and version update              |
| `2243bd1` | 09:28:15 | Remove deployment shell scripts          |
| `50d91b5` | 09:49:50 | Migrate from CRA to Vite                 |
| `5cab8f4` | 09:59:27 | Rewrite README                           |
| `d7848b8` | 10:03:05 | Update Azure workflows                   |
| `4408c13` | 10:10:10 | Add build-time version bump              |
| `44a79ac` | 15:10:00 | API error handling and documentation     |
| `9a97422` | 15:19:06 | Display version in Header                |
| `5f382c5` | 15:23:50 | Simplify Header version display          |
| `643aa85` | 15:37:20 | Add list pagination                      |

# OLab Player

React web client for playing OLab4/OLab6 maps. Learners log in, pick a map and work through its nodes, which can include links, counters, constants, questions, embedded scripts, media and TurkTalk chat sessions. It talks to the OLab REST API and, for TurkTalk, a SignalR hub.

The project is built with [Vite](https://vite.dev) (React 17).

## Getting started

```bash
npm install
npm run start:local
```

The dev server runs at [http://localhost:3000](http://localhost:3000) (under the base path from `VITE_PUBLIC_URL`, for example `/player/`) and reloads on edits.

## Configuration

Settings come from Vite env files in the project root. Each `start:*` / `build:*` script runs Vite in a mode that loads `.env` plus the matching `.env.<mode>` file.

| Variable                  | Purpose                                   |
| ------------------------- | ----------------------------------------- |
| `VITE_API_URL`            | Base URL of the OLab API                  |
| `VITE_API_RETRY_COUNT`    | Number of API call retries                |
| `VITE_BASEPATH`           | Application base path used by the player  |
| `VITE_PUBLIC_URL`         | Path the app is served from (Vite `base`) |
| `VITE_SIGNALR_TIMEOUT_MS` | SignalR timeout in milliseconds           |
| `VITE_TTALK_HUB_URL`      | TurkTalk SignalR hub URL                  |
| `VITE_LOG_LEVEL`          | Log level (defaults to `info`)            |

| Mode          | Env file           | Scripts                              |
| ------------- | ------------------ | ------------------------------------ |
| (default)     | `.env`             | `start`, `build`                     |
| `localhost`   | `.env.localhost`   | `start:local`, `build:local`         |
| `debug`       | `.env.debug`       | `build:debug`                        |
| `release`     | `.env.release`     | `build:release`                      |
| `azure`       | `.env.azure`       | `start:azure`, `build:azure`         |
| `azure-dev`   | `.env.azure-dev`   | `start:azure:dev`, `build:azure:dev` |
| `azure-local` | `.env.azure-local` | `start:azure:local`                  |

The app version (`import.meta.env.VITE_APP_VERSION`) is taken from `package.json`.

## npm scripts

### Development

| Script              | Description                       |
| ------------------- | --------------------------------- |
| `start`             | Dev server using `.env` only.     |
| `start:local`       | Dev server in `localhost` mode.   |
| `start:azure`       | Dev server in `azure` mode.       |
| `start:azure:dev`   | Dev server in `azure-dev` mode.   |
| `start:azure:local` | Dev server in `azure-local` mode. |

### Build

Builds go to `build/` (`static/js` and `static/media` subfolders) with sourcemaps.

| Script            | Description                         |
| ----------------- | ----------------------------------- |
| `build`           | Production build using `.env` only. |
| `build:local`     | Build in `localhost` mode.          |
| `build:debug`     | Build in `debug` mode.              |
| `build:release`   | Build in `release` mode.            |
| `build:azure`     | Build in `azure` mode.              |
| `build:azure:dev` | Build in `azure-dev` mode.          |

### Maintenance

| Script         | Description                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------- |
| `clean`        | Removes everything in `build/` and `node_modules/` (`rm -Rf`, needs a Unix-style shell).        |
| `version:full` | Sets the version to today's date, `YY.MM.DD-0`, without creating a git tag.                     |
| `version:inc`  | Increments the prerelease number (for example `26.10.17-0` to `26.10.17-1`), without a git tag. |
| `prepare`      | Installs the husky git hooks. Runs automatically on `npm install`.                              |

## Code formatting

A husky pre-commit hook runs `lint-staged`, which formats staged files with Prettier.

## Deployment scripts

| Script      | Description                                                                                                                                                                |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build.sh`  | `./build.sh release` or `./build.sh debug`. Pulls, links `build/` to the vhost folder, runs `npm install` and `npm run build:<arg>`, links `static/files`, restarts nginx. |
| `update.sh` | Pulls, cleans, reinstalls and rebuilds. It calls `build:dev`, which is not defined in `package.json` and will fail until it is added or changed.                           |

Web server examples are in `apache/`, and Azure Static Web Apps routing is in `staticwebapp.config.json`.

## Script API

Scripts embedded in nodes receive an `olab` object (`OLabClientApi`) for timers, DOM events, counters and navigation. See [OLabClientApi.md](OLabClientApi.md).

## Release notes

See [ReleaseNotes.md](ReleaseNotes.md).

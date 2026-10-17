# Release Notes

## 2026-10-17

Branch: `dev` (commit `7b297dd`)

### OLabClientApi

- Added `getMapName()`, `getMapId()`, `getNodeName()` and `getNodeId()` to read the current map and node from the player props.
- `jumpToNode(nodeId, onShutdownCallback)` now does nothing when `nodeId` is already the current node.

### Documentation

- `OLabClientApi.md` updated with the new "Current map and node" section and the `jumpToNode` behaviour.

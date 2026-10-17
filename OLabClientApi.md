# OLabClientApi

`OLabClientApi` is the object exposed to node scripts. It wraps the player component's state and provides helpers for timers, DOM events, and OLab scoped objects (counters, constants, links, questions).

```js
const api = new OLabClientApi(component, onCreateCallback);
```

`component` must provide `state.dynamicObject`, `state.scopedObject`, `props.props` and the update methods (`updateScopedObject`, `updateObject`, `updateDynamicObjects`).

`onCreateCallback` is optional. If provided, it is called with no arguments at the end of the constructor.

## Lifecycle

| Method                         | Description                                                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `hello()`                      | Logs and returns a greeting that includes the number of active timers.                                                        |
| `shutdown(onShutdownCallback)` | Destroys all timers and event handlers, then calls `onShutdownCallback()` if provided. Call when the script/node is unloaded. |

## Timers

Timers are tracked by key so they can be queried and cleaned up.

| Method                                        | Description                                                                                                                |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `createOneShotTimer(frequencyMs, callback)`   | Calls `callback` once after `frequencyMs` ms, then destroys the timer. Returns the timer key.                              |
| `createRecurringTimer(frequencyMs, callback)` | Calls `callback` immediately, then every `frequencyMs` ms. The callback receives `(api, document)`. Returns the timer key. |
| `destroyTimer(key)`                           | Cancels a timer and removes its metadata. No-op if the key is unknown.                                                     |
| `getTimerStatus(key)`                         | Returns `{ elapsedMs, sinceLastCallMs, remainingMs }`, or `null` if the timer doesn't exist (or a one-shot already fired). |

`remainingMs` is the time until the next callback invocation.

```js
const key = api.createRecurringTimer(5000, () => console.log("tick"));
api.getTimerStatus(key); // { elapsedMs: 1200, sinceLastCallMs: 1200, remainingMs: 3800 }
api.destroyTimer(key);
```

## DOM events

| Method                                        | Description                                                                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `onClick(id, callback)`                       | Sets `onclick` on the element with the given id. Replaces any existing `onclick`.                                               |
| `onEvent(id, eventName, callback)`            | Adds a listener for `eventName`. Throws if the element doesn't exist; ignored if the same `id:eventName` is already registered. |
| `createEventHandler(id, eventName, callback)` | Implementation behind `onEvent`.                                                                                                |
| `destroyEventHandler(key)`                    | Removes a handler by key (`"<id>:<eventName>"`).                                                                                |
| `getDomObject(id)`                            | Returns an `OLabApiDomObject` for the element.                                                                                  |
| `getOLabObjectList()`                         | Logs every element that has an `id` attribute.                                                                                  |
| `loadExternalDiv(url, targetElementId)`       | Fetches `url` and inserts its first `<div>` into the target element.                                                            |

## Current map and node

| Method          | Description                                     |
| --------------- | ----------------------------------------------- |
| `getMapName()`  | Name of the current map (`props.map.name`).     |
| `getMapId()`    | Id of the current map (`props.map.id`).         |
| `getNodeName()` | Title of the current node (`props.node.title`). |
| `getNodeId()`   | Id of the current node (`props.node.id`).       |

## Scoped objects

| Method                          | Returns                                                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `findOLabObject(id, type)`      | Copy of a scoped object by id/name. `type` is `"counters"`, `"links"`, or a scoped object type. Throws if not found. |
| `findWikiInList(list, wiki)`    | Item in `list` matching `name` or numeric `id`. Throws if not found.                                                 |
| `getScript(name)`               | Script scoped object.                                                                                                |
| `getLink(id)`                   | `OLabApiLink`                                                                                                        |
| `getCounter(id)`                | `OLabApiCounter`                                                                                                     |
| `getConstant(id)`               | `OLabApiConstant`                                                                                                    |
| `getSliderQuestion(id)`         | `OLabApiSliderQuestion`                                                                                              |
| `getDropDownQuestion(id)`       | `OLabApiDropdownQuestion`                                                                                            |
| `getDragAndDropQuestion(id)`    | `OLabApiDragAndDropQuestion`                                                                                         |
| `getTextQuestion(id)`           | `OLabApiTextQuestion`                                                                                                |
| `getMultipleChoiceQuestion(id)` | `OLabApiMultipleChoiceQuestion`                                                                                      |
| `getSingleChoiceQuestion(id)`   | `OLabApiSingleChoiceQuestion`                                                                                        |

## State updates

| Method                              | Description                                          |
| ----------------------------------- | ---------------------------------------------------- |
| `updateScopedObject(newObject)`     | Pushes a scoped object change to the component.      |
| `updateObject(newObject)`           | Pushes an object change to the component.            |
| `updateDynamicObject(newCounter)`   | Sets a single counter and refreshes dynamic objects. |
| `updateDynamicObjects(newCounters)` | Replaces dynamic objects on the component.           |

## Navigation

| Method                                   | Description                                                                                                                                                                              |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `jumpToNode(nodeId, onShutdownCallback)` | Does nothing if `nodeId` is already the current node. Otherwise calls `shutdown(onShutdownCallback)` to clean up timers and event handlers, then navigates via `props.onNavigateToNode`. |

# OLabClientApi

`OLabClientApi` exposes the player component's script API. The descriptions and parameter/return details below are taken from the JSDoc comments in `src/components/WikiTags/Script/OLabClientApi.js`.

## Construction

### `new OLabClientApi(component, onCreateCallback = null)`

Creates the script-facing API for a player component.

- `component` (`object`): Player component providing state, props, and update methods.
- `onCreateCallback` (`Function|null`, optional): Optional callback invoked after initialization.

## Lifecycle

### `hello()`

Logs and returns a greeting with the current number of active timers.

- **Returns** (`string`): Greeting message.
- **Throws**: Rethrows errors encountered while creating or logging the message.

### `shutdown(onShutdownCallback = null)`

Destroys the current API instance.

- `onShutdownCallback` (`Function|null`, optional): Callback invoked after cleanup.
- **Throws**: Rethrows errors encountered during cleanup or in the callback.

## Map And Node

### `getMapName()`

Gets the current map name.

- **Returns** (`string|null`): Map name, or null if access fails.

### `getMapId()`

Gets the current map ID.

- **Returns** (`number|string|null`): Map ID, or null if access fails.

### `getNodeName()`

Gets the current node name.

- **Returns** (`string|null`): Node name, or null if access fails.

### `getNodeId()`

Gets the current node ID.

- **Returns** (`number|string|null`): Node ID, or null if access fails.

## Object Lookup

### `findOLabObject(id, type)`

Finds a wikitag object by ID or name.

- `id` (`string|number`): Object ID or name to find.
- `type` (`string`): Object type: `counters`, `links`, or a scoped-object type.
- **Returns** (`object|null`): Matching object; links return null when no matching link exists.
- **Throws** (`Error`): If a scoped object of the requested type cannot be found.

### `findWikiInList(list, wiki)`

Finds a list item whose name or numeric ID matches the supplied value.

- `list` (`Array<object>`): Items to search.
- `wiki` (`string|number`): Name or ID to match.
- **Returns** (`object`): Matching list item.
- **Throws** (`Error`): If no item matches.

### `getScript(name)`

Looks up a script in the scoped-object collection.

- `name` (`string|number`): Script name or ID.
- **Returns** (`object|null`): Matching script, or null if missing or lookup fails.

### `getLink(id)`

Looks up a link wikitag in the current node.

- `id` (`string|number`): Link ID or name.
- **Returns** (`OLabApiLink|null`): Link wrapper, or null if creation fails.

### `getCounter(id)`

Looks up a counter wikitag in the current node.

- `id` (`string|number`): Counter ID or name.
- **Returns** (`OLabApiCounter|null`): Counter wrapper, or null if creation fails.

### `getConstant(id)`

Looks up a constant wikitag in the current node.

- `id` (`string|number`): Constant ID or name.
- **Returns** (`OLabApiConstant|null`): Constant wrapper, or null if creation fails.

### `getSliderQuestion(id)`

Looks up a slider-question wikitag in the current node.

- `id` (`string|number`): Question ID or name.
- **Returns** (`OLabApiSliderQuestion|null`): Wrapper, or null if creation fails.

### `getDropDownQuestion(id)`

Looks up a dropdown-question wikitag in the current node.

- `id` (`string|number`): Question ID or name.
- **Returns** (`OLabApiDropdownQuestion|null`): Wrapper, or null if creation fails.

### `getDragAndDropQuestion(id)`

Looks up a drag-and-drop question wikitag in the current node.

- `id` (`string|number`): Question ID or name.
- **Returns** (`OLabApiDragAndDropQuestion|null`): Wrapper, or null if creation fails.

### `getTextQuestion(id)`

Looks up a text-question wikitag in the current node.

- `id` (`string|number`): Question ID or name.
- **Returns** (`OLabApiTextQuestion|null`): Wrapper, or null if creation fails.

### `getMultipleChoiceQuestion(id)`

Looks up a multiple-choice question wikitag in the current node.

- `id` (`string|number`): Question ID or name.
- **Returns** (`OLabApiMultipleChoiceQuestion|null`): Wrapper, or null if creation fails.

### `getSingleChoiceQuestion(id)`

Looks up a single-choice question wikitag in the current node.

- `id` (`string|number`): Question ID or name.
- **Returns** (`OLabApiSingleChoiceQuestion|null`): Wrapper, or null if creation fails.

## State Updates

### `updateScopedObject(newObject)`

Passes a scoped-object update to the player component.

- `newObject` (`object`): Updated scoped object.
- **Throws**: Rethrows errors from the component update method.

### `updateObject(newObject)`

Passes an object update to the player component.

- `newObject` (`object`): Updated object.
- **Throws**: Rethrows errors from the component update method.

### `updateDynamicObject(newCounter)`

Updates one counter and refreshes the component's dynamic objects.

- `newCounter` (`object`): Counter value to set.
- **Throws**: Rethrows errors from updating the counter or component state.

### `updateDynamicObjects(newCounters)`

Passes updated dynamic objects to the player component.

- `newCounters` (`Array<object>`): Dynamic-object data to apply.
- **Throws**: Rethrows errors from the component update method.

## Timers

### `TimerInfo`

Timing metadata tracked for each timer.

- `startedAt` (`number`): Time the timer was created, in epoch milliseconds.
- `lastFiredAt` (`number|null`): Time the callback last fired, in epoch milliseconds; null until a one-shot timer fires.
- `periodMs` (`number`): Delay (one-shot) or interval (recurring) in milliseconds.
- `elapsedMs` (`number`): Time elapsed since the timer was created, in milliseconds.

### `createOneShotTimer(frequencyMs, callback)`

Creates a one-shot timer that invokes the callback after the requested timeout.

- `frequencyMs` (`number`): Delay in milliseconds.
- `callback` (`function(TimerInfo): void`): Function invoked when the timer expires.
- **Returns** (`string`): Timer key usable with `getTimerStatus` or `destroyTimer`.

### `createRecurringTimer(frequencyMs, callback)`

Creates a recurring timer that invokes the callback at the requested interval.

- `frequencyMs` (`number`): Interval in milliseconds.
- `callback` (`function(TimerInfo): void`): Function invoked immediately and on each interval.
- **Returns** (`string`): Timer key usable with `getTimerStatus` or `destroyTimer`.

### `destroyTimer(key)`

Cancels a timer and removes its timer and status records.

- `key` (`string`): Timer key returned by a timer-creation method.

### `getTimerStatus(key)`

Gets elapsed time and time until the next callback for a timer.

- `key` (`string`): Timer key returned by a timer-creation method.
- **Returns** (`{elapsedMs: number, sinceLastCallMs: number, remainingMs: number}|null`): Status, or null if unknown or a one-shot has fired.

## DOM

### `loadDivFromUrl(url, targetElementId)`

Fetches HTML and inserts its first `div` into the target element. Promise-chain errors are logged but not rethrown.

- `url` (`string`): URL of the HTML document to load.
- `targetElementId` (`string`): ID of the element that receives the `div`.

### `createEventHandler(id, eventName, callback)`

Registers and tracks a DOM event listener using the key `<id>:<eventName>`. Does nothing if that key is already registered.

- `id` (`string`): ID of the DOM element.
- `eventName` (`string`): DOM event name.
- `callback` (`Function`): Event listener.
- **Throws** (`Error`): If the element does not exist.

### `destroyEventHandler(key)`

Removes a tracked DOM event listener.

- `key` (`string`): Listener key in the form `<id>:<eventName>`.

### `onClick(id, callback)`

Assigns a click handler to a DOM element, replacing its existing `onclick` handler. Does nothing if the element is not found.

- `id` (`string`): ID of the DOM element.
- `callback` (`Function`): Click handler.

### `onEvent(id, eventName, callback)`

Registers a tracked DOM event handler.

- `id` (`string`): ID of the DOM element.
- `eventName` (`string`): DOM event name.
- `callback` (`Function`): Event listener.
- **Throws** (`Error`): If the element does not exist.

### `getOLabObjectList()`

Logs the IDs of all DOM elements that have an `id` attribute.

- **Returns** (`void|null`): Null if querying the document fails.

### `getDomObject(id)`

Creates a DOM-object wrapper for the element with the given ID.

- `id` (`string`): ID of the DOM element.
- **Returns** (`OLabApiDomObject|null`): Wrapper, or null if creation fails.

## Navigation

### `jumpToNode(nodeId, onShutdownCallback = null)`

Navigates to another node in the current map.

- `nodeId` (`number|string`): Destination node ID.
- `onShutdownCallback` (`Function|null`, optional): Optional callback invoked after cleanup.

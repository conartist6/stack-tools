# stack-tools

`stack-tools` provides utilites for printing and parsing errors and their stacks.

## Usage

```js
import { printErrors } from 'stack-tools';

try {
  const baseError = new Error('base');
  const wrapperError = new Error('wrapper');
  baseError.cause = wrapperError;

  throw wrapperError;
} catch (e) {
  console.error(printErrors(error));
  // Error: wrapper
  //    at <anonymous>:5:28
  // Caused by: Error: base
  //    at <anonymous>:4:25
}
```

## API

The general API provides these methods:

- `captureFrames(omitFrames = 1)` returns the stack trace at the caller's location, omitting the last `omitFrames` frames. The default is to omit one frame, which would be the frame for `captureStack` itself.
- `printFrames(error)` returns the frames of `error.stack` as a string, omitting the header text.
- `printErrorHeader(error)` returns `` `${name}: ${message}` ``
- `printErrorHeaders(error)` returns `` `${printErrorHeader(error)}\nCaused by: ${printErrorHeaders(error.cause)}` ``
- `printError(error)` returns `` `${printHeader(errror)}\n${error.stack}` ``
- `printErrors(error)` returns `` `${printError(error)}\nCaused by: ${printErrors(error.cause)}` ``

## Platform-specific APIs

The platform-specific API allows parsing and reprinting of errors. **Parsing errors is a best-effort process, and you must never use the results of parsing an error to define business logic. The only supported usage of output from parseError is as input to printError.** These APIs exist to allow you to reformat errors which may contain unhelpful cruft.

### v8

```js
import {
  parseErrors,
  cleanErrors,
  printErrors,
} from 'stack-tools/v8';

try {
  doStuff();
} catch (e) {
  const errors = parseErrors(e);

  cleanErrors(errors);

  console.error(printErrors(errors));
}
```

v8 defines the following methods:

- `parseError(errror)` returns a parsed error
- `parseErrors(errors)` returns an array of parsed errors
- `printError(parsedError)` returns as string with the printed error
- `printErrors(parsedErrors)` returns a string with the printed errors
- `isInternalFrame(frame)` returns `true` if frame is internal.
- `cleanError(error, predicate = isInternalFrame)` mutates `error.stack`, filtering out internal frames. Returns `error`.
- `cleanErrors(errors, predicate = isInternalFrame)` for each error mutates `error.stack`, filtering out internal frames. Returns `errors`.

### node

The node environment extends the v8 environment with a definition of `isInternalFrame` that includes node internals.

```js
import getPackageName from 'get-package-name';
import {
  isInternalFrame as isNodeInternalFrame,
  parseErrors,
  cleanErrors,
  printErrors,
} from 'stack-tools/node';

const internalPackages = new Set([
  'my-package',
  'test-runner',
]);

const isInternalFrame = (frame) => {
  return (
    isNodeInternalFrame(frame) ||
    (frame.site.type === 'file' &&
      internalPackages.has(getPackageName(frame.site.file)))
  );
};

try {
  doStuff();
} catch (e) {
  const errors = parseErrors(e);

  cleanErrors(errors, isInternalFrame);

  console.error(printErrors(errors));
}
```

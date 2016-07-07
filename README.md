# node-wevtutil - ETW Tracing for Node.js

This is a utility for reading ETW events from the supplied channels.

# Getting Started

## Installation

The `wevtutil` module can be installed via NPM:
```
npm install wevtutil --save
```

## Usage

In order to create a `wevtutil` logger, you can use the following options:
- `channel`: `Array<String>` - *(Required)* An array of strings for the channels.
- `processor`: `T => void` - *(Required)* A function which processes the output from the mapper.
- `filter`: `elementtree => Boolean` - A function which takes an `elementtree` XML element and filters the values you do not want.  If not provided, this will not filter the events.
- `mapper`: `elementtree => T` - A function which takes an `elementtree` XML element and returns a new object which contains the data you want.  If not provided, this will provide the `channel`, `pid` and `timeCreated`.

The `wevtutil` module can be initialized with the following code with an array of channels required as well as a `processor` function which gives you the events for you to process.

```js
const wevtutil = require('wevtutil');

function processEvent(event) {
  console.log(event.pid);
}

const logger = wevtutil({
  channels: [
    'Microsoft-Windows-AppHost/Admin',
    'Microsoft-Windows-AppHost/ApplicationTracing'
  ],
  processor: processEvent
});
```

Once you are finished, you can stop the logging via the following:
```js
logger.unsubscribe();
```

You can perform a filter such as the following to ensure that we only get exceptions and we filter only to our application name:

```js
const APP_TRACING_LOG = 'Microsoft-Windows-AppHost/ApplicationTracing';
const ADMIN_LOG 'Microsoft-Windows-AppHost/Admin';
const APP_NAME = 'HelloWorld';

function getElement(elem, elemStr) {
  let result;

  const found = elem.findall(elemStr);
  if (found.length > 0) {
    result = found[0].text;
  }

  return result;
}

function filter(event) {
  if (getElement(event, './System/Channel') === ADMIN_LOG &&
      typeof getElement(event, './UserData/WWAUnhandledApplicationException') === 'undefined' &&
      typeof getElement(event, './UserData/WWATerminateApplication') === 'undefined') {
        return false;
  }

  if (getElement(event, './System/Channel') === APP_TRACING_LOG &&
      typeof getElement(event, './UserData/WWADevToolBarLog') === 'undefined') {
        return false;
  }

  const displayName = getElement(event, './UserData/WWADevToolBarLog/DisplayName') ||
                      getElement(event, './UserData/WWAUnhandledApplicationException/DisplayName') ||
                      getElement(event, './UserData/WWATerminateApplication/DisplayName');

  if (displayName !== APP_NAME) {
    return false;
  }

  return true;
}

const logger = wevtutil({
  channels: [
    'Microsoft-Windows-AppHost/Admin',
    'Microsoft-Windows-AppHost/ApplicationTracing'
  ],
  processor: processEvent,
  filter: filter
});
```

You can also transform the original input so that you get more information than the default mapper.  For example, we can get detailed information such as the stack trace and other information:

```js
function getElement(elem, elemStr) {
  let result;

  const found = elem.findall(elemStr);
  if (found.length > 0) {
    result = found[0].text;
  }

  return result;
}

function getAttribute(elem, elemStr, attribute) {
  let result;

  const found = elem.findall(elemStr);
  if (found.length > 0) {
    result = found[0].get(attribute);
  }

  return result;
}

function mapper(event) {
  return {
    channel:          getElement(event, './System/Channel'),
    timeCreated:      getAttribute(event, './System/TimeCreated', 'SystemTime'),
    pid:              getAttribute(event, './System/Execution', 'ProcessID'),
    source:           getElement(event, './UserData/WWADevToolBarLog/Source'),
    displayName:      getElement(event, './UserData/WWADevToolBarLog/DisplayName') ||
                      getElement(event, './UserData/WWAUnhandledApplicationException/DisplayName') ||
                      getElement(event, './UserData/WWATerminateApplication/DisplayName'),
    appName:          getElement(event, './UserData/WWAUnhandledApplicationException/ApplicationName'),
  };
}

const logger = wevtutil({
  channels: [
    'Microsoft-Windows-AppHost/Admin',
    'Microsoft-Windows-AppHost/ApplicationTracing'
  ],
  processor: processEvent,
  mapper: mapper
});
```

# Contributing

By contributing or commenting on issues in this repository, whether you've read them or not, you're agreeing to the [Contributor Code of Conduct](CODE_OF_CONDUCT.md). Much like traffic laws, ignorance doesn't grant you immunity.

Contributions are welcome for the following:
- Code improvements
- Documentation
- Unit tests

Please conform to our settings in our ESLint and EditorConfig settings.

# LICENSE

The MIT License (MIT)

Copyright (c) 2016 Matthew Podwysocki

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

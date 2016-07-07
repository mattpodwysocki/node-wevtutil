'use strict';

const etw = require('./lib/etw');
const DEFAULT_MAPPER = require('./lib/default_mapper');

// App state
let states;
const timers = [];
let options = {};

function startLogging(channel) {
  let loggingDate = new Date();
  timers.push(setInterval(() => {
    etw.getEvents(channel, Date.now() - loggingDate, options).forEach(options.processor);
    loggingDate = new Date();
  }, 1000));
}

function stopLogging() {
  states.forEach(state => {
    if (!state.initial && state.current) {
      etw.disableChannel(state.channel);
    }
  });

  timers.forEach(clearInterval);
}

function DEFAULT_FILTER(event) {
  return true;
}

function log(opts) {
  const DEFAULT_OPTS = {
    mapper: DEFAULT_MAPPER,
    filter: DEFAULT_FILTER,
    channels: []
  };

  Object.assign(options, DEFAULT_OPTS, opts);

  states = options.channels.map(channel => {
    let state = { channel: channel };
    state.initial = state.current = etw.getLogState(channel);

    if (!state.current) {
      etw.enableChannel(channel);
      state.current = etw.getLogState(channel);
    }

    return state;
  });

  if (!states.every(state => state.current)) {
    throw new Error('No log channels are enabled');
  }

  options.channels.forEach(channel => startLogging(channel));

  return {
    unsubscribe: stopLogging
  };
}

module.exports = log;

'use strict';

const elementTree = require('elementtree');
const execSync = require('child_process').execSync;

function getLogState(channel) {
  return execSync(`wevtutil get-log ${channel}`).toString().indexOf('enabled: true') !== -1;
}

function enableChannel(channel) {
  try {
    execSync(`wevtutil set-log ${channel} /e:false /q:true`);
    execSync(`wevtutil set-log ${channel} /e:true /rt:true /ms:4194304 /q:true`);
  } catch (e) {
    throw new Error(`Cannot enable log channel: ${channel}. Try running the script with administrative privileges.`);
  }
}

function disableChannel(channel) {
  execSync(`wevtutil set-log ${channel} /e:false /q:true`);
}

function getEvents(channel, fromTime, options) {
  let cmd = `wevtutil qe ${channel} /q:"*[System [TimeCreated[timediff(@SystemTime)<=${fromTime}]]]" /e:root`;
  return parseEvents(execSync(cmd).toString(), options);
}

function parseEvents(output, options) {
  const elemTree = elementTree.parse(output);
  const events = elemTree.getroot().findall('./Event');

  return events
    .filter(options.filter)
    .map(options.mapper);
}

module.exports = {
  getLogState,
  enableChannel,
  disableChannel,
  getEvents
};

'use strict';

function getElementValue(elem, elemStr, attrStr) {
  let result;

  const found = elem.findall(elemStr);
  if (found.length > 0) {
    result = !!attrStr ? found[0].get(attrStr) : found[0].text;
  }

  return result;
}

function DEFAULT_MAP(event) {
  const result = {
    channel: getElementValue(event, './System/Channel'),
    timeCreated: getElementValue(event, './System/TimeCreated', 'SystemTime'),
    pid: getElementValue(event, './System/Execution', 'ProcessID'),
  };

  return result;
}

module.exports = DEFAULT_MAP;

"use strict";

const { createMinHeap, addLogToHeap } = require("./shared");

// Print all entries, across all of the sources, in chronological order.

module.exports = (logSources, printer) => {
  const minHeap = createMinHeap();

  for (const [index, logSource] of logSources.entries()) {
    const log = logSource.pop();
    addLogToHeap(log, index, minHeap);
  }

  while (!minHeap.isEmpty()) {
    const { log, index } = minHeap.pop();
    printer.print(log);

    const nextLog = logSources[index].pop();
    addLogToHeap(nextLog, index, minHeap);
  }

  printer.done();
  return console.log("Sync sort complete.");
};

const { Heap } = require("heap-js");

module.exports = {
  addLogToHeap,
  createMinHeap,
};

function addLogToHeap(log, index, minHeap) {
  if (log) {
    minHeap.push({
      log,
      index,
      date: log.date.getTime(),
    });
  }
}

function createMinHeap() {
  return new Heap((a, b) => a.date - b.date);
}

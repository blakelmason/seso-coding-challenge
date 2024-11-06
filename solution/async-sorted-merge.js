"use strict";

const { first } = require("lodash");
const { addLogToHeap, createMinHeap } = require("./shared");
const { Readable } = require("stream");

// Print all entries, across all of the *async* sources, in chronological order.

module.exports = (logSources, printer) => {
  return new Promise(async (resolve, reject) => {
    const minHeap = createMinHeap();
    const streams = new Map();

    for (const [index, logSource] of logSources.entries()) {
      const stream = new Readable({
        objectMode: true,
        async read() {
          try {
            const log = await logSource.popAsync();
            const canPushMore = this.push(log);
            if (!canPushMore) {
              this.pause();
            }
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        },
      });
      streams.set(index, stream);
      await new Promise((resolve) => stream.once("readable", resolve));
      const firstLog = stream.read();
      if (!firstLog) {
        streams.delete(index);
        stream.destroy();
      } else {
        addLogToHeap(firstLog, index, minHeap);
      }
    }

    for (;;) {
      const { log, index } = minHeap.pop();
      printer.print(log);

      if (minHeap.isEmpty()) {
        break;
      }

      const stream = streams.get(index);

      let nextLog = stream.read();

      switch (nextLog) {
        case null:
          await new Promise((resolve) => stream.once("readable", resolve));
          nextLog = stream.read();
          break;
        case false:
          streams.delete(index);
          stream.destroy();
          break;
      }

      addLogToHeap(nextLog, index, minHeap);
    }

    printer.done();
    resolve(console.log("Async sort complete."));
  });
};

const {Transform} = require('stream');

class SummaryObject extends Transform {
  constructor() {
    super();
    this.bytes = 0;
    this.lines = 0;
    this.startTime = Date.now();
  }
  _transform(data, enc, next) {
    let currentTime = Date.now();
    let elapsed = (currentTime - this.startTime) / 1000;
    this.lines += (data.toString().match(/\n/g) || '').length
    this.bytes += data.byteLength;
    this.push(JSON.stringify({bytes: this.bytes, elapsed, lines: this.lines}))
    next();
  }
};


class Summary extends Transform {
  _transform(data, enc, next) {
    let summary = JSON.parse(data);
    let throughput = summary.bytes  / summary.elapsed;
    this.push('throughput (bytes/sec) = ' + throughput + ' lines = ' + summary.lines + '\n');
    next();
  }
};

let tx0 = new SummaryObject();
let tx1 = new Summary();

process.stdin.pipe(tx0).pipe(tx1).pipe(process.stdout);
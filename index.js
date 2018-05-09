const fs = require('fs');
const {Transform} = require('stream');

const filePath = process.argv[2];

class SummaryObject extends Transform {
  constructor(options) {
    super(options);
    this.bytes = 0;
    this.lines = 0;
    this.startTime = Date.now();
  }
  _transform(data, enc, next) {
    let currentTime = Date.now();
    let elapsed = (currentTime - this.startTime) / 1000;
    this.lines += (data.toString().match(/\n/g) || '').length
    this.bytes += data.byteLength;
    this.push({bytes: this.bytes, elapsed, lines: this.lines})
    next();
  }
};

class Summary extends Transform {
  constructor(options) {
    super(options);
  }
  _transform(data, enc, next) {
    let summary = data;
    let throughput = summary.bytes  / summary.elapsed;
    this.push('throughput (bytes/sec) = ' + throughput + ' lines = ' + summary.lines + '\n');
    next();
  }
};

let tx0 = new SummaryObject({readableObjectMode: true});
let tx1 = new Summary({writableObjectMode: true});

let fileName = process.argv[2]
console.log(`Entered filepath is : ${fileName}`);

var fileReader = fs.createReadStream('test.txt');
fileReader.pipe(tx0).pipe(tx1).pipe(process.stdout);
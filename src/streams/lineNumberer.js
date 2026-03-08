import { Transform } from "stream";

const lineNumberer = () => {
  let lineNumber = 1;
  let remaining = "";

  const transform = new Transform({
    transform(chunk, encoding, callback) {
      const data = remaining + chunk.toString();
      const lines = data.split("\n");
      remaining = lines.pop();
      for (const line of lines) {
        this.push(`${lineNumber} | ${line}\n`);
        lineNumber++;
      }
      callback();
    },
    flush(callback) {
      if (remaining) {
        this.push(`${lineNumber} | ${remaining}\n`);
      }
      callback();
    },
  });

  process.stdin.pipe(transform).pipe(process.stdout);
};

lineNumberer();

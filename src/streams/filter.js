import { Transform } from "stream";

const filter = () => {
  let pattern = "";
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--pattern" && i + 1 < args.length) {
      pattern = args[i + 1];
      break;
    }
  }

  let remaining = "";

  const transform = new Transform({
    transform(chunk, encoding, callback) {
      const data = remaining + chunk.toString();
      const lines = data.split("\n");
      remaining = lines.pop();
      for (const line of lines) {
        if (line.includes(pattern)) {
          this.push(line + "\n");
        }
      }
      callback();
    },
    flush(callback) {
      if (remaining && remaining.includes(pattern)) {
        this.push(remaining + "\n");
      }
      callback();
    },
  });

  process.stdin.pipe(transform).pipe(process.stdout);
};

filter();

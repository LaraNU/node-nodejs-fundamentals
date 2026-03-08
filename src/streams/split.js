import fs from "fs";
import readline from "readline";
import path from "path";

const split = async () => {
  let linesPerChunk = 10;
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--lines" && i + 1 < args.length) {
      linesPerChunk = parseInt(args[i + 1], 10) || 10;
      break;
    }
  }

  const sourcePath = path.join(process.cwd(), "source.txt");
  const rl = readline.createInterface({
    input: fs.createReadStream(sourcePath),
    crlfDelay: Infinity,
  });

  let chunkIndex = 1;
  let currentLines = [];
  let writeStream = null;

  const createNewChunk = () => {
    if (writeStream) {
      writeStream.end();
    }
    const chunkPath = path.join(process.cwd(), `chunk_${chunkIndex}.txt`);
    writeStream = fs.createWriteStream(chunkPath);
    chunkIndex++;
  };

  rl.on("line", (line) => {
    if (currentLines.length === 0) {
      createNewChunk();
    }
    currentLines.push(line);
    writeStream.write(line + "\n");
    if (currentLines.length >= linesPerChunk) {
      currentLines = [];
    }
  });

  rl.on("close", () => {
    if (writeStream) {
      writeStream.end();
    }
  });
};

await split();

import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { PassThrough } from "stream";
import zlib from "zlib";

const compressDir = async () => {
  const toCompress = path.join(process.cwd(), "workspace", "toCompress");
  const compressedDir = path.join(process.cwd(), "workspace", "compressed");
  const archivePath = path.join(compressedDir, "archive.br");

  try {
    await fs.access(toCompress);
  } catch {
    throw new Error("FS operation failed");
  }

  async function getFiles(dir, base) {
    const files = [];
    const items = await fs.readdir(dir);
    for (const item of items) {
      const full = path.join(dir, item);
      const stat = await fs.stat(full);
      if (stat.isDirectory()) {
        files.push(...(await getFiles(full, base)));
      } else {
        files.push({ relative: path.relative(base, full), full });
      }
    }
    return files;
  }

  const files = await getFiles(toCompress, toCompress);

  await fs.mkdir(compressedDir, { recursive: true });

  const output = fsSync.createWriteStream(archivePath);
  const brotli = zlib.createBrotliCompress();
  const pass = new PassThrough();

  pass.pipe(brotli).pipe(output);

  for (const file of files) {
    const content = await fs.readFile(file.full);
    const pathBuf = Buffer.from(file.relative, "utf8");
    const pathLen = Buffer.alloc(4);
    pathLen.writeUInt32LE(pathBuf.length, 0);
    const contentLen = Buffer.alloc(4);
    contentLen.writeUInt32LE(content.length, 0);
    pass.write(pathLen);
    pass.write(pathBuf);
    pass.write(contentLen);
    pass.write(content);
  }

  pass.end();
};

await compressDir();

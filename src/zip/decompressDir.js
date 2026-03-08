import fs from "fs/promises";
import path from "path";
import zlib from "zlib";

const decompressDir = async () => {
  const compressedDir = path.join(process.cwd(), "workspace", "compressed");
  const archivePath = path.join(compressedDir, "archive.br");
  const decompressedDir = path.join(process.cwd(), "workspace", "decompressed");

  try {
    await fs.access(compressedDir);
    await fs.access(archivePath);
  } catch {
    throw new Error("FS operation failed");
  }

  const compressedData = await fs.readFile(archivePath);
  const decompressedData = zlib.brotliDecompressSync(compressedData);

  let offset = 0;
  const buffer = decompressedData;

  while (offset < buffer.length) {
    const pathLen = buffer.readUInt32LE(offset);
    offset += 4;

    const pathEnd = offset + pathLen;
    const filePath = buffer.toString("utf8", offset, pathEnd);
    offset = pathEnd;

    const contentLen = buffer.readUInt32LE(offset);
    offset += 4;

    const contentEnd = offset + contentLen;
    const content = buffer.subarray(offset, contentEnd);
    offset = contentEnd;

    const fullPath = path.join(decompressedDir, filePath);

    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(fullPath, content);
  }
};

await decompressDir();

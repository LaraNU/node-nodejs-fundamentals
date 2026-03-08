import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const snapshot = async () => {
  const rootPath = path.resolve(__dirname, "../../workspace");

  try {
    await fs.access(rootPath);
  } catch {
    throw new Error("FS operation failed");
  }

  const entries = [];

  const scan = async (dir) => {
    const items = await fs.readdir(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      const relativePath = path.relative(rootPath, fullPath);
      if (stat.isDirectory()) {
        entries.push({
          path: relativePath,
          type: "directory",
        });
        await scan(fullPath);
      } else {
        const content = await fs.readFile(fullPath);
        entries.push({
          path: relativePath,
          type: "file",
          size: stat.size,
          content: content.toString("base64"),
        });
      }
    }
  };

  await scan(rootPath);

  const snapshotData = {
    rootPath,
    entries,
  };

  const snapshotFilePath = path.join(path.dirname(rootPath), "snapshot.json");

  await fs.writeFile(snapshotFilePath, JSON.stringify(snapshotData, null, 2));
};

await snapshot();

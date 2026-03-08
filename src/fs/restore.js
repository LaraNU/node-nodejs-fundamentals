import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const restore = async () => {
  const snapshotPath = path.resolve(__dirname, "../../snapshot.json");
  const restoreDir = path.resolve(__dirname, "../../workspace_restored");

  try {
    await fs.access(snapshotPath);
  } catch {
    throw new Error("FS operation failed");
  }

  try {
    await fs.access(restoreDir);
    throw new Error("FS operation failed");
  } catch (err) {
    if (err.message === "FS operation failed") throw err;
  }

  const snapshotData = JSON.parse(await fs.readFile(snapshotPath, "utf-8"));

  await fs.mkdir(restoreDir, { recursive: true });

  for (const entry of snapshotData.entries) {
    const fullPath = path.join(restoreDir, entry.path);
    const dirName = path.dirname(fullPath);

    if (entry.type === "directory") {
      await fs.mkdir(fullPath, { recursive: true });
    } else if (entry.type === "file") {
      await fs.mkdir(dirName, { recursive: true });
      const content = Buffer.from(entry.content, "base64");
      await fs.writeFile(fullPath, content);
    }
  }
};

await restore();

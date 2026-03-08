import fs from "fs/promises";
import path from "path";

const merge = async () => {
  const workspacePath = path.join(process.cwd(), "workspace");
  const partsPath = path.join(workspacePath, "parts");
  const mergedPath = path.join(workspacePath, "merged.txt");

  try {
    await fs.access(partsPath);
  } catch {
    throw new Error("FS operation failed");
  }

  const args = process.argv.slice(2);
  const filesArg = args.find((_, i) => args[i - 1] === "--files");
  const filesToMerge = filesArg ? filesArg.split(",") : null;

  let fileList = [];

  if (filesToMerge) {
    for (const file of filesToMerge) {
      const filePath = path.join(partsPath, file);
      try {
        await fs.access(filePath);
        fileList.push(filePath);
      } catch {
        throw new Error("FS operation failed");
      }
    }
  } else {
    const items = await fs.readdir(partsPath, { withFileTypes: true });

    const txtFiles = items
      .filter((item) => item.isFile() && item.name.endsWith(".txt"))
      .map((item) => item.name);

    if (txtFiles.length === 0) {
      throw new Error("FS operation failed");
    }

    txtFiles.sort((a, b) => a.localeCompare(b));
    fileList = txtFiles.map((name) => path.join(partsPath, name));
  }

  await fs.writeFile(mergedPath, "");

  for (const filePath of fileList) {
    const data = await fs.readFile(filePath);
    await fs.appendFile(mergedPath, data);
  }
};

await merge();

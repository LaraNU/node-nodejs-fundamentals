import fs from "fs/promises";
import path from "path";

const findByExt = async () => {
  let ext = "txt";
  const args = process.argv.slice(2);

  const extIndex = args.indexOf("--ext");
  if (extIndex !== -1 && args[extIndex + 1]) {
    ext = args[extIndex + 1];
  }

  ext = ext.startsWith(".") ? ext.slice(1) : ext;

  const workspacePath = path.join(process.cwd(), "workspace");

  try {
    await fs.access(workspacePath);
  } catch {
    throw new Error("FS operation failed");
  }

  async function collectFiles(dir, ext, relativeTo) {
    const files = [];
    const items = await fs.readdir(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      if (stat.isDirectory()) {
        const subFiles = await collectFiles(fullPath, ext, relativeTo);
        files.push(...subFiles);
      } else if (item.endsWith(`.${ext}`)) {
        const relativePath = path.relative(relativeTo, fullPath);
        files.push(relativePath);
      }
    }
    return files;
  }

  const allFiles = await collectFiles(workspacePath, ext, workspacePath);

  allFiles.sort();
  for (const file of allFiles) {
    console.log(file);
  }
};

await findByExt();

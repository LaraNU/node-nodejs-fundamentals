import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import crypto from "crypto";

const verify = async () => {
  const checksumsPath = path.join(process.cwd(), "checksums.json");

  let checksums;
  try {
    const buf = await fsp.readFile(checksumsPath);
    let raw;
    try {
      raw = buf.toString("utf8");
      if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
      checksums = JSON.parse(raw);
    } catch {
      raw = buf.toString("utf16le");
      if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
      checksums = JSON.parse(raw);
    }
  } catch (err) {
    throw new Error("FS operation failed");
  }

  const computeHash = (filePath) => {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash("sha256");
      const stream = fs.createReadStream(filePath);
      stream.on("data", (chunk) => hash.update(chunk));
      stream.on("error", (err) => reject(err));
      stream.on("end", () => {
        resolve(hash.digest("hex"));
      });
    });
  };

  for (const [filename, expected] of Object.entries(checksums)) {
    const filePath = path.join(process.cwd(), filename);
    let actual;
    try {
      actual = await computeHash(filePath);
    } catch {
      console.log(`${filename} — FAIL`);
      continue;
    }
    if (actual === expected) {
      console.log(`${filename} — OK`);
    } else {
      console.log(`${filename} — FAIL`);
    }
  }
};

await verify();

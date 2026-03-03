import fs from "fs/promises";
import path from "path";

export async function saveUpload(file: File, prefix: string) {
  const dir = path.join(process.cwd(), "uploads");
  await fs.mkdir(dir, { recursive: true });
  const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
  const filename = `${prefix}-${Date.now()}${ext}`;
  const fp = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fp, buffer);
  return fp;
}

import { extname } from "path";
import { appendFile, copyFile, readdir, readFile, unlink, writeFile } from "fs/promises";
import { endGroup, info, startGroup, summary } from "@actions/core";

export async function getExportedJSONFiles(input) {
  return await getExportedFileWithExtn(input, "json");
}

async function getExportedFileWithExtn(input, extn) {
  let files = [];

  const dirContents = await readdir(".", { withFileTypes: true });
  for (let d of dirContents) {
    if (!d.isFile()) {
      continue;
    }

    for (let r of input.runs) {
      if (extname(d.name) == `.${extn}` && d.name.includes(r)) {
        files.push(d.name);
      }
    }
  }

  return files;
}

export async function removeFiles(files) {
  for (let f of files) {
    await unlink(f)
  }
}

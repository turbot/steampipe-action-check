import { appendFile, readdir, readFile, unlink, writeFile } from "fs/promises";
import { extname } from "path";

export async function removeFiles(files) {
  for (let f of files) {
    await unlink(f)
  }
}

export async function getExportedJSONFiles(input) {
  return await getExportedFileWithExtn(input, "json")
}

async function getExportedFileWithExtn(input, extn) {
  let files = []

  const dirContents = await readdir(".", { withFileTypes: true })
  for (let d of dirContents) {
    if (!d.isFile()) {
      continue
    }

    if (extname(d.name).length < 2) {
      continue
    }

    for (let r of input.runs) {
      if (d.name.startsWith(r) && extname(d.name) == `.${extn}`) {
        files.push(d.name)
      }
    }
  }

  return files
}
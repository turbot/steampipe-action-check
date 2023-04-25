import { extname } from "path";
import { appendFile, copyFile, readdir, readFile, unlink, writeFile } from "fs/promises";

export async function removeFiles(files) {
  for (let f of files) {
    await unlink(f);
  }
}

export async function getExportedJSONFiles(input) {
  return await getExportedFileWithExtn(input, "json");
}

export async function getExportedMDFiles(input) {
  return await getExportedFileWithExtn(input, "md");
}

async function getExportedFileWithExtn(input, extn) {
  let files = [];

  const dirContents = await readdir(".", { withFileTypes: true });
  for (let d of dirContents) {
    if (!d.isFile()) {
      continue;
    }

    if (extname(d.name).length < 2) {
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


export async function exportStepSummary(input) {
  startGroup("Sending Summary")
  info("Fetching output")
  const mdFiles = await getExportedMDFiles(input)
  info("Combining outputs")
  await combineFiles(mdFiles, "summary.md")
  info("Pushing to Platform")
  await copyFile("summary.md", input.summaryFile)
  removeFiles(mdFiles)
  endGroup()
}

export async function removeFiles(files) {
  for (let f of files) {
    await unlink(f)
  }
}

async function combineFiles(files, writeTo) {
  await writeFile(writeTo, "")
  for (let file of files) {
    const content = await readFile(file)
    await appendFile(writeTo, content)
  }
}
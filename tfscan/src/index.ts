import { addPath, endGroup, setFailed, startGroup } from "@actions/core";
import { info } from "console";
import { appendFile, copyFile, readdir, readFile, stat, unlink, writeFile } from "fs/promises";
import { extname } from "path";
import { Annotation, PushAnnotations, GetAnnotations, ParseResultFile } from "./annotate";
import { ActionInput } from "./input";
import { downloadAndDeflateSteampipe, installMod, installTerraform, installSteampipe, runSteampipeCheck, writeConnections } from "./steampipe";

async function run() {
  try {
    const inputs = new ActionInput()

    const steampipePath = `${await downloadAndDeflateSteampipe(inputs.version)}/steampipe`;
    addPath(steampipePath);

    const modPath = await installMod()

    await installSteampipe(steampipePath)
    await installTerraform(steampipePath)
    await writeConnections(inputs)

    try {
      // since `steampipe check` may exit with a non-zero exit code - this is normal
      await runSteampipeCheck(steampipePath, modPath, inputs, ["json", "md"])
    }
    catch (e) {
      throw e
    }
    finally {
      await exportStepSummary(inputs)
      await exportAnnotations(inputs)
    }

  } catch (error) {
    setFailed(error.message);
  }
}

async function exportAnnotations(input: ActionInput) {
  startGroup("Processing output")
  info("Fetching output")
  const jsonFiles = await getExportedJSONFiles(input)
  const annotations: Array<Annotation> = []
  for (let j of jsonFiles) {
    const result = await ParseResultFile(j)
    annotations.push(...GetAnnotations(result))
  }
  info(`Pushing Annotations`)
  await PushAnnotations(annotations)
  removeFiles(jsonFiles)
  endGroup()
}

async function exportStepSummary(input: ActionInput) {
  startGroup("Sending Summary")
  info("Fetching output")
  const mdFiles = await getExportedSummaryMarkdownFiles(input)
  info("Combining outputs")
  await combineFiles(mdFiles, "summary.md")
  info("Pushing to Platform")
  await copyFile("summary.md", input.summaryFile)
  removeFiles(mdFiles)
  endGroup()
}

async function removeFiles(files: Array<string>) {
  for (let f of files) {
    await unlink(f)
  }
}

async function combineFiles(files: Array<string>, writeTo: string) {
  await writeFile(writeTo, "")
  for (let file of files) {
    const content = await readFile(file)
    await appendFile(writeTo, content)
  }
}

async function getExportedSummaryMarkdownFiles(input: ActionInput) {
  return await getExportedFileWithExtn(input, "md")
}
async function getExportedJSONFiles(input: ActionInput) {
  return await getExportedFileWithExtn(input, "json")
}

async function getExportedFileWithExtn(input: ActionInput, extn: string) {
  let files = new Array<string>()

  const dirContents = await readdir(".",{withFileTypes:true})
  for (let d of dirContents) {
    if (!d.isFile()) {
      continue
    }

    if (extname(d.name).length < 2) {
      continue
    }

    for (let r of input.getRun()) {
      if (d.name.startsWith(r) && extname(d.name) == `.${extn}`) {
        files.push(d.name)
      }
    }
  }

  return files
}

run()

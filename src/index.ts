import { addPath, setFailed } from "@actions/core";
import { appendFile, copyFile, readdir, readFile, stat, unlink, writeFile } from "fs/promises";
import { extname } from "path";
import { Annotation, PushAnnotations, GetAnnotations, ParseResultFile } from "./annotate";
import { ActionInput } from "./input";
import { DownloadAndDeflateSteampipe, InstallMod, InstallPlugins, InstallSteampipe, RunSteampipeCheck, WriteConnections } from "./steampipe";

async function run() {
  try {
    const actionInputs = new ActionInput()

    const steampipePath = `${await DownloadAndDeflateSteampipe(actionInputs.version)}/steampipe`;
    addPath(steampipePath);

    await InstallSteampipe(steampipePath)
    await InstallPlugins(steampipePath, actionInputs.plugins)
    await WriteConnections(actionInputs.connectionData)
    let modPath = ""
    if (actionInputs.modRepository.length > 0) {
      modPath = await InstallMod(actionInputs.modRepository)
      if (modPath.length == 0) {
        setFailed("bad repository for mod")
        return
      }
    }

    try {
      // since `steampipe check` may exit with a non-zero exit code
      await RunSteampipeCheck(steampipePath, modPath, actionInputs, ["json", "md"])
    }
    catch (e) {
      throw e
    }
    finally {
      await exportStepSummary(actionInputs)
      await exportAnnotations(actionInputs)
    }

  } catch (error) {
    setFailed(error.message);
  }
}

async function exportAnnotations(input: ActionInput) {
  const jsonFiles = await getExportedJSONFiles(input)
  const annotations: Array<Annotation> = []
  for (let j of jsonFiles) {
    const result = await ParseResultFile(j)
    annotations.push(...GetAnnotations(result))
  }
  await PushAnnotations(annotations)
  removeFiles(jsonFiles)
}

async function exportStepSummary(input: ActionInput) {
  const mdFiles = await getExportedSummaryMarkdownFiles(input)
  await combineFiles(mdFiles, "summary.md")
  await copyFile("summary.md", input.summaryFile)
  removeFiles(mdFiles)
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

  const dirContents = await readdir(".")
  for (let d of dirContents) {
    const s = await stat(d)
    if (!s.isFile()) {
      continue
    }

    if (extname(d).length < 2) {
      continue
    }

    for (let r of input.GetRun()) {
      if (d.startsWith(r) && extname(d) == `.${extn}`) {
        files.push(d)
      }
    }
  }

  return files
}

run()

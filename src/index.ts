import { addPath, info, setFailed } from "@actions/core";
import { appendFile, constants, copyFile, readdir, readFile, stat, unlink, writeFile } from "fs/promises";
import { extname, join } from "path";
import { ActionInput, GetInputs } from "./input";
import { DownloadAndDeflateSteampipe, InstallMod, InstallPlugins, InstallSteampipe, RunSteampipeCheck, WriteConnections } from "./steampipe";

async function run() {
  try {
    const actionInputs = GetInputs()

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
      const mdFiles = await getExportedSummaryMarkdownFiles(actionInputs)
      info(`MD Files: ${mdFiles}`)
      const jsonFiles = await getExportedJSONFiles(actionInputs)
      info(`JSON Files: ${jsonFiles}`)
      await combineFiles(mdFiles, "summary.md")

      await copyFile("summary.md", actionInputs.summaryFile)

      removeFiles(mdFiles)
      removeFiles(jsonFiles)
    }

  } catch (error) {
    setFailed(error.message);
  }
}

async function removeFiles(files: Array<string>) {
  for (let f of files) {
    await unlink(f)
  }
}

async function combineFiles(files: Array<string>, writeTo: string) {
  info(`writing seed file for combining ${files}`)
  await writeFile(writeTo, "")
  for (let file of files) {
    info(`reading ${file}`)
    const content = await readFile(file)
    await appendFile(writeTo, content)
    info(`appended contents of ${file} to ${writeTo}`)
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
  info(`Contents: ${dirContents}`)
  for (let d of dirContents) {
    const s = await stat(d)
    if (!s.isFile()) {
      continue
    }

    if (extname(d).length < 2) {
      continue
    }

    for (let r of input.run) {
      info(`** Checking ${d} with ${r}`)
      info(`=== EXTN: ${extname(d)}`)
      info(` >>> Getting ${d.startsWith(r)} and ${extname(d) == extn}`)
      if (d.startsWith(r) && extname(d) == `.${extn}`) {
        files.push(d)
      }
    }
  }

  return files
}

run()

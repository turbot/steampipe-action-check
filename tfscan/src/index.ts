import { addPath, endGroup, setFailed, startGroup } from "@actions/core";
import { context } from "@actions/github";
import { info } from "console";
import { appendFile, copyFile, readdir, readFile, unlink, writeFile } from "fs/promises";
import { extname } from "path";
import { STEAMPIPE_KEY, STEAMPIPE_MOD_EXPORT_FILE_MD, STEAMPIPE_MOD_OUTPUT_FILE_EXTN_JSON, STEAMPIPE_MOD_OUTPUT_FILE_EXTN_MD } from "./constants";
import { ActionInput } from "./input";
import { Annotation } from "./models/annotate-models";
import { getAnnotations, parseResultFile, pushAnnotations } from "./annotate";
import { downloadAndDeflateSteampipe, installMod, installTerraformPlugin as installTerraformPlugin, installSteampipe as installSteampipeCLI, runSteampipeCheck, writeConnections as writeConnectionForPlugin } from "./steampipe";

async function run() {
  try {
    const inputs = new ActionInput()
    await inputs.validate()

    // install the mod right away
    // if this fails for some reason, we cannot continue
    const modPath = await installMod(inputs.modRepository)

    const steampipePath = `${await downloadAndDeflateSteampipe(inputs.version)}/${STEAMPIPE_KEY}`;
    await installSteampipeCLI(steampipePath)
    await installTerraformPlugin(steampipePath)
    try {
      await writeConnectionForPlugin(inputs)
    }
    catch (e) {
      throw new Error("error trying to create connection", e)
    }

    // add the path to the Steampipe CLI so that it can be used by subsequent steps if required
    addPath(steampipePath)

    try {
      // since `steampipe check` may exit with a non-zero exit code - this is normal
      await runSteampipeCheck(steampipePath, modPath, inputs, [STEAMPIPE_MOD_OUTPUT_FILE_EXTN_JSON, STEAMPIPE_MOD_OUTPUT_FILE_EXTN_MD])
    }
    catch (e) {
      // throw e
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
  if (context.payload.pull_request == null) {
    return
  }
  startGroup("Processing output")
  info("Fetching output")
  const jsonFiles = await getExportedJSONFiles(input)
  const annotations: Array<Annotation> = []
  for (let j of jsonFiles) {
    const result = await parseResultFile(j)
    annotations.push(...getAnnotations(result))
  }
  info(`Pushing Annotations`)
  await pushAnnotations(input, annotations)
  removeFiles(jsonFiles)
  endGroup()
}

async function exportStepSummary(input: ActionInput) {
  startGroup("Sending Summary")
  info("Fetching output")
  const mdFiles = await getExportedSummaryMarkdownFiles(input)
  info("Combining outputs")
  await combineFiles(mdFiles, STEAMPIPE_MOD_EXPORT_FILE_MD)
  info("Pushing to Platform")
  await copyFile(STEAMPIPE_MOD_EXPORT_FILE_MD, input.summaryFile)
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
  return await getExportedFileWithExtn(input, STEAMPIPE_MOD_OUTPUT_FILE_EXTN_MD)
}
async function getExportedJSONFiles(input: ActionInput) {
  return await getExportedFileWithExtn(input, STEAMPIPE_MOD_OUTPUT_FILE_EXTN_JSON)
}

async function getExportedFileWithExtn(input: ActionInput, extn: string) {
  let files = new Array<string>()

  const dirContents = await readdir(".", { withFileTypes: true })
  for (let d of dirContents) {
    if (!d.isFile() || extname(d.name).length < 2) {
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

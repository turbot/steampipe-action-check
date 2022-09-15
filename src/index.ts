import { addPath, setFailed } from "@actions/core";
import { copyFile, unlink } from "fs/promises";
import { exit } from "process";
import { GetInputs } from "./input";
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

    // create an export file so that we can use it for commenting and annotating pull requests 
    const jsonExportFile = `check-output-for-action-${new Date().getTime()}.json`
    const mdExportFile = `check-output-for-action-${new Date().getTime()}.md`

    try {
      // since `steampipe check` may exit with a non-zero exit code
      await RunSteampipeCheck(steampipePath, modPath, actionInputs, [jsonExportFile, mdExportFile])
    }
    catch (e) {
      throw e
    }
    finally {
      await copyFile(mdExportFile, actionInputs.summaryFile)
      await unlink(jsonExportFile)
      await unlink(mdExportFile)
    }

  } catch (error) {
    setFailed(error.message);
  }
}

run()

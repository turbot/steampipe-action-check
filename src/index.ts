import { addPath, setFailed } from "@actions/core";
import { unlink } from "fs/promises";
import { GetInputs } from "./input";
import { DownloadAndDeflateSteampipe, InstallMod, InstallPlugins, InstallSteampipe, RunSteampipeCheck, WriteConnections } from "./steampipe";
import { AddPRComments } from './commenter';

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
    const myExportFile = `check-output-for-action-${new Date().getTime()}.json`
    await RunSteampipeCheck(steampipePath, modPath, actionInputs, myExportFile)
    await unlink(myExportFile)
    await AddPRComments(actionInputs, myExportFile)
  } catch (error) {
    setFailed(error.message);
  }
}

run()

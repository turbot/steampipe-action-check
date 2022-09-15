import { addPath, getInput, info, setFailed } from "@actions/core";
import { GetInputs } from "./input";
import { DownloadSteampipe, InstallMod, InstallPlugins, InstallSteampipe, RunSteampipeCheck, WriteConnections } from "./steampipe";

async function run() {
  try {
    const actionInputs = GetInputs()

    const steampipePath = `${await DownloadSteampipe(actionInputs.version)}/steampipe`;
    addPath(steampipePath);

    await InstallSteampipe(steampipePath)
    await InstallPlugins(steampipePath, actionInputs.plugins)
    await WriteConnections(actionInputs.connectionData)
    let modPath = ""
    if (actionInputs.modRepository.length > 0) {
      modPath = await InstallMod(actionInputs.modRepository)
      info(`Mod Path: ${modPath}`)
      if (modPath.length == 0) {
        setFailed("bad repository for mod")
        return
      }
    }
    await RunSteampipeCheck(steampipePath, modPath, actionInputs)
  } catch (error) {
    setFailed(error.message);
  }
}

run()

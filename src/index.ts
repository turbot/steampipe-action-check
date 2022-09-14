import { addPath, getInput, info, setFailed } from "@actions/core";
import { chdir } from "process";
import { DownloadSteampipe, InstallMod, InstallPlugins, InstallSteampipe, RunSteampipeCheck, WriteConnections } from "./steampipe";

async function run() {
  try {
    const steampipeVersion = getInput('version', { required: false, trimWhitespace: true }) || "latest";
    const pluginsToInstall: Array<string> = JSON.parse(getInput('plugins', { required: true, trimWhitespace: true }) || '[]');
    const modRepositoryPath = getInput('mod', { required: false, trimWhitespace: true }) || ''
    const connectionConfig = getInput("connection_config", { required: true, trimWhitespace: true })

    const steampipePath = `${await DownloadSteampipe(steampipeVersion)}/steampipe`;
    addPath(steampipePath);

    await InstallSteampipe(steampipePath)
    await InstallPlugins(steampipePath, pluginsToInstall)
    if (modRepositoryPath.length > 0) {
      const modPath = await InstallMod(modRepositoryPath)
      info(`Mod Path: ${modPath}`)
      if (modPath.length == 0) {
        setFailed("bad repository for mod")
        return
      }

      // change to the mod directory, since Steampipe needs to be executed in the mod directory
      // for it to be able to resolve the mod properly
      chdir(modPath)
    }
    await WriteConnections(connectionConfig)
    await RunSteampipeCheck(steampipePath)
  } catch (error) {
    setFailed(error.message);
  }
}

run()

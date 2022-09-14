import { addPath, getInput, info, markdownSummary, setFailed, summary } from "@actions/core";
import { countReset } from "console";
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
    await WriteConnections(connectionConfig)
    let modPath = ""
    if (modRepositoryPath.length > 0) {
      modPath = await InstallMod(modRepositoryPath)
      info(`Mod Path: ${modPath}`)
      if (modPath.length == 0) {
        setFailed("bad repository for mod")
        return
      }
    }
    await RunSteampipeCheck(steampipePath, modPath)
  } catch (error) {
    setFailed(error.message);
  }
}

run()

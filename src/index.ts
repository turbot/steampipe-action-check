import { addPath, getInput, setFailed } from "@actions/core";
import { DownloadSteampipe, InstallMod, InstallPlugins, InstallSteampipe, SteampipeServiceStart, WriteConnections } from "./steampipe";

async function run() {
  try {
    const steampipeVersion = getInput('version', { required: false, trimWhitespace: true }) || "latest";
    const pluginsToInstall: Array<string> = JSON.parse(getInput('plugins', { required: true, trimWhitespace: true }) || '[]');
    const modRepositoryPath = getInput('mod', { required: false, trimWhitespace: true }) || ''
    const connectionConfig = getInput("connection_config", { required: true, trimWhitespace: true })

    const steampipePath = await DownloadSteampipe(steampipeVersion);
    addPath(steampipePath);

    await InstallSteampipe(steampipePath)
    await InstallPlugins(steampipePath, pluginsToInstall)
    if (modRepositoryPath.length > 0) {
      const modPath = await InstallMod(modRepositoryPath)
      if (modPath.length == 0) {
        setFailed("bad repository for mod")
        return
      }
    }
    await WriteConnections(connectionConfig)
    await SteampipeServiceStart(steampipePath)
  } catch (error) {
    setFailed(error.message);
  }
}

run()

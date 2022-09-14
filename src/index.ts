import { addPath, getInput, setFailed } from "@actions/core";
import { DownloadSteampipe, InstallPlugins, InstallSteampipe } from "./steampipe";

async function run() {
  try {
    const steampipeVersion = getInput('version', { required: false }) || "latest";
    const pluginsToInstall: Array<string> = JSON.parse(getInput('plugins') || '[]');

    const steampipePath = await DownloadSteampipe(steampipeVersion);
    addPath(steampipePath);

    await InstallSteampipe(steampipePath)
    await InstallPlugins(steampipePath, pluginsToInstall)

  } catch (error) {
    setFailed(error.message);
  }
}

await run()

import { info } from "@actions/core";
import { cacheDir, downloadTool, extractTar, extractZip, find } from "@actions/tool-cache";
import { exec, execFile, spawn } from "child_process";
import { arch, execArgv, platform } from "process";
import { promisify } from "util";
import { Targets } from "./targets";

export function GetSteampipeDownloadLink(version: string): string {
  return `https://github.com/turbot/steampipe/releases/download/${version}/steampipe_${Targets[platform][arch]}`
}

/**
 * 
 * DownloadSteampipe downloads and extracts the given steampipe version from the official steampipe releases in turbot/steampipe repository
 * 
 * DownloadSteampipe attempts to cache the downloaded binary by platform and architecture.
 * 
 * Note: when using the `latest` release, it is NEVER cached.
 * 
 * TODO: attempt to extract the actual version of `latest` and use it.
 * 
 * @param version The version of steampipe to download. Default: `latest`
 */
export async function DownloadSteampipe(version: string = "latest") {
  if (version !== 'latest') {
    const toolPath = find('steampipe', version, arch);
    if (toolPath) {
      info(`Found in cache @ ${toolPath}`);
      return toolPath;
    }
  }

  const downloadLink = GetSteampipeDownloadLink(version)
  const steampipeArchivePath = await downloadTool(downloadLink)
  const extractedTo = await extractArchive(steampipeArchivePath)

  return await cacheDir(extractedTo, 'steampipe', version, arch)
}

/**
 * InstallSteampipe installs steampipe by setting up the embedded postgres database
 * 
 * @param cliCmd The path to the steampipe binary
 */
export async function InstallSteampipe(cliCmd = "steampipe") {
  const execP = promisify(execFile)
  await execP(cliCmd, ["query", "select 1"])
  return
}

/**
 * Installs the list of steampipe plugins
 * 
 * @param cliCmd THe path to the steampipe binary
 * @param plugins `Array<string>` - an array of steampipe plugins to install. Passed to `steampipe plugin install` as-is
 * @returns 
 */
export async function InstallPlugins(cliCmd = "steampipe", plugins: Array<string> = []) {
  const execP = promisify(execFile)
  await execP(cliCmd, ["plugin", "install", ...plugins])
  return
}

async function extractArchive(archivePath: string) {
  let extractor = platform === 'linux' ? extractTar : extractZip;
  return await extractor(archivePath)
}

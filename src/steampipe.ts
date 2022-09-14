import { debug, info } from "@actions/core";
import { cacheDir, downloadTool, extractTar, extractZip, find } from "@actions/tool-cache";
import { exec } from "@actions/exec";
import { arch, env, execArgv, platform } from "process";
import { promisify } from "util";
import { Targets } from "./targets";
import { create } from "@actions/glob";
import path, { join } from "path";
import { readdir, unlink, writeFile } from "fs/promises";
import { execFile } from "child_process";

export function GetSteampipeDownloadLink(version: string): string {
  if (version === 'latest') {
    return `https://github.com/turbot/steampipe/releases/latest/download/steampipe_${Targets[platform][arch]}`
  } else {
    return `https://github.com/turbot/steampipe/releases/download/${version}/steampipe_${Targets[platform][arch]}`
  }
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
  info(`download link: ${downloadLink}`)

  const downloadedArchive = await downloadTool(downloadLink)
  info(`downloaded to: ${downloadedArchive}`)

  const extractedTo = await extractArchive(downloadedArchive)
  info(`extracted to: ${extractedTo}`)

  return await cacheDir(extractedTo, 'steampipe', version, arch)
}

/**
 * InstallSteampipe installs steampipe by setting up the embedded postgres database
 * 
 * @param cliCmd The path to the steampipe binary
 */
export async function InstallSteampipe(cliCmd = "steampipe") {
  await exec(cliCmd, ["query", "select 1"])
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
  await exec(cliCmd, ["plugin", "install", ...plugins])
  return
}

/**
 * 
 * @param modRepository The HTTP/SSH url of the mod repository. This will be passed in as-is to `git clone`
 * @returns void
 */
export async function InstallMod(modRepository: string) {
  if (modRepository.trim().length === 0) {
    return Promise.resolve("")
  }
  const cloneTo = `mod-dir-${new Date().getTime()}`
  const execP = promisify(execFile)
  info(`Installing mod ${modRepository}`)
  await execP("git", ["clone", modRepository, cloneTo])
  return cloneTo
}

export async function cleanConnectionConfigDir(configDir: string) {
  const files = await readdir(configDir)
  for (const file of files) {
    await unlink(join(configDir, file))
  }
}

/**
 * 
 * @param connectionData The connection configuration HCL. All connection configs are to be appended into a single HCL string.
 * @returns void
 */
export async function WriteConnections(connectionData: string) {
  const d = new Date()
  const configDir = `${env['HOME']}/.steampipe/config`
  cleanConnectionConfigDir(configDir)

  const configFileName = `${d.getTime()}.spc`
  await writeFile(`${configDir}/${configFileName}`, connectionData)
  return
}

export async function RunSteampipeCheck(cliCmd: string = "steampipe") {
  await exec(cliCmd, ["check", "all", `--output=md`])
}

async function extractArchive(archivePath: string) {
  let extractor = platform === 'linux' ? extractTar : extractZip;
  return await extractor(archivePath)
}

import { debug, endGroup, info, startGroup } from "@actions/core";
import { cacheDir, downloadTool, extractTar, extractZip, find } from "@actions/tool-cache";
import { exec as actionsExec } from "@actions/exec"
import { execFile } from "child_process";
import { readdir, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { arch, env, platform } from "process";
import { promisify } from "util";
import { ActionInput } from "./input";
import { Targets } from "./targets";

const execP = promisify(execFile)

export function GetSteampipeDownloadLink(version: string): string {
  if (version === "latest") {
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
  if (version !== "latest") {
    const toolPath = find("steampipe", version, arch);
    if (toolPath) {
      info(`Found in cache @ ${toolPath}`);
      return toolPath;
    }
  }

  const downloadLink = GetSteampipeDownloadLink(version)
  const downloadedArchive = await downloadTool(downloadLink)
  const extractedTo = await extractArchive(downloadedArchive)
  return await cacheDir(extractedTo, "steampipe", version, arch)
}

/**
 * InstallSteampipe installs steampipe by setting up the embedded postgres database
 * 
 * @param cliCmd The path to the steampipe binary
 */
export async function InstallSteampipe(cliCmd = "steampipe") {
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
  await execP(cliCmd, ["plugin", "install", ...plugins])
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
  startGroup("cleanConnectionConfigDir")
  debug(`cleaning config directory: ${configDir}`)
  const files = await readdir(configDir)
  debug(`found files: ${configDir}`)
  for (const file of files) {
    debug(`removing file: ${configDir}`)
    await unlink(join(configDir, file))
  }
  endGroup()
}

/**
 * 
 * @param connectionData The connection configuration HCL. All connection configs are to be appended into a single HCL string.
 * @returns void
 */
export async function WriteConnections(connectionData: string) {
  startGroup("WriteConnections")
  const d = new Date()
  const configDir = `${env["HOME"]}/.steampipe/config`
  cleanConnectionConfigDir(configDir)

  const configFileName = `${d.getTime()}.spc`
  await writeFile(`${configDir}/${configFileName}`, connectionData)
  endGroup()
}

export async function RunSteampipeCheck(cliCmd: string = "steampipe", workspaceChdir: string, actionInputs: ActionInput) {
  let args = new Array<string>()

  args.push(
    "check",
    getCheckArg(actionInputs),
  )

  if (actionInputs.output.length > 0) {
    args.push(`--output=${actionInputs.output}`)
  }
  if (actionInputs.export.length > 0) {
    args.push(`--export=${actionInputs.export}`)
  }
  if (actionInputs.where.length > 0) {
    args.push(`--where=${actionInputs.where}`)
  }

  args.push(`--workspace-chdir=${workspaceChdir}`)

  await actionsExec(cliCmd, args)
}

function getCheckArg(input: ActionInput): string {
  if (input.benchmark.length === 0 && input.control.length === 0) {
    return "all"
  }
  return input.benchmark.length > 0 ? input.benchmark : input.control
}

async function extractArchive(archivePath: string) {
  let extractor = platform === "linux" ? extractTar : extractZip;
  return await extractor(archivePath)
}

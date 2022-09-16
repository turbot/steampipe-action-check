import { debug, endGroup, info, startGroup } from "@actions/core";
import { exec } from "@actions/exec";
import { which } from "@actions/io";
import { cacheDir, downloadTool, extractTar, extractZip, find } from "@actions/tool-cache";
import { readdir, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { arch, env, platform } from "process";
import { URL } from "url";
import { ActionInput } from "./input";
import { Targets } from "./targets";
import { context } from "@actions/github"

/**
 * 
 * Downloads and extracts the given steampipe version from the official steampipe releases in turbot/steampipe repository
 * 
 * Attempts to cache the downloaded binary by platform and architecture.
 * 
 * Note: when using the `latest` release, it is NEVER cached. This is because, `latest` is a pointer to an actual version which keeps changing as new releases are pushed out.
 * 
 * TODO: attempt to extract the actual version of `latest` and use it.
 * 
 * @param version The version of steampipe to download. Default: `latest`
 */
export async function downloadAndDeflateSteampipe(version: string = "latest") {
  startGroup("Download Steampipe")
  if (version !== "latest") {
    info(`Checking if ${version} is cached`)
    // try to find out if the cache has an entry for this.
    const toolPath = find("steampipe", version, arch);
    if (toolPath) {
      info(`Found ${version} in cache @ ${toolPath}`);
      return toolPath;
    }
    info(`Could not find ${version} in cache. Need to download.`)
  }


  const downloadLink = getSteampipeDownloadLink(version)
  info(`Downloading ${version}...`)
  const downloadedArchive = await downloadTool(downloadLink.toString())
  info(`Download complete`)
  info(`Extracting...`)
  const extractedTo = await extractArchive(downloadedArchive)
  if (version == "latest") {
    info(`Skipping cache for 'latest' release.`)
    // no caching of `latest` binary
    return extractedTo
  }
  info(`Caching ${version}`)
  return await cacheDir(extractedTo, "steampipe", version, arch)
}

/**
 * InstallSteampipe installs steampipe by setting up the embedded postgres database
 * 
 * @param cliCmd The path to the steampipe binary
 */
export async function installSteampipe(cliCmd = "steampipe") {
  startGroup("Installing Steampipe")
  await exec(cliCmd, ["query", "select 1"], { silent: true })
  endGroup()
  return
}

/**
 * Installs the list of steampipe plugins
 * 
 * @param cliCmd THe path to the steampipe binary
 * @param plugins `Array<string>` - an array of steampipe plugins to install. Passed to `steampipe plugin install` as-is
 * @returns 
 */
export async function installTerraform(cliCmd = "steampipe") {
  startGroup("Installing plugins")
  info(`Installing 'terraform@latest'`)
  await exec(cliCmd, ["plugin", "install", "terraform"], { silent: true })
  info(`Installation complete`)
  endGroup()
  return
}

/**
 * Installs a mod from the given Git Clone URL.
 * Forwards the GitURL as-is to `git clone`
 * 
 * @param modRepository The HTTP/SSH url of the mod repository. This will be passed in as-is to `git clone`
 */
export async function installMod(modRepository: string = "") {
  if (modRepository.trim().length === 0) {
    return Promise.resolve("")
  }
  startGroup("Installing Mod")
  const cloneTo = `workspace_dir_${context.runId}_${new Date().getTime()}`
  info(`Installing mod from ${modRepository}`)
  await exec(await which("git", true), ["clone", modRepository, cloneTo], { silent: false })
  endGroup()
  return cloneTo
}

/**
 * 
 * @param connectionData The connection configuration HCL. All connection configs are to be appended into a single HCL string.
 * @returns void
 */
export async function writeConnections(input: ActionInput) {
  startGroup("Writing Connection Data")
  const d = new Date()
  const configDir = `${env["HOME"]}/.steampipe/config`
  debug("Cleaning up old config directory")
  cleanConnectionConfigDir(configDir)

  const configFileName = `config_${context.runId}.spc`
  info("Writing connection data")
  await writeFile(`${configDir}/${configFileName}`, `
connection "tf_connection_${context.runId}" {
  plugin = "terraform"
  paths = ["${input.scanDirectory}/**/*.tf"]
}
`)
  info("Finished writing connection data")
  endGroup()
}

/**
 * 
 * @param cliCmd string - The path to the installed steampipe CLI.
 * @param workspaceChdir string - The path to the workspace directory where a mod (if any) is installed. 
 * @param actionInputs string - The inputs that we got when this action was started.
 */
export async function runSteampipeCheck(cliCmd: string = "steampipe", workspaceChdir: string, actionInputs: ActionInput, xtraExports: Array<string>) {
  startGroup(`Running Check`)
  let args = new Array<string>()

  args.push(
    "check",
    ...actionInputs.getRun(),
  )

  if (actionInputs.output.length > 0) {
    args.push(`--output=${actionInputs.output}`)
  }
  if (actionInputs.export.length > 0) {
    args.push(`--export=${actionInputs.export}`)
  }

  for (let f of xtraExports) {
    // add an export for self, which we will remove later on
    args.push(`--export=${f}`)
  }

  if (actionInputs.where.length > 0) {
    args.push(`--where=${actionInputs.where}`)
  }

  if (workspaceChdir.trim().length > 0) {
    args.push(`--workspace-chdir=${workspaceChdir}`)
  }

  const execEnv = env
  execEnv.STEAMPIPE_CHECK_DISPLAY_WIDTH = "120"

  await exec(cliCmd, args, {
    env: execEnv,
  })

  endGroup()
}

async function cleanConnectionConfigDir(configDir: string) {
  const files = await readdir(configDir)
  for (const file of files) {
    await unlink(join(configDir, file))
  }
}

function getSteampipeDownloadLink(version: string): URL {
  if (version === "latest") {
    return new URL(`https://github.com/turbot/steampipe/releases/latest/download/steampipe_${Targets[platform][arch]}`)
  } else {
    return new URL(`https://github.com/turbot/steampipe/releases/download/${version}/steampipe_${Targets[platform][arch]}`)
  }
}

async function extractArchive(archivePath: string) {
  let extractor = platform === "linux" ? extractTar : extractZip;
  return await extractor(archivePath)
}

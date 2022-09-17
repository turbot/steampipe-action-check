import { debug, endGroup, info, startGroup } from "@actions/core";
import { exec } from "@actions/exec";
import { which } from "@actions/io";
import { cacheDir, downloadTool, extractTar, extractZip, find } from "@actions/tool-cache";
import { lstat, readdir, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { arch, env, platform } from "process";
import { URL } from "url";
import { ActionInput } from "./input";
import { STEAMPIPE_CHECK_DISPLAY_WIDTH, STEAMPIPE_COMMAND_CHECK, STEAMPIPE_KEY, STEAMPIPE_MOD_FLAG_EXPORT, STEAMPIPE_MOD_FLAG_OUTPUT, STEAMPIPE_MOD_FLAG_WHERE, STEAMPIPE_MOD_WORKSPACE_CHDIR, STEAMPIPE_PLUGIN_INSTALL_TERRAFORM, STEAMPIPE_CLI_VALIDATION_QUERY, STEAMPIPE_VERSION_LATEST, Targets, STEAMPIPE_CONFIG_DIR, CONFIG_FILE_NAME, GIT_KEY, GIT_COMMAND_CLONE, STEAMPIPE_TERRAFORM_CONFIG_FILE } from "./constants";
import { context } from "@actions/github"

/**
 * 
 * Downloads and extracts the given steampipe version from the official steampipe releases in turbot/steampipe repository
 * Attempts to cache the downloaded binary by platform and architecture.
 * 
 * *Note*: when using the `latest` release, it is NEVER cached. This is because, `latest` is a pointer to an actual version which keeps changing as new releases are pushed out.
 * 
 * TODO: attempt to extract the actual version of `latest` and use it.
 * 
 * @param version The version of steampipe to download. Default: `latest`
 */
export async function downloadAndDeflateSteampipe(version: string = STEAMPIPE_VERSION_LATEST) {
  startGroup("Download Steampipe")
  if (version !== STEAMPIPE_VERSION_LATEST) {
    info(`Checking if ${version} is cached`)
    // try to find out if the cache has an entry for this.
    const toolPath = find(STEAMPIPE_KEY, version, arch);
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
  if (version == STEAMPIPE_VERSION_LATEST) {
    info(`Skipping cache for 'latest' release.`)
    // no caching of `latest` binary
    return extractedTo
  }
  info(`Caching ${version}`)
  return await cacheDir(extractedTo, STEAMPIPE_KEY, version, arch)
}

/**
 * InstallSteampipe installs steampipe by setting up the embedded postgres database
 * 
 * @param cliCmd The path to the steampipe binary
 */
export async function installSteampipe(cliCmd = STEAMPIPE_KEY) {
  startGroup("Installing Steampipe")
  await exec(cliCmd, [STEAMPIPE_CLI_VALIDATION_QUERY], { silent: true })
  endGroup()
  return
}

/**
 * Installs the terraform steampipe plugins
 * 
 * @param cliCmd THe path to the steampipe binary
 * @returns 
 */
export async function installTerraformPlugin(cliCmd = STEAMPIPE_KEY) {
  startGroup("Installing plugins")
  info(`Installing 'terraform@latest'`)
  await exec(cliCmd, [STEAMPIPE_PLUGIN_INSTALL_TERRAFORM], { silent: true })
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
  try {
    await exec(await which(GIT_KEY, true), [GIT_COMMAND_CLONE, modRepository, cloneTo], { silent: false })
  }
  catch (e) {
    endGroup()
    throw new Error("error while trying to clone the mod: ", e)
  }
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
  debug("Cleaning up old config directory")
  // clean up the config directory
  // this will take care of any default configs done during plugin installation
  // and also configs which were created in steps above this step which uses this action.
  cleanConnectionConfigDir()

  info("Writing connection data")
  await writeFile(`${STEAMPIPE_CONFIG_DIR}/${CONFIG_FILE_NAME}`, STEAMPIPE_TERRAFORM_CONFIG_FILE(input))

  info("Finished writing connection data")
  endGroup()
}

/**
 * 
 * @param cliCmd string - The path to the installed steampipe CLI.
 * @param workspaceChdir string - The path to the workspace directory where a mod (if any) is installed. 
 * @param actionInputs string - The inputs that we got when this action was started.
 */
export async function runSteampipeCheck(cliCmd: string = STEAMPIPE_KEY, workspaceChdir: string, actionInputs: ActionInput, xtraExports: Array<string>) {
  startGroup(`Running Check`)

  let args = new Array<string>()
  args.push(
    STEAMPIPE_COMMAND_CHECK,
    ...actionInputs.getRun(),
  )

  if (actionInputs.output.length > 0) {
    args.push(`${STEAMPIPE_MOD_FLAG_OUTPUT}=${actionInputs.output}`)
  }
  if (actionInputs.export.length > 0) {
    args.push(`${STEAMPIPE_MOD_FLAG_EXPORT}=${actionInputs.export}`)
  }

  for (let f of xtraExports) {
    // add an export for self, which we will remove later on
    args.push(`${STEAMPIPE_MOD_FLAG_EXPORT}=${f}`)
  }

  if (actionInputs.where.length > 0) {
    args.push(`${STEAMPIPE_MOD_FLAG_WHERE}=${actionInputs.where}`)
  }

  if (workspaceChdir.trim().length > 0) {
    args.push(`${STEAMPIPE_MOD_WORKSPACE_CHDIR}=${workspaceChdir}`)
  }

  env.STEAMPIPE_CHECK_DISPLAY_WIDTH = STEAMPIPE_CHECK_DISPLAY_WIDTH

  await exec(cliCmd, args, {
    env,
  })

  endGroup()
}

async function cleanConnectionConfigDir() {
  const files = await readdir(STEAMPIPE_CONFIG_DIR)
  for (const file of files) {
    await unlink(join(STEAMPIPE_CONFIG_DIR, file))
  }
}

function getSteampipeDownloadLink(version: string): URL {
  if (version === STEAMPIPE_VERSION_LATEST) {
    return new URL(`https://github.com/turbot/steampipe/releases/latest/download/steampipe_${Targets[platform][arch]}`)
  } else {
    return new URL(`https://github.com/turbot/steampipe/releases/download/${version}/steampipe_${Targets[platform][arch]}`)
  }
}

async function extractArchive(archivePath: string) {
  let extractor = platform === "linux" ? extractTar : extractZip;
  return await extractor(archivePath)
}

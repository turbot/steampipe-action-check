"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SteampipeServiceStart = exports.WriteConnections = exports.InstallMod = exports.InstallPlugins = exports.InstallSteampipe = exports.DownloadSteampipe = exports.GetSteampipeDownloadLink = void 0;
const core_1 = require("@actions/core");
const tool_cache_1 = require("@actions/tool-cache");
const exec_1 = require("@actions/exec");
const process_1 = require("process");
const targets_1 = require("./targets");
const glob_1 = require("@actions/glob");
const path_1 = __importDefault(require("path"));
const promises_1 = require("fs/promises");
function GetSteampipeDownloadLink(version) {
    if (version === 'latest') {
        return `https://github.com/turbot/steampipe/releases/latest/download/steampipe_${targets_1.Targets[process_1.platform][process_1.arch]}`;
    }
    else {
        return `https://github.com/turbot/steampipe/releases/download/${version}/steampipe_${targets_1.Targets[process_1.platform][process_1.arch]}`;
    }
}
exports.GetSteampipeDownloadLink = GetSteampipeDownloadLink;
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
async function DownloadSteampipe(version = "latest") {
    if (version !== 'latest') {
        const toolPath = (0, tool_cache_1.find)('steampipe', version, process_1.arch);
        if (toolPath) {
            (0, core_1.info)(`Found in cache @ ${toolPath}`);
            return toolPath;
        }
    }
    const downloadLink = GetSteampipeDownloadLink(version);
    (0, core_1.info)(`download link: ${downloadLink}`);
    const downloadedArchive = await (0, tool_cache_1.downloadTool)(downloadLink);
    (0, core_1.info)(`downloaded to: ${downloadedArchive}`);
    const extractedTo = await extractArchive(downloadedArchive);
    (0, core_1.info)(`extracted to: ${extractedTo}`);
    return await (0, tool_cache_1.cacheDir)(extractedTo, 'steampipe', version, process_1.arch);
}
exports.DownloadSteampipe = DownloadSteampipe;
/**
 * InstallSteampipe installs steampipe by setting up the embedded postgres database
 *
 * @param cliCmd The path to the steampipe binary
 */
async function InstallSteampipe(cliCmd = "steampipe") {
    await (0, exec_1.exec)(cliCmd, ["query", "select 1"]);
    return;
}
exports.InstallSteampipe = InstallSteampipe;
/**
 * Installs the list of steampipe plugins
 *
 * @param cliCmd THe path to the steampipe binary
 * @param plugins `Array<string>` - an array of steampipe plugins to install. Passed to `steampipe plugin install` as-is
 * @returns
 */
async function InstallPlugins(cliCmd = "steampipe", plugins = []) {
    await (0, exec_1.exec)(cliCmd, ["plugin", "install", ...plugins]);
    return;
}
exports.InstallPlugins = InstallPlugins;
/**
 *
 * @param modRepository The HTTP/SSH url of the mod repository. This will be passed in as-is to `git clone`
 * @returns void
 */
async function InstallMod(modRepository) {
    if (modRepository.trim().length === 0) {
        return Promise.resolve("");
    }
    await (0, exec_1.exec)("git", ["clone", modRepository]);
    const globber = await (0, glob_1.create)('./*.mod', { followSymbolicLinks: false });
    const files = await globber.glob();
    if (files.length > 0) {
        // return the location of the mod.sp file - not the ones in dependencies (incase they exist in the repository)
        return path_1.default.dirname(files[0]);
    }
    return Promise.resolve("");
}
exports.InstallMod = InstallMod;
/**
 *
 * @param connections The connection configuration HCL. All connection configs are to be appended into a single HCL string.
 * @returns void
 */
async function WriteConnections(connections) {
    const d = new Date();
    const configFileName = `${d.getTime()}.spc`;
    await (0, promises_1.writeFile)(`${process_1.env['HOME']}/.steampipe/config/${configFileName}`, connections);
    return;
}
exports.WriteConnections = WriteConnections;
/**
 * Starts the steampipe service in the background
 *
 * @param cliCmd The full path to the Steampipe CLI
 */
async function SteampipeServiceStart(cliCmd = "steampipe") {
    await (0, exec_1.exec)(cliCmd, ["service", "start"]);
    await (0, exec_1.exec)(cliCmd, ["query", "select 1"]);
}
exports.SteampipeServiceStart = SteampipeServiceStart;
async function extractArchive(archivePath) {
    let extractor = process_1.platform === 'linux' ? tool_cache_1.extractTar : tool_cache_1.extractZip;
    return await extractor(archivePath);
}

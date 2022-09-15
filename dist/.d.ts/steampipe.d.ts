import { ActionInput } from "./input";
export declare function GetSteampipeDownloadLink(version: string): string;
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
export declare function DownloadSteampipe(version?: string): Promise<string>;
/**
 * InstallSteampipe installs steampipe by setting up the embedded postgres database
 *
 * @param cliCmd The path to the steampipe binary
 */
export declare function InstallSteampipe(cliCmd?: string): Promise<void>;
/**
 * Installs the list of steampipe plugins
 *
 * @param cliCmd THe path to the steampipe binary
 * @param plugins `Array<string>` - an array of steampipe plugins to install. Passed to `steampipe plugin install` as-is
 * @returns
 */
export declare function InstallPlugins(cliCmd?: string, plugins?: Array<string>): Promise<void>;
/**
 *
 * @param modRepository The HTTP/SSH url of the mod repository. This will be passed in as-is to `git clone`
 * @returns void
 */
export declare function InstallMod(modRepository: string): Promise<string>;
export declare function cleanConnectionConfigDir(configDir: string): Promise<void>;
/**
 *
 * @param connectionData The connection configuration HCL. All connection configs are to be appended into a single HCL string.
 * @returns void
 */
export declare function WriteConnections(connectionData: string): Promise<void>;
export declare function RunSteampipeCheck(cliCmd: string, workspaceChdir: string, actionInputs: ActionInput): Promise<void>;

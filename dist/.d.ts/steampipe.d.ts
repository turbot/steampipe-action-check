import { ActionInput } from "./input";
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
export declare function DownloadAndDeflateSteampipe(version?: string): Promise<string>;
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
 * Installs a mod from the given Git Clone URL.
 * Forwards the GitURL as-is to `git clone`
 *
 * @param modRepository The HTTP/SSH url of the mod repository. This will be passed in as-is to `git clone`
 */
export declare function InstallMod(modRepository: string): Promise<string>;
/**
 *
 * @param connectionData The connection configuration HCL. All connection configs are to be appended into a single HCL string.
 * @returns void
 */
export declare function WriteConnections(connectionData: string): Promise<void>;
/**
 *
 * @param cliCmd string - The path to the installed steampipe CLI.
 * @param workspaceChdir string - The path to the workspace directory where a mod (if any) is installed.
 * @param actionInputs string - The inputs that we got when this action was started.
 */
export declare function RunSteampipeCheck(cliCmd: string, workspaceChdir: string, actionInputs: ActionInput, myExportFile: [string, string]): Promise<void>;

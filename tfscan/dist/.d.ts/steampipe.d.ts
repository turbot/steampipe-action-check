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
export declare function downloadAndDeflateSteampipe(version?: string): Promise<string>;
/**
 * InstallSteampipe installs steampipe by setting up the embedded postgres database
 *
 * @param cliCmd The path to the steampipe binary
 */
export declare function installSteampipe(cliCmd?: string): Promise<void>;
/**
 * Installs the terraform steampipe plugins
 *
 * @param cliCmd THe path to the steampipe binary
 * @returns
 */
export declare function installTerraformPlugin(cliCmd?: string): Promise<void>;
/**
 * Installs a mod from the given Git Clone URL.
 * Forwards the GitURL as-is to `git clone`
 *
 * @param modRepository The HTTP/SSH url of the mod repository. This will be passed in as-is to `git clone`
 */
export declare function installMod(modRepository?: string): Promise<string>;
/**
 *
 * @param connectionData The connection configuration HCL. All connection configs are to be appended into a single HCL string.
 * @returns void
 */
export declare function writeConnections(input: ActionInput): Promise<void>;
/**
 *
 * @param cliCmd string - The path to the installed steampipe CLI.
 * @param workspaceChdir string - The path to the workspace directory where a mod (if any) is installed.
 * @param actionInputs string - The inputs that we got when this action was started.
 */
export declare function runSteampipeCheck(cliCmd: string, workspaceChdir: string, actionInputs: ActionInput, xtraExports: Array<string>): Promise<void>;

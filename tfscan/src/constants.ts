import { env } from "process";
import { context } from "@actions/github"
import { ActionInput } from "./input";

export const Targets = {
  linux: {
    x64: 'linux_amd64.tar.gz',
    arm64: 'linux_arm64.tar.gz',
  },
  darwin: {
    x64: 'darwin_amd64.zip',
    arm64: 'darwin_arm64.zip',
  }
};

export const STEAMPIPE_VERSION_LATEST = "latest";
export const STEAMPIPE_KEY = "steampipe";
export const STEAMPIPE_COMMAND_CHECK = "check";
export const STEAMPIPE_CLI_VALIDATION_QUERY = "query select 1";
export const STEAMPIPE_PLUGIN_INSTALL_TERRAFORM = "plugin install terraform";
export const STEAMPIPE_CONFIG_DIR = `${env["HOME"]}/.steampipe/config`;
export const CONFIG_FILE_NAME = `config_${context.runId}.spc`;
export const STEAMPIPE_MOD_FLAG_OUTPUT = "--output";
export const STEAMPIPE_MOD_FLAG_EXPORT = "--export";
export const STEAMPIPE_MOD_FLAG_WHERE = "--where";
export const STEAMPIPE_MOD_WORKSPACE_CHDIR = "--workspace-chdir";
export const STEAMPIPE_CHECK_DISPLAY_WIDTH = "120";
export const STEAMPIPE_MOD_OUTPUT_FILE_EXTN_MD = "md";
export const STEAMPIPE_MOD_OUTPUT_FILE_EXTN_JSON = "json";
export const STEAMPIPE_MOD_EXPORT_FILE_MD = "summary.md";
export const STEAMPIPE_ACTION_NAME = "tfscan";
export const STEAMPIPE_ANNOTATION_STATUS_COMPLETED = "completed";
export const STEAMPIPE_ANNOTATION_LEVEL = "failure";
export const STEAMPIPE_ANNOTATION_CONCLUSION_ACTION_REQUIRED = "action_required";
export const STEAMPIPE_ANNOTATION_TITLE = "Steampipe tfscan";
export const STEAMPIPE_ANNOTATION_SUMMARY = "Terraform Validation Failed";
export const STEAMPIPE_MOD_RUN_STATUS_ERROR = "error";
export const STEAMPIPE_MOD_RUN_STATUS_ALARM = "alarm";

export const STEAMPIPE_TERRAFORM_CONFIG_FILE = (input: ActionInput) => {
  return `connection "tf_connection_${context.runId}" {
  plugin = "terraform"
  paths = ["${input.scanDirectory}/**/*.tf"]
}`};

export const GITHUB_PULL_REQUEST_KEY_HEAD = "head";
export const GITHUB_PULL_REQUEST_KEY_SHA = "sha";

export const GIT_KEY = "git";
export const GIT_COMMAND_CLONE = "clone";
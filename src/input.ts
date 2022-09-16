import { getInput, getMultilineInput } from "@actions/core";
import { env } from "process";

export class ActionInput {
  version: string;
  plugins: Array<string>;
  modRepository: string;
  connectionData: string;
  eventName: string;
  githubToken: string;

  private run: Array<string>;
  where: string | null;

  output: string;
  export: Array<string>;

  summaryFile: string;

  constructor() {
    this.version = getInput("version", { required: false, trimWhitespace: true }) || 'latest';
    this.plugins = getInput("plugins", { required: true, trimWhitespace: false })
      .split(",")
      .map(p => p.trim())
      .filter(p => p.length > 0);

    this.modRepository = getInput("mod", { required: false, trimWhitespace: true });
    this.connectionData = getInput("connection_config", { required: false, trimWhitespace: false });

    this.run = getInput("run", { required: false, trimWhitespace: true })
      .split(" ")
      .map(r => r.trim())
      .filter(r => (r.length > 0));

    this.where = getInput("where", { required: false, trimWhitespace: false });

    this.output = getInput("output", { required: false, trimWhitespace: true });
    this.export = getInput("export", { required: false, trimWhitespace: true }).split(" ").map(e => e.trim()).filter(e => e.length > 0);

    this.summaryFile = env['GITHUB_STEP_SUMMARY']

    this.githubToken = getInput("github_token")
  }

  public GetRun(): Array<string> {
    if (this.run.length == 0) {
      this.run = ["all"]
    }
    return this.run
  }
}

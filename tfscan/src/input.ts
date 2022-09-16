import { getInput } from "@actions/core";
import { env } from "process";

export class ActionInput {
  private run: Array<string>;

  version: string;
  modRepository: string;

  scanDirectory: string;

  where: string | null;

  output: string;
  export: Array<string>;

  summaryFile: string;

  constructor() {
    this.version = getInput("version", { required: false, trimWhitespace: true }) || 'latest';
    this.modRepository = getInput("mod", { required: false, trimWhitespace: true });

    this.run = getInput("run", { required: false, trimWhitespace: true })
      .split(" ")
      .map(r => r.trim())
      .filter(r => (r.length > 0));

    this.scanDirectory = getInput("directory", { required: false, trimWhitespace: false });

    this.where = getInput("where", { required: false, trimWhitespace: false });

    this.output = getInput("output", { required: false, trimWhitespace: true });
    this.export = getInput("export", { required: false, trimWhitespace: true }).split(" ").map(e => e.trim()).filter(e => e.length > 0);

    this.summaryFile = env['GITHUB_STEP_SUMMARY']
  }

  public getRun(): Array<string> {
    if (this.run.length == 0) {
      this.run = ["all"]
    }
    return this.run
  }
}

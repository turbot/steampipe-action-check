import { getInput, getMultilineInput } from "@actions/core";

export interface ActionInput {
  version: string;
  plugins: Array<string>;
  modRepository: string;
  connectionData: string;

  run: Array<string>;
  where: string | null;

  output: string;
  export: Array<string>;
}

export function GetInputs() {
  let inputs: ActionInput = {
    version: getInput("version", { required: false, trimWhitespace: true }) || "latest",
    plugins: getInput("plugins", { required: true, trimWhitespace: false }).split(",").map(p => p.trim()).filter(p => p.length > 0),
    modRepository: getInput("mod", { required: false, trimWhitespace: true }) || "",
    connectionData: getInput("connection_config", { required: true, trimWhitespace: false }),

    run: getInput("run", { required: false, trimWhitespace: true }).split(",").map(r => r.trim()).filter(r => (r.length > 0)) || [],
    where: getInput("where", { required: false, trimWhitespace: false }) || "",

    output: getInput("output", { required: false, trimWhitespace: true }) || "",
    export: (getInput("export", { required: false, trimWhitespace: true }) || "").split(",").map(e => e.trim()).filter(e => e.length > 0),
  }

  return inputs;
}

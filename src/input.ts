import { getInput } from "@actions/core";

export interface ActionInput {
  version: string;
  plugins: Array<string>;
  modRepository: string;
  connectionData: string;

  control: string;
  benchmark: string;

  output: string;
  export: string;

  where: string | null;
}

export function GetInputs() {
  let inputs: ActionInput = {
    version: getInput("version", { required: false, trimWhitespace: true }) || "latest",
    plugins: getInput("plugins", { required: true, trimWhitespace: false }).split(",").map(p => p.trim()),
    modRepository: getInput("mod", { required: false, trimWhitespace: true }) || "",
    connectionData: getInput("connection_config", { required: true, trimWhitespace: false }),

    control: getInput("control", { required: false, trimWhitespace: true }) || "",
    benchmark: getInput("benchmark", { required: false, trimWhitespace: true }) || "",

    output: getInput("output", { required: false, trimWhitespace: true }) || "",
    export: getInput("export", { required: false, trimWhitespace: true }) || "",

    where: getInput("where", { required: false, trimWhitespace: false }) || ""
  }

  if (inputs.benchmark.length > 0 && inputs.control.length > 0) {
    throw new Error("cannot use `control` and `benchmark` in the same `check` run")
  }

  return inputs;
}

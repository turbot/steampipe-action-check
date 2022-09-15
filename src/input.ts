import { getInput, getMultilineInput } from "@actions/core";
export interface ActionInput {
  version: string;
  plugins: Array<string>;
  modRepository: string;
  connectionData: string;
  eventName: string;
  githubToken: string;

  run: Array<string>;
  where: string | null;

  output: string;
  export: Array<string>;
}

export interface GroupJson {
  groupId: string;
  title: string;
  description: string;
  tags: string;
  summary: string;
  groups: Array<GroupJson>;
  control: Array<ControlJson>;
}

export interface ControlJson {
  summary: string;
  results: Array<ResultJson>;
  controlId: string;
  description: string;
  severity: string;
  tags: string;
  title: string;
  runStatus: number;
  runError: string;
}

export interface ResultJson {
  reason: string;
  resource: string;
  status: string;
  dimensions: Array<DimensionJson>;
}

export interface DimensionJson {
  key: string;
  value: string;
}

export function GetInputs() {
  let inputs: ActionInput = {
    version: getInput("version", { required: false, trimWhitespace: true }) || "latest",
    plugins: getInput("plugins", { required: true, trimWhitespace: false }).split(",").map(p => p.trim()).filter(p => p.length > 0),
    modRepository: getInput("mod", { required: false, trimWhitespace: true }) || "",
    connectionData: getInput("connection_config", { required: true, trimWhitespace: false }),
    eventName: getInput("event_name", { required: false, trimWhitespace: false }),
    githubToken: getInput("github_token", { required: false, trimWhitespace: false }),

    run: getInput("run", { required: false, trimWhitespace: true }).split(",").map(r => r.trim()).filter(r => (r.length > 0)) || [],
    where: getInput("where", { required: false, trimWhitespace: false }) || "",

    output: getInput("output", { required: false, trimWhitespace: true }) || "",
    export: (getInput("export", { required: false, trimWhitespace: true }) || "").split(",").map(e => e.trim()).filter(e => e.length > 0),
  }

  return inputs;
}

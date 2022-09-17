import { setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { readFile } from "fs/promises";
import { ActionInput } from "./input";

/**
 * Returns an array of annotations for a RootResult
 * 
 * @param group GroupResult The group result returned by `steampipe check`
 * @returns 
 */
export function getAnnotations(result: RootResult): Array<Annotation> {
  if (result === null) {
    return null
  }
  return getAnnotationsForGroup(result)
}

/**
 * Pushes the annotations to Github.
 * 
 * @param annotations Array<Annotation> Pushed a set of annotations to github
 */
export async function pushAnnotations(input: ActionInput, annotations: Array<Annotation>) {

  try {

    const octokit = getOctokit(input.ghToken);
    if (annotations === null || annotations.length === 0) {
      return
    }

    const batches: Array<Array<Annotation>> = []

    for (let ann of annotations) {
      if (batches.length == 0) {
        // push in the first one
        batches.push([])
      }

      // check if the last one has reached limit
      if (batches[batches.length - 1].length > 49) {
        batches.push([])
      }

      // push this one to the last one
      batches[batches.length - 1].push(ann)
    }

    for (let batch of batches) {
      await octokit.rest.checks.create({
        ...context.repo,
        pull_number: context.payload.pull_request.number,
        head_sha: context.payload.pull_request['head']['sha'],
        check_run_id: context.runId,
        name: 'tfscan',
        status: 'completed',
        conclusion: 'action_required',
        output: {
          title: 'Steampipe tfscan',
          summary: 'Terraform Validation Failed',
          annotations: batch
        }
      });
    }

  } catch (error) {
    setFailed(error);
  }
}

export async function parseResultFile(filePath: string): Promise<RootResult> {
  const fileContent = await readFile(filePath)
  return (JSON.parse(fileContent.toString()) as RootResult)
}

function getAnnotationsForGroup(group: GroupResult): Array<Annotation> {
  const annotations: Array<Annotation> = []
  if (group.groups) {
    for (let g of group.groups) {
      const ann = getAnnotationsForGroup(g)
      annotations.push(...ann)
    }
  }
  if (group.controls) {
    for (let c of group.controls) {
      const ann = getAnnotationsForControl(c)
      annotations.push(...ann)
    }
  }
  return annotations
}

function getAnnotationsForControl(controlRun: ControlRun): Array<Annotation> {
  const lineRegex = new RegExp(`.*:[\d]*`)
  const annotations: Array<Annotation> = []

  for (let result of controlRun.results || []) {
    if (result.status != 'alarm' && result.status != 'error') {
      continue
    }

    for (let dim of result.dimensions || []) {
      if ((dim.value || "").trim().length == 0) {
        continue
      }

      if (!lineRegex.test(dim.value || "")) {
        // this is not a file_path:line_number value
        continue
      }

      const [fileName, lineNumber, ...rest] = dim.value.split(":", 2);

      annotations.push({
        path: fileName.replace(process.cwd() + "/", ''),
        start_line: parseInt(lineNumber),
        end_line: parseInt(lineNumber),
        annotation_level: 'failure',
        message: result.reason,
        start_column: 0,
        end_column: 0,
      });
    }
  }

  return annotations;
}

export interface Annotation {
  path: string;
  start_line: number;
  end_line: number;
  annotation_level: string;
  message: string;
  start_column: number;
  end_column: number;
}

interface Status {
  alarm?: number;
  ok?: number;
  info?: number;
  skip?: number;
  error?: number;
}

interface Summary {
  status?: Status;
}

interface Dimension {
  key?: string;
  value?: string;
}

interface ControlResult {
  reason?: string;
  resource?: string;
  status?: string;
  dimensions?: Dimension[];
}

interface ControlRun {
  summary?: Status;
  results?: ControlResult[];
  controlId?: string;
  description?: string;
  severity?: string;
  tags?: string;
  title?: string;
  runStatus?: number;
  runError?: string;
}

interface GroupResult {
  groupId?: string;
  title?: string;
  description?: string;
  tags?: string;
  summary?: Summary;
  groups: GroupResult[] | null;
  controls: ControlRun[] | null;
}

type RootResult = GroupResult
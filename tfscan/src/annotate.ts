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

    if (context.payload.pull_request && annotations.length > 0) {
      await octokit.rest.checks.create({
        ...context.repo,
        pull_number: context.payload.pull_request.number,
        name: 'tfscan',
        head_sha: context.payload.pull_request['head']['sha'],
        status: 'completed',
        conclusion: 'action_required',
        output: {
          title: 'tfscan',
          summary: 'Terraform Validation Failed',
          annotations: annotations
        }
      });
    }
  } catch (error) {
    setFailed(error);
  }
}

export async function parseResultFile(filePath: string): Promise<RootResult> {
  if (context.payload.pull_request == null) {
    setFailed('No pull request found.');
    return null;
  }
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
  const annotations: Array<Annotation> = []
  controlRun.results
  if (controlRun.results != null) {
    controlRun.results.forEach((result) => {
      if (result.status === 'alarm') {
        const [fileName, lineNumber, ...rest] = result.dimensions[0].value.split(":", 2);
        annotations.push({
          path: fileName.replace(process.cwd() + "/", ''),
          start_line: parseInt(lineNumber),
          end_line: parseInt(lineNumber),
          annotation_level: result.status,
          message: result.reason,
          start_column: 1,
          end_column: 1,
        });
      }
    })
  }
  return annotations;
}

export interface Status {
  alarm?: number;
  ok?: number;
  info?: number;
  skip?: number;
  error?: number;
}

export interface Summary {
  status?: Status;
}

export interface Dimension {
  key?: string;
  value?: string;
}

export interface ControlResult {
  reason?: string;
  resource?: string;
  status?: string;
  dimensions?: Dimension[];
}

export interface ControlRun {
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

export interface GroupResult {
  groupId?: string;
  title?: string;
  description?: string;
  tags?: string;
  summary?: Summary;
  groups?: GroupResult[];
  controls?: ControlRun[];
}

export type RootResult = GroupResult

export interface Annotation {
  path: string;
  start_line: number;
  end_line: number;
  annotation_level: string;
  message: string;
  start_column: number;
  end_column: number;
}

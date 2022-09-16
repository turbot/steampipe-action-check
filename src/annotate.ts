import { ActionInput } from "./input";
import { readFile } from "fs/promises";
import * as github from '@actions/github';
import { setFailed } from "@actions/core";

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

export interface FileInfo {
  sha: string;
  filename: string;
  status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged";
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string;
  previous_filename?: string;
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


/**
 * Returns an array of annotations for a RootResult
 * 
 * @param group GroupResult The group result returned by `steampipe check`
 * @returns 
 */
export function GetAnnotations(result: RootResult): Array<Annotation> {
  if (result === null) {
    return null
  }
  return getAnnotationsForGroup(result)
}

/**
 * 
 * @param annotations Array<Annotation> Pushed a set of annotations to github
 */
export async function PushAnnotations(annotations: Array<Annotation>, actionInputs: ActionInput) {
  try {
    const octokit = github.getOctokit(actionInputs.githubToken);
    const check = await octokit.rest.checks.create({
      ...github.context.repo,
      pull_number: github.context.payload.pull_request.number,
      name: 'Terraform Validator',
      head_sha: github.context.payload.pull_request['head']['sha'],
      status: 'completed',
      conclusion: 'action_required',
      output: {
        title: 'Terraform Validator',
        summary: 'Terraform Validator Failure',
        annotations
      }
    });
  } catch (error) {
    setFailed(error);
  }
}

export async function ParseResultFile(filePath: string): Promise<RootResult> {
  const context = github.context;
  if (context.payload.pull_request == null) {
    setFailed('No pull request found.');
    return;
  }

  const fileContent = await readFile(filePath)
  return (JSON.parse(fileContent.toString()) as RootResult)
}

function getAnnotationsForGroup(group: GroupResult): Array<Annotation> {
  const annotations: Array<Annotation> = []
  for (let g of group.groups) {
    annotations.push(...getAnnotationsForGroup(g))
  }
  for (let c of group.controls) {
    annotations.push(...getAnnotationsForControl(c))
  }
  return annotations
}

function getAnnotationsForControl(controlRun: ControlRun): Array<Annotation> {
  const annotations: Array<Annotation> = []
  controlRun.results
  if (controlRun.results != null) {
    controlRun.results.forEach((result) => {
      if (result.status === 'alarm') {
        // AnnotationOnLine(actionInputs, result)
        var splitted = result.dimensions[0].value.split(":", 2);
        annotations.push({
          path: splitted[0].replace(process.cwd() + "/", ''),
          start_line: +(splitted[1]),
          end_line: +(splitted[1]),
          annotation_level: 'failure',
          message: result.reason,
          start_column: +(splitted[1]),
          end_column: +(splitted[1])
        });
      }
    })
  }
  return annotations;
}

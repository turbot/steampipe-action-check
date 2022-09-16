import { readFile } from "fs/promises";
import { context, getOctokit } from "@actions/github";
import { env } from "process";
/**
 * Returns an array of annotations for a RootResult
 * 
 * @param group GroupResult The group result returned by `steampipe check`
 * @returns 
 */
export function GetAnnotations(result: RootResult): Array<Annotation> {
  return getAnnotationsForGroup(result)
}

/**
 * Pushes the annotations to Github.
 * 
 * @param annotations Array<Annotation> Pushed a set of annotations to github
 */
export async function PushAnnotations(annotations: Array<Annotation>) {
  const octokit = getOctokit(env['GITHUB_TOKEN']);
  if (annotations.length > 0) {
    return Promise.resolve()
  }

  if (context.payload.pull_request) {
    octokit.rest.checks.create({
      ...context.repo,
      pull_number: context.payload.pull_request.number,
      name: 'Terraform Validator',
      head_sha: context.payload.pull_request['head']['sha'],
      status: 'completed',
      conclusion: 'action_required',
      output: {
        title: 'Steampipe Terraform Scanner',
        summary: 'Terraform Validation Failed',
        annotations: annotations
      }
    });
  }
}

export async function ParseResultFile(filePath: string): Promise<RootResult> {
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
    return annotations
  }
  return annotations
}

function getAnnotationsForControl(controlRun: ControlRun): Array<Annotation> {
  const annotations: Array<Annotation> = []
  controlRun.results
  if (controlRun.results != null) {
    controlRun.results.forEach((result) => {
      if (result.status === 'alarm') {
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

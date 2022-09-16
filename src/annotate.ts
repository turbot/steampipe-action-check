import { ActionInput } from "./input";
import { readFile } from "fs/promises";
import { Octokit } from '@octokit/rest';
import * as github from '@actions/github';
import { info, setFailed } from "@actions/core";

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

// export interface Annotation {
//   path: string;
//   start_line: number;
//   end_line: number;
//   annotation_level: string;
//   message: string;
//   start_column: number;
//   end_column: number;
// }


/**
 * Returns an array of annotations for a RootResult
 * 
 * @param group GroupResult The group result returned by `steampipe check`
 * @returns 
 */
export function GetAnnotations(result: RootResult, input: ActionInput): Array<any> {
  if (result === null) {
    return null
  }
  info(`tur-${input.githubToken}-bot`)
  let octokit = new Octokit({
    auth: input.githubToken
  });
  return getAnnotationsForGroup(octokit, result, input)
}

// /**
//  * 
//  * @param annotations Array<Annotation> Pushed a set of annotations to github
//  */
// export async function PushAnnotations(annotations: Array<any>, actionInputs: ActionInput) {
//   try {
//     const octokit = new Octokit({
//       auth: actionInputs.githubToken
//     });
//     if (annotations === null)
//       return;
//     for (var i = 0; i < annotations.length; i++) {
//       const annotation = annotations[i]
//       console.log('annotation----------------->>>>>>>>>>>>>>>', {
//         ...github.context.repo,
//         pull_number: github.context.payload.pull_request.number,
//         name: 'Terraform Validator',
//         head_sha: github.context.payload.pull_request['head']['sha'],
//         status: 'completed',
//         conclusion: 'action_required',
//         output: {
//           title: 'Terraform Validator',
//           summary: 'Terraform Validator Failure',
//           annotations: [{
//             path: annotation.path,
//             start_line: annotation.start_line,
//             end_line: annotation.end_line,
//             annotation_level: annotation.annotation_level,
//             message: annotation.message,
//             start_column: annotation.start_column,
//             end_column: annotation.end_column
//           }]
//         }
//       })
//       await octokit.checks.create({
//         ...github.context.repo,
//         pull_number: github.context.payload.pull_request.number,
//         name: 'Terraform Validator',
//         head_sha: github.context.payload.pull_request['head']['sha'],
//         status: 'completed',
//         conclusion: 'action_required',
//         output: {
//           title: 'Terraform Validator',
//           summary: 'Terraform Validator Failure',
//           annotations: [{
//             path: annotation.path,
//             start_line: annotation.start_line,
//             end_line: annotation.end_line,
//             annotation_level: annotation.annotation_level,
//             message: annotation.message,
//             start_column: annotation.start_column,
//             end_column: annotation.end_column
//           }]
//         }
//       });
//       // console.log('check=================', check)
//     }
//   } catch (error) {
//     setFailed(error);
//   }
// }

export async function ParseResultFile(filePath: string): Promise<RootResult> {
  const context = github.context;
  if (context.payload.pull_request == null) {
    setFailed('No pull request found.');
    return;
  }

  const fileContent = await readFile(filePath, 'utf-8')
  return JSON.parse(fileContent)
}

function getAnnotationsForGroup(octokit: Octokit, group: GroupResult, input: ActionInput): Array<any> {
  const annotations: Array<any> = []
  for (let g of group.groups) {
    annotations.push(...getAnnotationsForGroup(octokit, g, input))
  }
  for (let c of group.controls) {
    AnnotationOnLine(octokit, c.results, input)
  }
  return annotations
}

/* function getAnnotationsForControl(controlRun: ControlRun): Array<any> {
  const annotations12: Array<any> = []
  controlRun.results
  if (controlRun.results != null) {
    controlRun.results.forEach((result) => {
      if (result.status === 'alarm') {
        var splitted = result.dimensions[0].value.split(":", 2);
        annotations12.push({
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
  return annotations12;
} */


async function AnnotationOnLine(octokit: Octokit, results: Array<ControlResult>, actionInputs: ActionInput) {
  try {
    console.log(" AnnotationOnLine.1========== >>>>>>>>>>>", results)
    if (results === null)
      return;
    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const splitted = result.dimensions[0].value.split(":", 2);
      const path = splitted[0].replace(process.cwd() + "/", '');
      const lineNo = parseInt(splitted[1])

      console.log("AnnotationOnLine.2========== >>>>>>>>>>>", i, splitted, path, lineNo)

      const data = {
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number: github.context.payload.pull_request.number,
        name: 'Terraform Validator',
        head_sha: github.context.payload.pull_request['head']['sha'],
        status: 'completed',
        conclusion: 'failure',
        output: {
          title: result.resource,
          summary: result.reason,
          annotations: [
            {
              path: path,
              start_line: lineNo,
              end_line: lineNo,
              annotation_level: 'failure',
              message: result.reason,
              start_column: lineNo,
              end_column: lineNo
            }
          ]
        }
      }
      console.log("AnnotationOnLine.3========== >>>>>>>>>>>", i, data)
      const check = await octokit.rest.checks.create(data);
      console.log(check)
    }
  } catch (error) {
    setFailed(error);
  }

}
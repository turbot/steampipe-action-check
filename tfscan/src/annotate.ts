import { setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { readFile } from "fs/promises";
import { GITHUB_PULL_REQUEST_KEY_HEAD, GITHUB_PULL_REQUEST_KEY_SHA, STEAMPIPE_ACTION_NAME, STEAMPIPE_ANNOTATION_CONCLUSION_ACTION_REQUIRED, STEAMPIPE_ANNOTATION_LEVEL, STEAMPIPE_ANNOTATION_STATUS_COMPLETED, STEAMPIPE_ANNOTATION_SUMMARY, STEAMPIPE_ANNOTATION_TITLE, STEAMPIPE_MOD_RUN_STATUS_ALARM, STEAMPIPE_MOD_RUN_STATUS_ERROR } from "./constants";
import { ActionInput } from "./input";
import { Annotation, ControlRun, GroupResult, RootResult } from "./models/annotate-models"

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
        head_sha: context.payload.pull_request[GITHUB_PULL_REQUEST_KEY_HEAD][GITHUB_PULL_REQUEST_KEY_SHA],
        check_run_id: context.runId,
        name: STEAMPIPE_ACTION_NAME,
        status: STEAMPIPE_ANNOTATION_STATUS_COMPLETED,
        conclusion: STEAMPIPE_ANNOTATION_CONCLUSION_ACTION_REQUIRED,
        output: {
          title: STEAMPIPE_ANNOTATION_TITLE,
          summary: STEAMPIPE_ANNOTATION_SUMMARY,
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
    if (result.status != STEAMPIPE_MOD_RUN_STATUS_ALARM && result.status != STEAMPIPE_MOD_RUN_STATUS_ERROR) {
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
        annotation_level: STEAMPIPE_ANNOTATION_LEVEL,
        message: result.reason,
        start_column: 0,
        end_column: 0,
      });
    }
  }

  return annotations;
}

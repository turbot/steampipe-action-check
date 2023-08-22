import { endGroup, startGroup } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { info } from "console";
import { readFile } from "fs/promises";
import * as utils from "./utils";

export async function processAnnotations(input) {
  if (context.payload.pull_request == null) {
    return;
  }
  startGroup("Processing output");
  info("Fetching output");
  const annotations = [];
  const result = await parseResultFile("check-output.json");
  annotations.push(...getAnnotations(result));

  info(`Pushing Annotations`);
  await pushAnnotations(input, annotations);
  utils.removeFiles(["check-output.json"]);
  endGroup();
}

/**
 * Returns an array of annotations for a RootResult
 *
 * @param group GroupResult The group result returned by `steampipe check`
 * @returns
 */
export function getAnnotations(result) {
  if (result === null) {
    return null;
  }
  return getAnnotationsForGroup(result);
}

export async function parseResultFile(filePath) {
  const fileContent = await readFile(filePath);
  return JSON.parse(fileContent.toString());
}

/**
 * Pushes the annotations to Github.
 *
 * @param annotations Array<Annotation> Pushed a set of annotations to github
 */
export async function pushAnnotations(input, annotations) {
  const octokit = getOctokit(input.token);
  if (annotations === null || annotations.length === 0) {
    return;
  }

  const chunks = [];

  for (let ann of annotations) {
    if (chunks.length == 0) {
      // push in the first one
      chunks.push([]);
    }

    // check if the last one has reached limit
    if (chunks[chunks.length - 1].length > 49) {
      chunks.push([]);
    }

    // push this one to the last one
    chunks[chunks.length - 1].push(ann);
  }

  // TODO: Are all of these values correct and standard?
  for (let chunk of chunks) {
    await octokit.rest.checks.create({
      ...context.repo,
      pull_number: context.payload.pull_request.number,
      head_sha: context.payload.pull_request["head"]["sha"],
      check_run_id: context.runId,
      name: "steampipe-check",
      status: "completed",
      conclusion: "action_required",
      output: {
        title: "Steampipe Check",
        summary: "Control check failed",
        annotations: chunk,
      },
    });
  }
}

function getAnnotationsForGroup(group) {
  const annotations = [];
  if (group.groups) {
    for (let g of group.groups) {
      const ann = getAnnotationsForGroup(g);
      annotations.push(...ann);
    }
  }
  if (group.controls) {
    for (let c of group.controls) {
      const ann = getAnnotationsForControl(c);
      annotations.push(...ann);
    }
  }
  return annotations;
}

function getAnnotationsForControl(controlRun) {
  const lineRegex = new RegExp(`.*:[\d]*`);
  const annotations = [];

  for (let result of controlRun.results || []) {
    if (result.status != "alarm" && result.status != "error") {
      continue;
    }

    for (let dim of result.dimensions || []) {
      if ((dim.value || "").trim().length == 0) {
        continue;
      }

      if (!lineRegex.test(dim.value || "")) {
        // this is not a file_path:line_number value
        continue;
      }

      const [fileName, lineNumber, ...rest] = dim.value.split(":", 2);

      annotations.push({
        path: fileName.replace(process.cwd() + "/", ""),
        start_line: parseInt(lineNumber),
        end_line: parseInt(lineNumber),
        annotation_level: "failure",
        message: result.reason,
        start_column: 0,
        end_column: 0,
      });
    }
  }

  return annotations;
}

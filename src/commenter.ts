import { ActionInput } from "./input";
import { readFile } from "fs/promises";
import { Octokit } from '@octokit/rest';
import { setFailed, startGroup, endGroup } from "@actions/core";
import * as github from '@actions/github';
import { ControlResult, GroupResult } from "./annotate";

const patchRegex = new RegExp(`^@@.*\d [\+\-](\d+),?(\d+)?.+?@@`)
const commitRefRegex = new RegExp(".+ref=(.+)")


/* async function CommentOnLine(actionInputs: ActionInput, result: Result) {
  const fileSHAMap = await GetPRFileInfos(actionInputs, result)
  try {
    const octokit = new Octokit({
      auth: actionInputs.githubToken
    });
    var splitted = result.dimensions[0].value.split(":", 2);
    console.log("results---------------->>>>>>>>>", {
      ...github.context.repo,
      pull_number: github.context.payload.pull_request.number,
      body: result.reason,
      commit_id: '', //fileSHAMap.get(splitted[0].replace(process.cwd() + "/", '')),
      path: splitted[0].replace(process.cwd() + "/", ''), //examples/terraform/aws/ec2/ec2_ebs_default_encryption_enabled.tf
      line: +splitted[1]
    })
    const new_comment = await octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/comments', {
      ...github.context.repo,
      pull_number: github.context.payload.pull_request.number,
      body: result.reason,
      commit_id: '', //fileSHAMap[splitted[0].replace(process.cwd() + "/", '')],
      path: splitted[0].replace(process.cwd() + "/", ''), //examples/terraform/aws/ec2/ec2_ebs_default_encryption_enabled.tf
      line: +splitted[1]
    })
    console.log("new_comment---------->>>>>>>>>>>.", new_comment)
  } catch (error) {
    setFailed(error);
  }

} */


/* async function GetPRFileInfos(actionInputs: ActionInput, result: Result): Promise<FileInfo[]> {
  try {
    const files = await github.getOctokit(actionInputs.githubToken).rest.pulls.listFiles({
      ...github.context.repo,
      pull_number: github.context.payload.pull_request.number,
      per_page: 3000
    })
    return files.data;
  } catch (error) {
    return null
  }
}

function GetCommitInfo(file: FileInfo) {
  var isBinary: boolean
  const patch = file.patch
  const hunk = parseHunkPositions(patch, file.filename)

  const shaGroups = file.contents_url.match(commitRefRegex)//commitRefRegex.FindAllStringSubmatch(file.GetContentsURL(), -1)
  if (shaGroups.length < 1) {
    return null;
  }
  const sha = shaGroups[0][1]

  return {
    fileName: file.filename,
    hunkStart: hunk.hunkStart,
    hunkEnd: hunk.hunkStart + (hunk.hunkEnd - 1),
    sha: sha,
    likelyBinary: isBinary,
  };
}

function parseHunkPositions(patch: string, filename: string): { hunkStart: number, hunkEnd: number } {
  if (patch != "") {
    const groups: Array<string> = patch.match(patchRegex)
    if (groups != null && groups.length < 1) {
      return { hunkStart: 0, hunkEnd: 0 }
    }

    const patchGroup = groups[0]
    var endPos = 2
    if (patchGroup.length > 2 && patchGroup[2] == "") {
      endPos = 1
    }

    var hunkStart = +patchGroup[1]
    var hunkEnd = +patchGroup[endPos]
  }
  return { hunkStart, hunkEnd }
} */
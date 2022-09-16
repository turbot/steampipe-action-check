import { ActionInput, GroupJson } from "./input";
import { FileInfo, Group, Result } from "./output";
import { readFile } from "fs/promises";
import { Octokit } from '@octokit/rest';
import { setFailed, startGroup, endGroup } from "@actions/core";
import * as github from '@actions/github';

const patchRegex = new RegExp(`^@@.*\d [\+\-](\d+),?(\d+)?.+?@@`)
const commitRefRegex = new RegExp(".+ref=(.+)")

export async function AddPRComments(actionInputs: ActionInput, myExportFile: string) {
  startGroup(`Add Comments`)
  // const context = github.context;
  // if (context.payload.pull_request == null) {
  //   setFailed('No pull request found.');
  //   return;
  // }


  const content = await readFile(myExportFile, 'utf-8')
  console.log('github.context--------------->>>>>>>>>', github.context.payload.pull_request['head']['sha']);
  const group: Group = JSON.parse(content);
  // console.log('--------------->>>>>>>>>', group);
  ParseOnRun(group, actionInputs)
  endGroup()
}

function ParseOnRun(group: Group, actionInputs: ActionInput) {
  group.controls[0].results.forEach(function (result) {
    if (result.status = 'alarm') {
      AnnotationOnLine(actionInputs, result)
    }
  })
}

async function CommentOnLine(actionInputs: ActionInput, result: Result) {
  const fileSHAMap = await GetPRFileInfos(actionInputs, result)
  try {
    const octokit = new Octokit({
      auth: actionInputs.githubToken
    });
    var splitted = result.dimensions[0].value.split(":", 2);
    // const new_comment = await github.getOctokit(actionInputs.githubToken).rest.pulls.createReviewComment({
    //   ...github.context.repo,
    //   pull_number: github.context.payload.pull_request.number,
    //   body: result.reason,
    //   commit_id: fileSHAMap[splitted[0].replace(process.cwd() + "/", '')],
    //   path: splitted[0].replace(process.cwd() + "/", ''), //examples/terraform/aws/ec2/ec2_ebs_default_encryption_enabled.tf
    //   line: +splitted[1]
    // })
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

}


async function AnnotationOnLine(actionInputs: ActionInput, result: Result) {
  try {
    const octokit = new Octokit({
      auth: actionInputs.githubToken
    });
    var splitted = result.dimensions[0].value.split(":", 2);
    const check = await octokit.rest.checks.create({
      ...github.context.repo,
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
            path: splitted[0].replace(process.cwd() + "/", ''),
            start_line: +(splitted[1]),
            end_line: +(splitted[1]),
            annotation_level: 'failure',
            message: result.reason,
            start_column: +(splitted[1]),
            end_column: +(splitted[1])
          }
        ]
      }
    });
  } catch (error) {
    setFailed(error);
  }

}

async function GetPRFileInfos(actionInputs: ActionInput, result: Result): Promise<FileInfo[]> {
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
}
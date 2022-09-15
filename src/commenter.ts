import { ActionInput, GroupJson } from "./input";
import { Group, Result } from "./output";
import { readFile } from "fs/promises";
import { Octokit } from '@octokit/rest';
import { setFailed, startGroup, endGroup } from "@actions/core";
import * as github from '@actions/github';


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

  try {
    const octokit = new Octokit({
      auth: actionInputs.githubToken
    });
    var splitted = result.dimensions[0].value.split(":", 2);
    var input = {
      ...github.context.repo,
      owner: 'turbot',
      pull_number: github.context.payload.pull_request.number,
      body: result.reason,
      line: +(splitted[1]),
      commit_id: github.context.payload.pull_request['head']['sha'],
      // path: splitted[0].replace(process.cwd(), '') //examples/terraform/aws/ec2/ec2_ebs_default_encryption_enabled.tf
      // path: splitted[0].split("/")[splitted[0].split("/").length - 1]
      path: 'https://github.com/turbot/steampipe-action/pull/7/files#diff-1540d0669c3b13577f36bef3c817e7c60f61323750282f0e8a20f908413b5e66'
      // start_line: +(splitted[1]),
      // start_side: "RIGHT",
      // side: "RIGHT"
    }
    console.log('result==============>>>>>>>>>', input)
    const new_comment = await octokit.pulls.createReviewComment(input)
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
      owner: 'turbot',
      pull_number: github.context.payload.pull_request.number,
      repo: github.context.repo.repo,
      name: 'Terraform Validator',
      head_sha: github.context.payload.pull_request['head']['sha'],
      status: 'completed',
      conclusion: 'failure',
      output: {
        title: result.resource,
        summary: result.reason,
        annotations: [
          {
            path: splitted[0].split("/")[splitted[0].split("/").length - 1],
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
    console.log('check-------------------------', check)
  } catch (error) {
    setFailed(error);
  }

}
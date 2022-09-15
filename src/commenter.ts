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
      CommentOnLine(actionInputs, result)
    }
  })
}

async function CommentOnLine(actionInputs: ActionInput, result: Result) {

  try {
    const octokit = new Octokit({
      auth: actionInputs.githubToken
    });
    var splitted = result.dimensions[0].value.split(":", 2);
    const new_comment = await octokit.pulls.createReviewComment({
      ...github.context.repo,
      pull_number: github.context.payload.pull_request.number,
      body: result.reason,
      // commit_id: github.context.payload.pull_request['head']['sha'],
      commit_id: github.context.sha,
      // path: splitted[0].replace(process.cwd(), '') //examples/terraform/aws/ec2/ec2_ebs_default_encryption_enabled.tf
      path: splitted[0].split("/")[splitted[0].split("/").length - 1],
      line: +(splitted[1]),
      side: "RIGHT"
    })
    // const new_comment = await octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/comments', {
    //   ...github.context.repo,
    //   pull_number: github.context.payload.pull_request.number,
    //   body: result.reason,
    //   commit_id: github.context.sha,
    //   path: splitted[0].split("/")[splitted[0].split("/").length - 1],
    //   start_line: +(splitted[1]),
    //   start_side: 'RIGHT',
    //   line: +(splitted[1]),
    //   side: 'RIGHT'
    // })
    // console.log('result==============>>>>>>>>>', {
    //   ...github.context.repo,
    //   pull_number: github.context.payload.pull_request.number,
    //   body: result.reason,
    //   commit_id: github.context.sha,
    //   path: splitted[0].split("/")[splitted[0].split("/").length - 1],
    //   start_line: +(splitted[1]),
    //   start_side: 'RIGHT',
    //   line: +(splitted[1]),
    //   side: 'RIGHT'
    // })
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
      owner: 'turbot',
      pull_number: github.context.payload.pull_request.number,
      repo: github.context.repo.repo,
      name: 'Terraform Validator',
      head_sha: github.context.sha,
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
import { ActionInput, GroupJson } from "./input";
import { Group, Result } from "./output";
import { readFile } from "fs/promises";
import { Octokit } from '@octokit/rest';
import { setFailed, startGroup, endGroup } from "@actions/core";
import github from "@actions/github";


export async function AddPRComments(actionInputs: ActionInput, myExportFile: string) {
  startGroup(`Add Comments`)
  // const context = github.context;
  // if (context.payload.pull_request == null) {
  //   setFailed('No pull request found.');
  //   return;
  // }


  const content = await readFile(myExportFile, 'utf-8')
  // console.log('--------------->>>>>>>>>', content);
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
    var input = {
      ...github.context.repo,
      pull_number: github.context.payload.pull_request.number,
      body: result.reason,
      line: +(splitted[1]),
      commit_id: github.context.sha,
      path: splitted[0].replace('/home/runner/work/steampipe-action', '')
    }
    const new_comment = await octokit.pulls.createReviewComment(input)
    console.log('result==============>>>>>>>>>', input, new_comment)
  } catch (error) {
    setFailed(error.message);
  }

}
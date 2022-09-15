import { ActionInput, GroupJson } from "./input";
import { Group } from "./output";
import { readFile } from "fs/promises";
import { Octokit } from '@octokit/rest';
import { setFailed } from "@actions/core";
import github from "@actions/github";


export async function AddPRComments(actionInputs: ActionInput, myExportFile: string) {
  console.log('=================>>>>>>>>>')
  // const context = github.context;
  // if (context.payload.pull_request == null) {
  //   setFailed('No pull request found.');
  //   return;
  // }


  const content = await readFile(myExportFile, 'utf-8')
  console.log('--------------->>>>>>>>>', content);
  const group: Group = JSON.parse(content);
  console.log('--------------->>>>>>>>>', group.summary);
}



async function CommentOnLine(actionInputs: ActionInput) {

  try {
    const octokit = new Octokit({
      auth: actionInputs.githubToken
    });

    const new_comment = await octokit.pulls.createReviewComment({
      ...github.context.repo,
      pull_number: github.context.payload.pull_request.number,
      body: "message",
      line: 1,
      commit_id: github.context.sha,
      path: "string"
    })
  } catch (error) {
    setFailed(error.message);
  }

}
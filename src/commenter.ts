import { ActionInput, GroupJson } from "./input";
import { readFileSync } from 'fs';
import { Octokit } from '@octokit/rest';
// const github = require("@actions/github");
import { setFailed } from "@actions/core";
import github from "@actions/github";


export async function AddPRComments(actionInputs: ActionInput, myExportFile: string) {
  const context = github.context;
  // if (context.payload.pull_request == null) {
  //   setFailed('No pull request found.');
  //   return;
  // }


  console.log('--------------->>>>>>>>>', readFileSync(myExportFile, 'utf-8'));
  const group: Array<GroupJson> = JSON.parse(readFileSync(myExportFile, 'utf-8'))
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
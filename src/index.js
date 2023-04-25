import { setFailed, getInput } from "@actions/core";
import { processAnnotations } from "./annotate";

async function run() {
  try {
    console.log("token------------------", token, token.substring(2, 10))
    let token = getInput("github-token", { trimWhitespace: true });
    let runs = [];
    for (let i = 2; i < process.argv.length; i++) {
      runs.push(process.argv[i]);
    }
    await processAnnotations({ token, runs });
  } catch (error) {
    setFailed(error.message);
  }
}

run();

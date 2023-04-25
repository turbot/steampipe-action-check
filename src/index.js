import { setFailed, getInput } from "@actions/core";
import { processAnnotations } from "./annotate";

async function run() {
  try {
    let token = getInput("github-token", {
      trimWhitespace: true,
      required: true,
    });
    let runs = [];
    for (let i = 2; i < process.argv.length; i++) {
      runs.push(process.argv[i]);
    }
    console.log(`working with runs: ${runs}`)
    await processAnnotations({ token, runs });
  } catch (error) {
    setFailed(error.message);
  }
}

run();

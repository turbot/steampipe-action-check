import { setFailed, getInput, info } from "@actions/core";
import { processAnnotations } from "./annotate";
import { exportStepSummary } from "./utils";

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
    info(`working with runs: ${runs}`)
    await processAnnotations({ token, runs });
    await exportStepSummary({ token, runs });
  } catch (error) {
    setFailed(error.message);
  }
}

run();

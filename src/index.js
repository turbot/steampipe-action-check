import { setFailed } from "@actions/core";
import { processAnnotations } from "./annotate";
import { exportStepSummary } from "./utils";

async function run() {
  try {
    let token = process.env['GITHUB_TOKEN'];
    if (token.trim().length == 0){
      throw new Error("token is required but was not supplied")
    }
    // start from the third element in the argument vector, since the first two are
    // the path to the node executable and the path to the js file
    let runs = process.argv.slice(2)
    await processAnnotations({ token, runs });
    await exportStepSummary({ token, runs });
  } catch (error) {
    setFailed(error.message);
  }
}

run();

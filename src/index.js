import { setFailed } from "@actions/core";
import { processAnnotations } from "./annotate";

async function run() {
  try {

    token = getInput("github-token", { trimWhitespace: true })
    run = getInput("run", { trimWhitespace: true })
    runs = []
    for (let i = 2; i < process.argv.length; i++) {
      runs.push(process.argv[i]);
    }
    await processAnnotations({ token, runs })

  } catch (error) {
    setFailed(error.message);
  }
}

run()

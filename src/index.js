import { setFailed } from "@actions/core";
import { processAnnotations } from "./annotate";
import { ActionInput } from "./input";

async function run() {
  try {
    const inputs = new ActionInput()
    await processAnnotations(inputs)

  } catch (error) {
    setFailed(error.message);
  }
}

run()

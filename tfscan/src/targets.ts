import { extractTar, extractZip } from "@actions/tool-cache";

export const Targets = {
  linux: {
    x64: 'linux_amd64.tar.gz',
    arm64: 'linux_arm64.tar.gz',
  },
  darwin: {
    x64: 'darwin_amd64.zip',
    arm64: 'darwin_arm64.zip',
  }
};


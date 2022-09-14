"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@actions/core");
const steampipe_1 = require("./steampipe");
async function run() {
    try {
        const steampipeVersion = (0, core_1.getInput)('version', { required: false, trimWhitespace: true }) || "latest";
        const pluginsToInstall = JSON.parse((0, core_1.getInput)('plugins', { required: true, trimWhitespace: true }) || '[]');
        const modRepositoryPath = (0, core_1.getInput)('mod', { required: false, trimWhitespace: true }) || '';
        const connectionConfig = (0, core_1.getInput)("connection_config", { required: true, trimWhitespace: true });
        const steampipePath = await (0, steampipe_1.DownloadSteampipe)(steampipeVersion);
        (0, core_1.addPath)(steampipePath);
        await (0, steampipe_1.InstallSteampipe)(steampipePath);
        await (0, steampipe_1.InstallPlugins)(steampipePath, pluginsToInstall);
        if (modRepositoryPath.length > 0) {
            const modPath = await (0, steampipe_1.InstallMod)(modRepositoryPath);
            if (modPath.length == 0) {
                (0, core_1.setFailed)("bad repository for mod");
                return;
            }
        }
        await (0, steampipe_1.WriteConnections)(connectionConfig);
        await (0, steampipe_1.SteampipeServiceStart)(steampipePath);
    }
    catch (error) {
        (0, core_1.setFailed)(error.message);
    }
}
run();

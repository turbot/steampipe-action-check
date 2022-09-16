export declare class ActionInput {
    private run;
    version: string;
    modRepository: string;
    scanDirectory: string;
    where: string | null;
    output: string;
    export: Array<string>;
    summaryFile: string;
    constructor();
    getRun(): Array<string>;
}

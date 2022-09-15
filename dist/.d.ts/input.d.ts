export interface ActionInput {
    version: string;
    plugins: Array<string>;
    modRepository: string;
    connectionData: string;
    eventName: string;
    githubToken: string;
    run: Array<string>;
    where: string | null;
    output: string;
    export: Array<string>;
    summaryFile: string;
}
export interface GroupJson {
    groupId: string;
    title: string;
    description: string;
    tags: string;
    summary: string;
    groups: Array<GroupJson>;
    control: Array<ControlJson>;
}
export interface ControlJson {
    summary: string;
    results: Array<ResultJson>;
    controlId: string;
    description: string;
    severity: string;
    tags: string;
    title: string;
    runStatus: number;
    runError: string;
}
export interface ResultJson {
    reason: string;
    resource: string;
    status: string;
    dimensions: Array<DimensionJson>;
}
export interface DimensionJson {
    key: string;
    value: string;
}
export declare function GetInputs(): ActionInput;

export interface Status {
    alarm?: number;
    ok?: number;
    info?: number;
    skip?: number;
    error?: number;
}
export interface Summary {
    status?: Status;
}
export interface Dimension {
    key?: string;
    value?: string;
}
export interface Result {
    reason?: string;
    resource?: string;
    status?: string;
    dimensions?: Dimension[];
}
export interface Control {
    summary?: Status;
    results?: Result[];
    controlId?: string;
    description?: string;
    severity?: string;
    tags?: string;
    title?: string;
    runStatus?: number;
    runError?: string;
}
export interface Group {
    groupId?: string;
    title?: string;
    description?: string;
    tags?: string;
    summary?: Summary;
    groups?: Group[];
    controls?: Control[];
}

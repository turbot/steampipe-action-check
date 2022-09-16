import { ActionInput } from "./input";
/**
 * Returns an array of annotations for a RootResult
 *
 * @param group GroupResult The group result returned by `steampipe check`
 * @returns
 */
export declare function GetAnnotations(result: RootResult): Array<Annotation>;
/**
 * Pushes the annotations to Github.
 *
 * @param annotations Array<Annotation> Pushed a set of annotations to github
 */
export declare function PushAnnotations(input: ActionInput, annotations: Array<Annotation>): Promise<void>;
export declare function ParseResultFile(filePath: string): Promise<RootResult>;
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
export interface ControlResult {
    reason?: string;
    resource?: string;
    status?: string;
    dimensions?: Dimension[];
}
export interface ControlRun {
    summary?: Status;
    results?: ControlResult[];
    controlId?: string;
    description?: string;
    severity?: string;
    tags?: string;
    title?: string;
    runStatus?: number;
    runError?: string;
}
export interface GroupResult {
    groupId?: string;
    title?: string;
    description?: string;
    tags?: string;
    summary?: Summary;
    groups?: GroupResult[];
    controls?: ControlRun[];
}
export interface FileInfo {
    sha: string;
    filename: string;
    status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged";
    additions: number;
    deletions: number;
    changes: number;
    blob_url: string;
    raw_url: string;
    contents_url: string;
    patch?: string;
    previous_filename?: string;
}
export declare type RootResult = GroupResult;
export interface Annotation {
    path: string;
    start_line: number;
    end_line: number;
    annotation_level: string;
    message: string;
    start_column: number;
    end_column: number;
}

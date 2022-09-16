import { ActionInput } from "./input";
/**
 * Returns an array of annotations for a RootResult
 *
 * @param group GroupResult The group result returned by `steampipe check`
 * @returns
 */
export declare function getAnnotations(result: RootResult): Array<Annotation>;
/**
 * Pushes the annotations to Github.
 *
 * @param annotations Array<Annotation> Pushed a set of annotations to github
 */
export declare function pushAnnotations(input: ActionInput, annotations: Array<Annotation>): Promise<void>;
export declare function parseResultFile(filePath: string): Promise<RootResult>;
export interface Annotation {
    path: string;
    start_line: number;
    end_line: number;
    annotation_level: string;
    message: string;
    start_column: number;
    end_column: number;
}
interface Status {
    alarm?: number;
    ok?: number;
    info?: number;
    skip?: number;
    error?: number;
}
interface Summary {
    status?: Status;
}
interface Dimension {
    key?: string;
    value?: string;
}
interface ControlResult {
    reason?: string;
    resource?: string;
    status?: string;
    dimensions?: Dimension[];
}
interface ControlRun {
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
interface GroupResult {
    groupId?: string;
    title?: string;
    description?: string;
    tags?: string;
    summary?: Summary;
    groups: GroupResult[] | null;
    controls: ControlRun[] | null;
}
declare type RootResult = GroupResult;
export {};

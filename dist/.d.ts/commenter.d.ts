export declare type RootResult = GroupResult;
export interface GroupResult {
    controls: Array<ControlRun>;
    groups: Array<GroupResult>;
}
export interface ControlRun {
    results: Array<ControlResult>;
}
export interface ControlResult {
}
export interface Annotation {
}
/**
 * Returns an array of annotations for a RootResult
 *
 * @param group GroupResult The group result returned by `steampipe check`
 * @returns
 */
export declare function GetAnnotations(result: RootResult): Array<Annotation>;
/**
 *
 * @param annotations Array<Annotation> Pushed a set of annotations to github
 */
export declare function PushAnnotations(annotations: Array<Annotation>): Promise<void>;
export declare function ParseResultFile(filePath: string): Promise<RootResult>;

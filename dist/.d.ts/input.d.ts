export interface ActionInput {
    version: string;
    plugins: Array<string>;
    modRepository: string;
    connectionData: string;
    run: Array<string>;
    where: string | null;
    output: string;
    export: Array<string>;
}
export declare function GetInputs(): ActionInput;

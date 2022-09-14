export interface ActionInput {
    version: string;
    plugins: Array<string>;
    modRepository: string;
    connectionData: string;
    control: string;
    benchmark: string;
    output: string;
    export: string;
    where: string | null;
}
export declare function GetInputs(): ActionInput;

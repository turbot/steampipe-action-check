import { readFile } from "fs/promises";

export interface GroupResult { controls: Array<ControlRun>; groups: Array<GroupResult>; }
export interface ControlRun { results: Array<ControlResult>; }
export interface ControlResult { }
export interface Annotation { }

export async function ParseResultFile(filePath: string): Promise<GroupResult> {
  const fileContent = await readFile(filePath)
  return (JSON.parse(fileContent.toString()) as GroupResult)
}

/**
 * 
 * 
 * @param group GroupResult The group result returned by `steampipe check`
 * @returns 
 */
export function GetAnnotationsForGroup(group: GroupResult): Array<Annotation> {
  const annotations: Array<Annotation> = []
  for (let g of group.groups) {
    annotations.push(...GetAnnotationsForGroup(g))
  }
  for (let c of group.controls) {
    annotations.push(...getAnnotationsForControl(c))
  }
  return annotations
}

function getAnnotationsForControl(controlRun: ControlRun): Array<Annotation> {
  controlRun.results
  return []
}

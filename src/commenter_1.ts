export interface GroupResult { controls: Array<ControlRun>; groups: Array<GroupResult>; }
export interface ControlRun { }
export interface Annotation { }

export async function ParseResultFile(filePath: string): Promise<GroupResult | null> {
  return null
}

export async function AnnotateCommit(result: GroupResult) {
  return getAnnotationsForGroup(result)
}

function getAnnotationsForGroup(group: GroupResult): Array<string> {
  const annotations: Array<string> = []
  for (let c of group.controls) {
    annotations.push(...getAnnotationsForControl(c))
  }
  for (let g of group.groups) {
    annotations.push(...getAnnotationsForGroup(g))
  }
  return annotations
}

function getAnnotationsForControl(controlRun: ControlRun): Array<string> {
  return []
}
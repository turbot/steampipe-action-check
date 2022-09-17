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
  groups: GroupResult[] | null;
  controls: ControlRun[] | null;
}

export type RootResult = GroupResult
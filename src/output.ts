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
// export interface Pokedex {
//   group_id?: string;
//   title?: string;
//   description?: string;
//   tags?: PokedexTags;
//   summary?: Summary;
//   groups?: PokedexGroup[];
//   controls?: null;
// }

// export interface PokedexGroup {
//   group_id?: string;
//   title?: string;
//   description?: string;
//   tags?: PokedexTags;
//   summary?: Summary;
//   groups?: GroupGroup[];
//   controls?: null;
// }

// export interface GroupGroup {
//   group_id?: string;
//   title?: string;
//   description?: string;
//   tags?: PurpleTags;
//   summary?: Summary;
//   groups?: any[];
//   controls?: Control[];
// }

// export interface Control {
//   summary?: StatusClass;
//   results?: Result[] | null;
//   control_id?: string;
//   description?: string;
//   severity?: Severity;
//   tags?: ControlTags;
//   title?: string;
//   run_status?: number;
//   run_error?: string;
// }

// export interface Result {
//   reason?: string;
//   resource?: string;
//   status?: StatusEnum;
//   dimensions?: Dimension[];
// }

// export interface Dimension {
//   key?: Key;
//   value?: string;
// }

// export enum Key {
//   Column = "?column?",
// }

// export enum StatusEnum {
//   Alarm = "alarm",
//   Ok = "ok",
//   Skip = "skip",
// }

// export enum Severity {
//   Empty = "",
//   Medium = "medium",
// }

// export interface StatusClass {
//   alarm?: number;
//   ok?: number;
//   info?: number;
//   skip?: number;
//   error?: number;
// }

// export interface ControlTags {
//   category?: Category;
//   plugin?: Plugin;
//   service?: string;
//   aws_foundational_security?: string;
//   gdpr?: string;
//   hipaa?: string;
//   nist_800_53_rev_4?: string;
//   nist_csf?: string;
//   rbi_cyber_security?: string;
//   cis?: string;
//   soc_2?: string;
//   pci?: string;
//   hippa?: string;
//   type?: Type;
// }

// export enum Category {
//   Compliance = "Compliance",
// }

// export enum Plugin {
//   Terraform = "terraform",
// }

// export enum Type {
//   Benchmark = "Benchmark",
// }

// export interface Summary {
//   status?: StatusClass;
// }

// export interface PurpleTags {
//   category?: Category;
//   plugin?: Plugin;
//   service?: string;
//   type?: Type;
// }

// export interface PokedexTags {
// }

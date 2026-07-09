export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'note'; title?: string; text: string }
  | { type: 'table'; headers: [string, string]; rows: [string, string][] };

export interface LegalSection {
  id: string;
  title: string;
  summary?: string;
  blocks: LegalBlock[];
}

export interface LegalPageContent {
  slug: string;
  title: string;
  subtitle: string;
  sections: LegalSection[];
}

// Formes echangees avec les RPC du portail. Aucune n'est inferee : le contrat
// serveur (publishers_rpc.sql) est declare ici, une divergence se voit a la
// compilation plutot qu'a l'execution.

export type PublisherKind = 'author' | 'publisher';
export type PublisherStatus = 'pending' | 'verified' | 'suspended' | 'closed';
export type PublisherRole = 'admin' | 'catalog' | 'finance';
export type RightsStatus = 'public_domain' | 'licensed' | 'restricted' | 'unknown';

export type SubmissionState =
  | 'draft' | 'submitted' | 'in_review' | 'published' | 'suspended' | 'withdrawn';

export type PublisherOverview = {
  publisher_id: string;
  display_name: string;
  kind: PublisherKind;
  status: PublisherStatus;
  my_role: PublisherRole;
  drafts: number;
  in_review: number;
  published: number;
};

export type Submission = {
  id: string;
  publisher_id: string;
  state: SubmissionState;
  title: string;
  subtitle: string | null;
  authors: string;
  language: string;
  isbn: string | null;
  description: string | null;
  categories: string[];
  keywords: string[];
  declared_rights: RightsStatus;
  file_format: string | null;
  file_sha256: string | null;
  review_notes: string | null;
  submitted_at: string | null;
  updated_at: string;
};

export type ReviewItem = {
  id: string;
  publisher_id: string;
  publisher_name: string;
  state: SubmissionState;
  title: string;
  authors: string;
  language: string;
  isbn: string | null;
  declared_rights: RightsStatus;
  file_format: string | null;
  file_sha256: string | null;
  submitted_at: string | null;
};

export type DuplicateHint = {
  id: string;
  title: string;
  publisher_name: string;
  state: SubmissionState;
  reason: string;
};

export type ReviewDecision = 'approve' | 'changes' | 'reject';

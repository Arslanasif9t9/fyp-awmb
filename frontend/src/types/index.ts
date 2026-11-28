export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface World {
  id: string;
  name: string;
  domain: string;
  purpose: string;
  current_version: number;
  created_at: string;
}

export interface CreateWorldIn {
  name: string;
  domain: string;
  purpose: string;
}

export interface FileOut {
  id: string;
  filename: string;
  file_type: string;
  status: string;
  uploaded_at: string;
}

export interface EvidenceOut {
  id: string;
  claim_text: string;
  chunk_ref: string | null;
  status: string; // <-- Add karo
  created_at: string;
}

export interface ChangeLogOut {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  old_state: string | null;
  new_state: string | null;
  performed_at: string;
}

export interface QAResponse {
  answer: string;
  citations: EvidenceOut[];
}

export interface EntityOut {
  id: string;
  name: string;
  entity_type: string;
}

export interface RelationOut {
  id: string;
  source_entity_id: string;
  target_entity_id: string;
  relation_type: string;
}

export interface GraphDataOut {
  entities: EntityOut[];
  relations: RelationOut[];
}

export interface ContradictionOut {
  id: string;
  explanation: string;
  evidence_1_text: string;
  evidence_2_text: string;
  status: string;
  created_at: string;
}

export interface WhatIfCitation {
  claim_text: string;
  source_file: string | null;
  chunk_ref: string | null;
}

export interface WhatIfResponse {
  assumption: string;
  first_order: string[];
  second_order: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning: string;
  citations: WhatIfCitation[];
  disclaimer: string;
}


export type StudioCreatorType = 'author' | 'artist' | 'studio';
export type StudioCreatorStatus = 'active' | 'archived';

export interface StudioCreator {
  id: string;
  slug: string;
  name: string;
  type: StudioCreatorType;
  description: string | null;
  image: string | null;
  website: string | null;
  status: StudioCreatorStatus;
  title_count: number;
  related_title_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface CreatorTitleOption {
  id: string;
  title_english: string;
  slug: string;
}

export interface CreatorFormInput {
  name: string;
  type: StudioCreatorType;
  description: string | null;
  image: string | null;
  website: string | null;
  related_title_ids: string[];
}

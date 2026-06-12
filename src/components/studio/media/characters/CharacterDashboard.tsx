import { CharacterList } from './CharacterList';
import { CharacterStats } from './CharacterStats';
import type { StudioCharacterMedia, StudioMediaAsset } from '@/app/studio/media/types';

export function CharacterDashboard({ characters, assets }: { characters: StudioCharacterMedia[]; assets: StudioMediaAsset[] }) {
  return <div className="space-y-5"><CharacterStats characters={characters} /><CharacterList characters={characters} assets={assets} /></div>;
}

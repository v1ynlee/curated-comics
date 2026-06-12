import type { StudioCharacterMedia } from '@/app/studio/media/types';

export function CharacterStats({ characters }: { characters: StudioCharacterMedia[] }) {
  const missingImages = characters.filter((character) => character.imageCount === 0).length;
  const missingDescription = characters.filter((character) => !character.description?.trim()).length;
  const items = [['Total Characters', characters.length.toString()], ['With Images', (characters.length - missingImages).toString()], ['Missing Images', missingImages.toString()], ['Missing Description', missingDescription.toString()]];
  return <div className="grid gap-3 md:grid-cols-4">{items.map(([label, value]) => <div key={label} className="rounded-lg border border-white/10 bg-bg-surface/35 p-4"><p className="font-body text-xs text-text-tertiary">{label}</p><p className="mt-2 font-data text-lg text-text-primary">{value}</p></div>)}</div>;
}

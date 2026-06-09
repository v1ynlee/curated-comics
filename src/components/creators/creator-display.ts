import type { Creator, CreatorRole, CreatorType } from '@/types/creator';

const ROLE_LABELS: Record<CreatorRole, string> = {
  author: 'Author',
  artist: 'Artist',
  studio: 'Studio',
};

const TYPE_LABELS: Record<CreatorType, string> = ROLE_LABELS;

export function formatCreatorRoles(roles: CreatorRole[]): string {
  return roles.map((role) => ROLE_LABELS[role]).join(' / ');
}

export function formatCreatorType(type: CreatorType): string {
  return TYPE_LABELS[type];
}

export function getCreatorInitials(name: string): string {
  const parts = name.replace(/[()\-]/g, ' ').split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CC';
  if (parts[0].length <= 3 && parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

export function getCreatorImage(creator: Creator): string | undefined {
  if (creator.image) return creator.image;

  const folder = creator.type === 'author' ? 'authors' : 'artists';
  return `/images/${folder}/${creator.slug}.webp`;
}

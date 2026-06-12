// ============================================================
// Title Content Service — gallery, characters
// ============================================================

import { supabase } from '../api';
import { resolveMediaUrl } from '@/lib/storage/media-resolver';

export interface GalleryImage {
  id: string;
  category: 'best-scene' | 'romantic-scene' | 'funny-scene' | 'general' | 'cover';
  imageUrl: string;
  caption?: string;
  sortOrder: number;
}

export interface Character {
  id: string;
  name: string;
  role: 'main' | 'supporting' | 'antagonist' | 'side';
  description?: string;
  sortOrder: number;
  images: CharacterImage[];
}

export interface CharacterImage {
  id: string;
  imageUrl: string;
  caption?: string;
  sortOrder: number;
}

export async function fetchTitleGallery(titleId: string): Promise<GalleryImage[]> {
  const { data, error } = await supabase
    .from('title_gallery')
    .select('id, category, image_url, caption, sort_order')
    .eq('title_id', titleId)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`fetchTitleGallery: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    category: row.category,
    imageUrl: resolveMediaUrl(row.image_url, 'gallery-image'),
    caption: row.caption ?? undefined,
    sortOrder: row.sort_order,
  }));
}

export async function fetchTitleCharacters(titleId: string): Promise<Character[]> {
  const { data, error } = await supabase
    .from('title_characters')
    .select(`
      id, name, role, description, sort_order,
      character_images ( id, image_url, caption, sort_order )
    `)
    .eq('title_id', titleId)
    .order('sort_order', { ascending: true });

  if (error) throw new Error(`fetchTitleCharacters: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    description: row.description ?? undefined,
    sortOrder: row.sort_order,
    images: (row.character_images ?? []).map((img: { id: string; image_url: string; caption: string | null; sort_order: number }) => ({
      id: img.id,
      imageUrl: resolveMediaUrl(img.image_url, 'character'),
      caption: img.caption ?? undefined,
      sortOrder: img.sort_order,
    })),
  }));
}

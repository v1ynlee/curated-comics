import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

type ManifestAsset = { path: string; asset_type: string; name: string; width: number; height: number };

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'asset';
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function main() {
  const supabase = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE'));
  const assets: ManifestAsset[] = [];

  const [titles, characters, creators, articles] = await Promise.all([
    supabase.from('titles').select('slug, title_english').order('title_english'),
    supabase.from('title_characters').select('name').order('name'),
    supabase.from('creators').select('slug, name, type').order('name'),
    supabase.from('articles').select('slug, title').order('title'),
  ]);

  if (titles.error) throw titles.error;
  if (characters.error) throw characters.error;
  if (creators.error) throw creators.error;
  if (articles.error) throw articles.error;

  for (const title of titles.data ?? []) {
    assets.push({ path: `titles/covers/${title.slug}.webp`, asset_type: 'TITLE COVER', name: title.title_english, width: 600, height: 900 });
  }

  for (const character of characters.data ?? []) {
    assets.push({ path: `characters/${slugify(character.name)}.webp`, asset_type: 'CHARACTER', name: character.name, width: 512, height: 512 });
  }

  for (const creator of creators.data ?? []) {
    const kind = creator.type === 'artist' ? 'artists' : creator.type === 'studio' ? 'studios' : 'authors';
    const type = creator.type === 'artist' ? 'ARTIST' : creator.type === 'studio' ? 'STUDIO' : 'AUTHOR';
    assets.push({ path: `creators/${kind}/${creator.slug}.webp`, asset_type: type, name: creator.name, width: 512, height: 512 });
  }

  for (const article of articles.data ?? []) {
    assets.push({ path: `articles/covers/${article.slug}.webp`, asset_type: 'ARTICLE COVER', name: article.title, width: 1200, height: 675 });
  }

  const dir = mkdtempSync(join(tmpdir(), 'curated-media-'));
  const manifestPath = join(dir, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify({ assets }, null, 2));

  const result = spawnSync('python', ['scripts/generate-dev-media.py', '--manifest', manifestPath], { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});

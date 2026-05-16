'use client';

// ============================================================
// CharactersTab — character list with image grids
// Click a character → grid of their images.
// Lazy-loads all images with skeleton placeholders.
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Users, Swords, UserCheck,
  ArrowLeft, ChevronRight, Loader2, Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useTitleCharacters } from '@/hooks/useTitleContent';
import type { Character } from '@/services/public/titleContent';

const ROLE_CONFIG = {
  main:       { label: 'Main',       icon: User,      color: '#8b5cf6' },
  supporting: { label: 'Supporting', icon: Users,     color: '#06b6d4' },
  antagonist: { label: 'Antagonist', icon: Swords,    color: '#ef4444' },
  side:       { label: 'Side',       icon: UserCheck, color: '#6b7280' },
} as const;

// ── Lazy image ────────────────────────────────────────────────

function LazyImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={cn('relative overflow-hidden bg-surface-elevated/50', className)}>
      {!loaded && !error && <div className="absolute inset-0 animate-shimmer" aria-hidden="true" />}
      {!error && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon size={16} className="text-text-tertiary" />
        </div>
      )}
    </div>
  );
}

// ── Character card ────────────────────────────────────────────

function CharacterCard({
  character,
  onClick,
}: {
  character: Character;
  onClick: () => void;
}) {
  const roleConfig = ROLE_CONFIG[character.role];
  const RoleIcon = roleConfig.icon;
  const preview = character.images[0];

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl text-left w-full',
        'bg-surface-elevated/30 border border-white/5',
        'hover:border-white/10 hover:bg-surface-elevated/50',
        'transition-colors duration-150',
        'focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2',
      )}
    >
      {/* Avatar / preview */}
      <div className="shrink-0 w-12 h-16 rounded-lg overflow-hidden bg-surface-elevated/50">
        {preview ? (
          <LazyImage src={preview.imageUrl} alt={character.name} className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User size={20} className="text-text-tertiary" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="font-body text-sm font-semibold text-text-primary truncate">
          {character.name}
        </span>
        <div className="flex items-center gap-1.5">
          <RoleIcon size={11} style={{ color: roleConfig.color }} aria-hidden="true" />
          <span
            className="font-heading text-[10px] uppercase tracking-widest"
            style={{ color: roleConfig.color }}
          >
            {roleConfig.label}
          </span>
        </div>
        {character.description && (
          <p className="font-body text-[11px] text-text-tertiary line-clamp-2 leading-snug">
            {character.description}
          </p>
        )}
      </div>

      {/* Arrow */}
      {character.images.length > 0 && (
        <div className="flex items-center gap-1 shrink-0">
          <span className="font-data text-[10px] text-text-tertiary">{character.images.length}</span>
          <ChevronRight size={14} className="text-text-tertiary" aria-hidden="true" />
        </div>
      )}
    </motion.button>
  );
}

// ── Character image grid ──────────────────────────────────────

function CharacterGrid({
  character,
  onBack,
}: {
  character: Character;
  onBack: () => void;
}) {
  const roleConfig = ROLE_CONFIG[character.role];
  const RoleIcon = roleConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0] }}
    >
      {/* Back header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-text-tertiary hover:text-text-primary transition-colors focus-visible:outline-accent-primary rounded-sm"
          aria-label="Back to characters"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span className="font-heading text-xs uppercase tracking-widest">Back</span>
        </button>
        <div className="flex items-center gap-2 ml-2">
          <RoleIcon size={14} style={{ color: roleConfig.color }} aria-hidden="true" />
          <span className="font-body text-sm font-semibold text-text-primary">{character.name}</span>
        </div>
      </div>

      {character.images.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <ImageIcon size={32} className="text-text-tertiary" />
          <p className="font-body text-sm text-text-secondary">No images for this character yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {character.images.map((img) => (
            <div key={img.id} className="flex flex-col gap-1">
              <LazyImage
                src={img.imageUrl}
                alt={img.caption ?? character.name}
                className="aspect-[2/3] rounded-lg"
              />
              {img.caption && (
                <p className="font-body text-[10px] text-text-tertiary line-clamp-1 px-0.5">
                  {img.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Main CharactersTab ────────────────────────────────────────

export function CharactersTab({ titleId }: { titleId: string }) {
  const { data: characters, isLoading } = useTitleCharacters(titleId);
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="text-text-tertiary animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (!characters || characters.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Users size={36} className="text-text-tertiary" aria-hidden="true" />
        <p className="font-body text-sm text-text-secondary">No character data yet.</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <AnimatePresence mode="wait">
        {activeCharacter ? (
          <CharacterGrid
            key={activeCharacter.id}
            character={activeCharacter}
            onBack={() => setActiveCharacter(null)}
          />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-2"
          >
            {characters.map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                onClick={() => setActiveCharacter(char)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

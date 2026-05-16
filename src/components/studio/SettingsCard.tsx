'use client';

// ============================================================
// SettingsCard — Boolean toggle options for title visibility/features
// Uses AnimatedCheckbox for smooth animated transitions and
// CardWrapper for per-card save behavior.
// Requirements: 11.1, 11.2, 12.1, 12.2, 12.3, 12.4
// ============================================================

import { Settings } from 'lucide-react';
import { CardWrapper } from '@/components/studio/CardWrapper';
import { AnimatedCheckbox } from '@/components/studio/AnimatedCheckbox';

// ── Props ─────────────────────────────────────────────────────

export interface SettingsCardProps {
  featured: boolean;
  hidden: boolean;
  onFeaturedChange: (checked: boolean) => void;
  onHiddenChange: (checked: boolean) => void;
  onSave: () => Promise<void>;
}

// ── Component ─────────────────────────────────────────────────

export function SettingsCard({
  featured,
  hidden,
  onFeaturedChange,
  onHiddenChange,
  onSave,
}: SettingsCardProps) {
  return (
    <CardWrapper
      title="Settings"
      icon={<Settings className="w-4 h-4" />}
      onSave={onSave}
    >
      <div className="flex flex-col gap-4">
        <AnimatedCheckbox
          id="settings-featured"
          label="Featured on homepage"
          checked={featured}
          onChange={onFeaturedChange}
          variant="default"
        />

        <AnimatedCheckbox
          id="settings-hidden"
          label="Hidden from public view"
          checked={hidden}
          onChange={onHiddenChange}
          variant="warning"
        />
      </div>
    </CardWrapper>
  );
}

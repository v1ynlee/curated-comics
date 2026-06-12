import { GalleryList } from './GalleryList';
import { GalleryStats } from './GalleryStats';
import type { StudioGalleryGroup, StudioMediaAsset } from '@/app/studio/media/types';

export function GalleryDashboard({ galleries, assets }: { galleries: StudioGalleryGroup[]; assets: StudioMediaAsset[] }) {
  return <div className="space-y-5"><GalleryStats galleries={galleries} /><GalleryList galleries={galleries} assets={assets} /></div>;
}

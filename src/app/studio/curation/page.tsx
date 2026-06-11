// ============================================================
// Studio Curation Page — editorial control center
// ============================================================

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/db/supabase-server";
import { CurationInterface } from "./CurationInterface";
import { fetchFeaturedCurationData } from "./data";

export const metadata: Metadata = {
  title: "Curation",
  description:
    "Manage editorial curation across homepage, discover, creators, and tiers.",
};

export default async function StudioCurationPage() {
  const user = await getServerUser();
  if (!user) redirect("/studio/login");

  const featuredData = await fetchFeaturedCurationData();

  return (
    <div className="container-content max-w-7xl py-8">
      <header className="mb-7 flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
          Curation
        </h1>
        <p className="max-w-2xl font-body text-sm leading-relaxed text-text-secondary">
          Manage editorial presentation for homepage features, discover themes,
          creator exposure, and tier organization.
        </p>
      </header>

      <CurationInterface initialFeaturedData={featuredData} />
    </div>
  );
}

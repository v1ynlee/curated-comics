// ============================================================
// StudioPageTransition — Lightweight page transition for Studio
// CSS-only wrapper. Avoids route-level AnimatePresence around RSC payloads,
// which can leave browser transitions in an aborted state during refreshes.
// ============================================================

export function StudioPageTransition({ children }: { children: React.ReactNode }) {
  return <div className="studio-page-shell flex-1">{children}</div>;
}

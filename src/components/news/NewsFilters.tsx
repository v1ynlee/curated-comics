"use client";

// ============================================================
// NewsFilters — compact URL-driven article search and filters
// ============================================================

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { TouchEvent, WheelEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown, LoaderCircle, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ArticleCategory, ArticleTag } from "@/types/article";
import type { ArticleSort } from "@/services/public/articles";

interface NewsFiltersProps {
  categories: ArticleCategory[];
  tags: ArticleTag[];
  activeCategory: string | null;
  activeTag: string | null;
  activeSearch: string | null;
  activeSort: ArticleSort;
}

interface FilterOption {
  id: string;
  label: string;
  value: string;
  color?: string | null;
}

const SORT_OPTIONS: FilterOption[] = [
  { id: "sort-latest", label: "Latest", value: "latest" },
  { id: "sort-newest", label: "Newest", value: "newest" },
  { id: "sort-popular", label: "Popular", value: "popular" },
];

function FilterDropdown({
  label,
  activeLabel,
  options,
  activeValue,
  onSelect,
  allLabel,
}: {
  label: string;
  activeLabel: string;
  options: FilterOption[];
  activeValue: string | null;
  onSelect: (value: string | null) => void;
  allLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const touchYRef = useRef<number | null>(null);

  function containWheel(event: WheelEvent<HTMLDivElement>) {
    const menu = event.currentTarget;
    const maxScroll = menu.scrollHeight - menu.clientHeight;

    event.preventDefault();
    event.stopPropagation();

    if (maxScroll <= 0) return;

    menu.scrollTop = Math.min(maxScroll, Math.max(0, menu.scrollTop + event.deltaY));
  }

  function containTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchYRef.current = event.touches[0]?.clientY ?? null;
  }

  function containTouchMove(event: TouchEvent<HTMLDivElement>) {
    if (touchYRef.current === null) return;

    const menu = event.currentTarget;
    const touchY = event.touches[0]?.clientY;
    const maxScroll = menu.scrollHeight - menu.clientHeight;

    if (touchY === undefined) return;

    event.preventDefault();
    event.stopPropagation();

    if (maxScroll > 0) {
      menu.scrollTop = Math.min(maxScroll, Math.max(0, menu.scrollTop + touchYRef.current - touchY));
    }

    touchYRef.current = touchY;
  }

  return (
    <DropdownMenu.Root modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <motion.button
          type="button"
          className={cn(
            "inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border px-3",
            "border-white/10 bg-bg-deep/60 text-left text-sm text-text-secondary",
            "transition-colors duration-150 hover:border-white/20 hover:text-text-primary",
            "focus-visible:outline-none focus-visible:border-accent-primary/45",
            "data-[state=open]:border-accent-primary/40 data-[state=open]:text-text-primary",
          )}
          aria-label={`${label}: ${activeLabel}`}
          animate={{
            boxShadow: open ? "0 0 0 3px rgba(139,92,246,0.12)" : "0 0 0 0 rgba(139,92,246,0)",
          }}
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="min-w-0 truncate">{activeLabel}</span>
          <ChevronDown
            size={14}
            className={cn(
              "shrink-0 text-text-tertiary transition-[color,transform] duration-150",
              open && "rotate-180 text-accent-primary",
            )}
            aria-hidden="true"
          />
        </motion.button>
      </DropdownMenu.Trigger>

      <AnimatePresence>
        {open && (
          <DropdownMenu.Portal forceMount>
            <DropdownMenu.Content
              asChild
              forceMount
              align="start"
              sideOffset={7}
              collisionPadding={16}
            >
              <motion.div
                className={cn(
                  "z-modal max-h-[min(18rem,60vh)] overflow-y-auto overscroll-contain rounded-md",
                  "border border-white/10 bg-bg-surface p-1 [scrollbar-gutter:stable]",
                  "shadow-[0_2px_8px_rgba(0,0,0,0.28)]",
                  "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-text-tertiary/40 [&::-webkit-scrollbar-track]:bg-transparent",
                )}
                style={{ width: "var(--radix-dropdown-menu-trigger-width)" }}
                onWheel={containWheel}
                onTouchStart={containTouchStart}
                onTouchMove={containTouchMove}
                initial={{ opacity: 0, y: -7, scale: 0.965 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {allLabel && (
                  <DropdownMenu.Item
                    onSelect={() => onSelect(null)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-4 rounded-sm px-3 py-2 outline-none",
                      "text-sm transition-colors duration-100",
                      activeValue === null
                        ? "bg-accent-primary/10 text-accent-primary"
                        : "text-text-secondary hover:bg-white/5 hover:text-text-primary",
                    )}
                  >
                    <span className="truncate">{allLabel}</span>
                    {activeValue === null && <Check size={13} aria-hidden="true" />}
                  </DropdownMenu.Item>
                )}

                {options.map((option) => {
                  const isActive = activeValue === option.value;

                  return (
                    <DropdownMenu.Item
                      key={option.id}
                      onSelect={() => onSelect(option.value)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-4 rounded-sm px-3 py-2 outline-none",
                        "text-sm transition-colors duration-100",
                        isActive
                          ? "bg-accent-primary/10 text-accent-primary"
                          : "text-text-secondary hover:bg-white/5 hover:text-text-primary",
                      )}
                    >
                      <span
                        className="min-w-0 truncate"
                        style={option.color ? { color: option.color } : undefined}
                      >
                        {option.label}
                      </span>
                      {isActive && <Check size={13} className="shrink-0" aria-hidden="true" />}
                    </DropdownMenu.Item>
                  );
                })}
              </motion.div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        )}
      </AnimatePresence>
    </DropdownMenu.Root>
  );
}

function SearchField({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.label
      className="group/search relative block min-w-0 flex-1"
      animate={{
        boxShadow: focused ? "0 0 0 3px rgba(139,92,246,0.10)" : "0 0 0 0 rgba(139,92,246,0)",
      }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="sr-only">Search articles</span>
      <motion.span
        className="pointer-events-none absolute inset-0 rounded-md border border-accent-primary/0"
        animate={{ opacity: focused ? 1 : 0, borderColor: focused ? "rgba(139,92,246,0.45)" : "rgba(139,92,246,0)" }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      />
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary transition-colors duration-150 group-focus-within/search:text-accent-primary"
        aria-hidden="true"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        type="text"
        inputMode="search"
        role="searchbox"
        autoComplete="off"
        placeholder="Search articles"
        className={cn(
          "h-9 w-full appearance-none rounded-md border border-white/10 bg-bg-deep/60 pl-9 pr-9",
          "text-sm text-text-primary placeholder:text-text-tertiary",
          "transition-[border-color,background-color,box-shadow] duration-150",
          "hover:border-white/20 focus:border-accent-primary/45 focus:bg-bg-deep/80 focus:outline-none",
        )}
      />
      <AnimatePresence>
        {value && (
          <motion.button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-text-tertiary transition-colors hover:bg-white/5 hover:text-text-primary"
            aria-label="Clear search"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <X size={13} aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.label>
  );
}

export function NewsFilters({
  categories,
  tags,
  activeCategory,
  activeTag,
  activeSearch,
  activeSort,
}: NewsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hasActiveFilters = Boolean(
    activeCategory || activeTag || activeSearch || activeSort !== "latest",
  );
  const [searchValue, setSearchValue] = useState(activeSearch ?? "");
  const [mobileOpen, setMobileOpen] = useState(hasActiveFilters);
  const [isPending, startTransition] = useTransition();

  const categoryOptions = categories.map((category) => ({
    id: category.id,
    label: category.name,
    value: category.slug,
    color: category.color,
  }));
  const tagOptions = tags.map((tag) => ({
    id: tag.id,
    label: `#${tag.name}`,
    value: tag.slug,
  }));
  const activeCategoryLabel =
    categoryOptions.find((category) => category.value === activeCategory)?.label ?? "All categories";
  const activeTagLabel = tagOptions.find((tag) => tag.value === activeTag)?.label ?? "All tags";
  const activeSortLabel = SORT_OPTIONS.find((option) => option.value === activeSort)?.label ?? "Latest";

  const buildUrl = useCallback(
    (params: {
      category?: string | null;
      tag?: string | null;
      q?: string | null;
      sort?: ArticleSort;
    }) => {
      const nextCategory = params.category === undefined ? activeCategory : params.category;
      const nextTag = params.tag === undefined ? activeTag : params.tag;
      const nextSearch = params.q === undefined ? activeSearch : params.q;
      const nextSort = params.sort === undefined ? activeSort : params.sort;
      const searchParams = new URLSearchParams();

      if (nextCategory) searchParams.set("category", nextCategory);
      if (nextTag) searchParams.set("tag", nextTag);
      if (nextSearch?.trim()) searchParams.set("q", nextSearch.trim());
      if (nextSort !== "latest") searchParams.set("sort", nextSort);

      const queryString = searchParams.toString();
      return queryString ? `${pathname}?${queryString}` : pathname;
    },
    [activeCategory, activeSearch, activeSort, activeTag, pathname],
  );

  const navigate = useCallback(
    (params: {
      category?: string | null;
      tag?: string | null;
      q?: string | null;
      sort?: ArticleSort;
    }) => {
      startTransition(() => {
        router.push(buildUrl(params), { scroll: false });
      });
    },
    [buildUrl, router, startTransition],
  );

  function clearSearch() {
    setSearchValue("");
  }

  function clearAll() {
    setSearchValue("");
    setMobileOpen(false);
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  useEffect(() => {
    const nextSearch = searchValue.trim();
    const currentSearch = activeSearch ?? "";

    if (nextSearch === currentSearch) return;

    const timeoutId = window.setTimeout(() => {
      navigate({ q: nextSearch || null });
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [searchValue, activeSearch, navigate]);

  function renderFilterControls() {
    return (
      <>
        <SearchField value={searchValue} onChange={setSearchValue} onClear={clearSearch} />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:w-[33rem]">
          <FilterDropdown
            label="Categories"
            activeLabel={activeCategoryLabel}
            options={categoryOptions}
            activeValue={activeCategory}
            onSelect={(value) => navigate({ category: value })}
            allLabel="All categories"
          />
          <FilterDropdown
            label="Tags"
            activeLabel={activeTagLabel}
            options={tagOptions}
            activeValue={activeTag}
            onSelect={(value) => navigate({ tag: value })}
            allLabel="All tags"
          />
          <FilterDropdown
            label="Sort"
            activeLabel={activeSortLabel}
            options={SORT_OPTIONS}
            activeValue={activeSort}
            onSelect={(value) => navigate({ sort: (value ?? "latest") as ArticleSort })}
          />
        </div>
      </>
    );
  }

  return (
    <div className="relative">
      <div className="hidden rounded-lg border border-white/10 bg-bg-surface/45 p-3 transition-colors duration-150 md:block">
        <div className="flex items-center gap-3">{renderFilterControls()}</div>

        {(hasActiveFilters || isPending) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/10 pt-3 font-data text-[11px] text-text-tertiary">
            {isPending && (
              <span className="inline-flex items-center gap-1.5 text-text-secondary">
                <LoaderCircle size={12} className="animate-spin" aria-hidden="true" />
                Updating
              </span>
            )}
            {activeCategory && <span>Category: {activeCategoryLabel}</span>}
            {activeTag && <span>Tag: {activeTagLabel}</span>}
            {activeSearch && <span>Search: {activeSearch}</span>}
            {activeSort !== "latest" && <span>Sort: {activeSortLabel}</span>}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="ml-auto text-text-secondary transition-colors duration-150 hover:text-text-primary"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-bg-surface/50 text-text-secondary",
            "transition-colors duration-150 hover:border-white/20 hover:text-text-primary",
            "focus-visible:outline-none focus-visible:border-accent-primary/45 focus-visible:shadow-[0_0_0_3px_rgba(139,92,246,0.10)]",
            mobileOpen && "border-accent-primary/40 text-accent-primary",
          )}
          aria-label="Open article filters"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <SlidersHorizontal size={17} aria-hidden="true" /> : <Search size={17} aria-hidden="true" />}
        </button>

        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.div
              className="mt-3 overflow-hidden rounded-lg border border-white/10 bg-bg-surface/50 p-3"
              initial={{ opacity: 0, y: -6, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.99 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col gap-3">{renderFilterControls()}</div>

              {(hasActiveFilters || isPending) && (
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/10 pt-3 font-data text-[11px] text-text-tertiary">
                  {isPending && (
                    <span className="inline-flex items-center gap-1.5 text-text-secondary">
                      <LoaderCircle size={12} className="animate-spin" aria-hidden="true" />
                      Updating
                    </span>
                  )}
                  {activeCategory && <span>Category: {activeCategoryLabel}</span>}
                  {activeTag && <span>Tag: {activeTagLabel}</span>}
                  {activeSearch && <span>Search: {activeSearch}</span>}
                  {activeSort !== "latest" && <span>Sort: {activeSortLabel}</span>}
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="ml-auto text-text-secondary transition-colors duration-150 hover:text-text-primary"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

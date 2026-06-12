#!/usr/bin/env python3
"""Generate local development media placeholders with Pillow."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Iterable, TypedDict

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ROOT = ROOT / "public" / "platforms"


class Asset(TypedDict):
    path: str
    asset_type: str
    name: str
    width: int
    height: int


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "asset"


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for candidate in ("arial.ttf", "DejaVuSans-Bold.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font_obj: ImageFont.ImageFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current: list[str] = []
    for word in words:
        candidate = " ".join([*current, word]).strip()
        if draw.textbbox((0, 0), candidate, font=font_obj)[2] <= max_width or not current:
            current.append(word)
        else:
            lines.append(" ".join(current))
            current = [word]
    if current:
        lines.append(" ".join(current))
    return lines


def palette(asset_type: str) -> tuple[tuple[int, int, int], tuple[int, int, int]]:
    palettes = {
        "TITLE COVER": ((45, 37, 29), (235, 211, 166)),
        "CHARACTER": ((29, 38, 45), (176, 214, 235)),
        "AUTHOR": ((42, 34, 42), (228, 198, 228)),
        "ARTIST": ((31, 43, 37), (190, 226, 205)),
        "STUDIO": ((42, 41, 34), (224, 217, 178)),
        "ARTICLE COVER": ((38, 31, 29), (236, 190, 176)),
        "GALLERY IMAGE": ((32, 34, 46), (190, 196, 232)),
    }
    return palettes.get(asset_type.upper(), ((34, 34, 34), (220, 220, 220)))


def draw_placeholder(asset: Asset) -> None:
    output = PUBLIC_ROOT / asset["path"]
    output.parent.mkdir(parents=True, exist_ok=True)

    width = int(asset["width"])
    height = int(asset["height"])
    background, foreground = palette(asset["asset_type"])
    image = Image.new("RGB", (width, height), background)
    draw = ImageDraw.Draw(image)

    margin = max(28, width // 14)
    title_font = font(max(22, width // 12))
    name_font = font(max(24, width // 10))
    meta_font = font(max(16, width // 22))

    draw.rectangle((margin, margin, width - margin, height - margin), outline=foreground, width=max(2, width // 180))

    y = margin + max(20, height // 14)
    for line in wrap_text(draw, asset["asset_type"].upper(), title_font, width - margin * 2):
        box = draw.textbbox((0, 0), line, font=title_font)
        draw.text(((width - box[2]) / 2, y), line, fill=foreground, font=title_font)
        y += box[3] - box[1] + 10

    y += max(14, height // 24)
    for line in wrap_text(draw, asset["name"], name_font, width - margin * 2):
        box = draw.textbbox((0, 0), line, font=name_font)
        draw.text(((width - box[2]) / 2, y), line, fill=foreground, font=name_font)
        y += box[3] - box[1] + 8

    resolution = f"{width}x{height}"
    box = draw.textbbox((0, 0), resolution, font=meta_font)
    draw.text(((width - box[2]) / 2, height - margin - box[3]), resolution, fill=foreground, font=meta_font)

    image.save(output, "WEBP", quality=86)


def default_assets() -> list[Asset]:
    return [
        {"path": f"titles/covers/{slugify(name)}.webp", "asset_type": "TITLE COVER", "name": name, "width": 600, "height": 900}
        for name in ("Solo Leveling", "Omniscient Reader", "Return of Mount Hua")
    ] + [
        {"path": f"characters/{slugify(name)}.webp", "asset_type": "CHARACTER", "name": name, "width": 512, "height": 512}
        for name in ("Character A", "Character B", "Character C")
    ] + [
        {"path": f"creators/authors/{slugify(name)}.webp", "asset_type": "AUTHOR", "name": name, "width": 512, "height": 512}
        for name in ("Author A", "Author B", "Author C")
    ] + [
        {"path": f"creators/artists/{slugify(name)}.webp", "asset_type": "ARTIST", "name": name, "width": 512, "height": 512}
        for name in ("Artist A", "Artist B", "Artist C")
    ] + [
        {"path": f"creators/studios/{slugify(name)}.webp", "asset_type": "STUDIO", "name": name, "width": 512, "height": 512}
        for name in ("Studio A", "Studio B")
    ] + [
        {"path": f"articles/covers/article-cover-{index:02d}.webp", "asset_type": "ARTICLE COVER", "name": f"Article Cover {index:02d}", "width": 1200, "height": 675}
        for index in (1, 2)
    ] + [
        {"path": f"titles/gallery/gallery-image-{index:02d}.webp", "asset_type": "GALLERY IMAGE", "name": f"Gallery Image {index:02d}", "width": 900, "height": 600}
        for index in (1, 2, 3)
    ]


def fallback_assets() -> list[Asset]:
    return [
        {"path": "temp/missing-title-cover.webp", "asset_type": "TITLE COVER", "name": "Missing Title Cover", "width": 600, "height": 900},
        {"path": "temp/missing-character.webp", "asset_type": "CHARACTER", "name": "Missing Character", "width": 512, "height": 512},
        {"path": "temp/missing-author.webp", "asset_type": "AUTHOR", "name": "Missing Creator", "width": 512, "height": 512},
        {"path": "temp/missing-studio.webp", "asset_type": "STUDIO", "name": "Missing Studio", "width": 512, "height": 512},
        {"path": "temp/missing-gallery-image.webp", "asset_type": "GALLERY IMAGE", "name": "Missing Gallery Image", "width": 900, "height": 600},
        {"path": "temp/missing-article-cover.webp", "asset_type": "ARTICLE COVER", "name": "Missing Article Cover", "width": 1200, "height": 675},
        {"path": "temp/missing-asset.webp", "asset_type": "ASSET", "name": "Missing Asset", "width": 800, "height": 800},
    ]


def load_manifest(path: Path) -> list[Asset]:
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    return list(data.get("assets", []))


def ensure_directories() -> None:
    for relative in (
        "titles/covers",
        "titles/gallery",
        "gallery",
        "characters",
        "creators/authors",
        "creators/artists",
        "creators/studios",
        "articles/covers",
        "temp",
    ):
        (PUBLIC_ROOT / relative).mkdir(parents=True, exist_ok=True)


def generate(assets: Iterable[Asset]) -> None:
    ensure_directories()
    for asset in assets:
        draw_placeholder(asset)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate local development media placeholders.")
    parser.add_argument("--manifest", type=Path, help="JSON manifest produced by scripts/seed-dev-media.ts")
    args = parser.parse_args()

    assets = fallback_assets()
    assets.extend(load_manifest(args.manifest) if args.manifest else default_assets())
    generate(assets)
    print(f"Generated {len(assets)} development media assets under {PUBLIC_ROOT}")


if __name__ == "__main__":
    main()

"""
Generate dummy article thumbnail images using Pillow.
Outputs multiple sizes (400w, 800w, 1200w) as WebP for srcset support.
Run: python scripts/generate_article_assets.py
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "articles")
SIZES = [400, 800, 1200]

ARTICLES = [
    {
        "slug": "article-solo-leveling",
        "title": "Solo Leveling",
        "subtitle": "10 YEARS COMPLETE",
        "bg": (18, 8, 35),
        "accent": (139, 92, 246),
        "accent2": (245, 158, 11),
    },
    {
        "slug": "article-anime-adaptation",
        "title": "Anime Adaptation",
        "subtitle": "ANNOUNCED",
        "bg": (6, 18, 40),
        "accent": (6, 182, 212),
        "accent2": (99, 102, 241),
    },
    {
        "slug": "article-industry-news",
        "title": "Industry News",
        "subtitle": "MANHWA MARKET",
        "bg": (28, 8, 8),
        "accent": (239, 68, 68),
        "accent2": (245, 158, 11),
    },
    {
        "slug": "article-hiatus-return",
        "title": "Hiatus Return",
        "subtitle": "SERIES UPDATE",
        "bg": (6, 24, 24),
        "accent": (20, 184, 166),
        "accent2": (217, 119, 6),
    },
    {
        "slug": "article-recommendations",
        "title": "Recommendations",
        "subtitle": "CURATED PICKS",
        "bg": (16, 8, 32),
        "accent": (168, 85, 247),
        "accent2": (16, 185, 129),
    },
    {
        "slug": "article-axed-series",
        "title": "Axed Series",
        "subtitle": "CANCELLED",
        "bg": (20, 6, 6),
        "accent": (220, 38, 38),
        "accent2": (75, 85, 99),
    },
    {
        "slug": "article-editorial-opinion",
        "title": "Editorial",
        "subtitle": "OPINION PIECE",
        "bg": (14, 10, 30),
        "accent": (236, 72, 153),
        "accent2": (139, 92, 246),
    },
    {
        "slug": "article-manhwa-market",
        "title": "Global Market",
        "subtitle": "MANHWA BOOM",
        "bg": (8, 14, 28),
        "accent": (59, 130, 246),
        "accent2": (192, 132, 252),
    },
]


def draw_grid(draw, w, h, color, step=40):
    for x in range(0, w, step):
        draw.line([(x, 0), (x, h)], fill=color, width=1)
    for y in range(0, h, step):
        draw.line([(0, y), (w, y)], fill=color, width=1)


def draw_circles(draw, w, h, accent):
    cx, cy = int(w * 0.75), int(h * 0.35)
    for r in range(80, 200, 30):
        alpha = max(10, 60 - r // 4)
        color = (*accent, alpha)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=color, width=1)


def draw_diagonal_bars(draw, w, h, accent):
    for i in range(0, w + h, 60):
        a = max(0, 30 - i // 20)
        color = (*accent, a)
        draw.line([(i, 0), (0, i)], fill=color, width=2)


def make_image(article: dict, width: int) -> Image.Image:
    height = width * 9 // 16
    bg = article["bg"]
    accent = article["accent"]
    accent2 = article["accent2"]

    img = Image.new("RGB", (width, height), bg)
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Grid
    grid_color = (*accent, 18)
    draw_grid(draw, width, height, grid_color, step=max(20, width // 20))

    # Diagonal bars
    draw_diagonal_bars(draw, width, height, accent2)

    # Circles
    draw_circles(draw, width, height, accent)

    # Gradient left band
    for x in range(width // 3):
        alpha = int(180 * (1 - x / (width // 3)))
        color = (*bg, alpha)
        draw.rectangle([x, 0, x + 1, height], fill=color)

    # Accent bar top
    draw.rectangle([0, 0, width, max(3, height // 80)], fill=(*accent, 220))

    # Accent bar bottom
    draw.rectangle([0, height - max(3, height // 80), width, height], fill=(*accent2, 180))

    # Corner accent
    draw.polygon(
        [(0, 0), (width // 8, 0), (0, height // 5)],
        fill=(*accent, 60),
    )

    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")

    # Text
    draw2 = ImageDraw.Draw(img)
    try:
        font_large = ImageFont.truetype("arial.ttf", max(18, width // 18))
        font_small = ImageFont.truetype("arial.ttf", max(10, width // 36))
    except Exception:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()

    pad = width // 20
    # Subtitle label
    draw2.text((pad, height // 3), article["subtitle"], fill=(*accent2, 200), font=font_small)
    # Title
    draw2.text((pad, height // 3 + max(18, width // 18) + 6), article["title"], fill=(240, 240, 245), font=font_large)

    # Dot grid bottom-right decorative
    dot_x = int(width * 0.72)
    dot_y = int(height * 0.6)
    dot_gap = max(8, width // 60)
    for row in range(5):
        for col in range(7):
            dx = dot_x + col * dot_gap
            dy = dot_y + row * dot_gap
            alpha = max(20, 80 - (row + col) * 8)
            draw2.ellipse([dx, dy, dx + 2, dy + 2], fill=(*accent, alpha))

    return img


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for article in ARTICLES:
        for width in SIZES:
            img = make_image(article, width)
            filename = f"{article['slug']}-{width}w.webp"
            path = os.path.join(OUTPUT_DIR, filename)
            img.save(path, "WEBP", quality=85)
            print(f"  Saved: {filename}")
    print(f"\nDone. Images written to: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()

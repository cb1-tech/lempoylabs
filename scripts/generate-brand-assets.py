from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage


ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "assets" / "brand"
FONT = Path(r"C:\Windows\Fonts\segoeuib.ttf")


def trim(image: Image.Image, padding: int = 0) -> Image.Image:
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        return image
    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(image.width, right + padding)
    bottom = min(image.height, bottom + padding)
    return image.crop((left, top, right, bottom))


def make_spark(master: Image.Image) -> None:
    alpha = np.asarray(master.getchannel("A")) > 8
    labels, count = ndimage.label(alpha)
    components = []
    for label_id in range(1, count + 1):
        ys, xs = np.where(labels == label_id)
        if len(xs) > 100:
            components.append((len(xs), label_id))
    components.sort(reverse=True)
    ray_ids = [label_id for _, label_id in components[1:4]]
    ray_mask = np.isin(labels, ray_ids)
    output = np.zeros((*ray_mask.shape, 4), dtype=np.uint8)
    source = np.asarray(master)
    output[ray_mask] = source[ray_mask]
    spark = trim(Image.fromarray(output, "RGBA"), 28)
    spark.save(BRAND / "lempoy-lab-spark.png", optimize=True)


def make_watermark(master: Image.Image) -> None:
    canvas = Image.new("RGBA", (1600, 1600), (0, 0, 0, 0))
    canvas.alpha_composite(master, ((1600 - master.width) // 2, (1600 - master.height) // 2))
    canvas.save(BRAND / "lempoy-watermark.png", optimize=True)


def make_wordmark(mark: Image.Image, filename: str, color: tuple[int, int, int, int]) -> None:
    symbol = trim(mark, 12)
    symbol.thumbnail((310, 310), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (1320, 360), (0, 0, 0, 0))
    canvas.alpha_composite(symbol, (24, (360 - symbol.height) // 2))
    draw = ImageDraw.Draw(canvas)
    name_font = ImageFont.truetype(str(FONT), 128)
    labs_font = ImageFont.truetype(str(FONT), 42)
    x = 375
    draw.text((x, 74), "LEMPOY", font=name_font, fill=color)
    draw.text((x + 5, 225), "L A B S", font=labs_font, fill=color)
    trim(canvas, 18).save(BRAND / filename, optimize=True)


def make_favicons() -> None:
    favicon = Image.open(BRAND / "lempoy-favicon.png").convert("RGB")
    for size in (32, 180):
        favicon.resize((size, size), Image.Resampling.LANCZOS).save(
            BRAND / f"lempoy-favicon-{size}.png", optimize=True
        )


def main() -> None:
    master = Image.open(BRAND / "lempoy-mark-primary.png").convert("RGBA")
    white = Image.open(BRAND / "lempoy-mark-white.png").convert("RGBA")
    make_spark(master)
    make_watermark(master)
    make_wordmark(master, "lempoy-wordmark.png", (7, 27, 59, 255))
    make_wordmark(white, "lempoy-wordmark-white.png", (255, 255, 255, 255))
    make_favicons()


if __name__ == "__main__":
    main()

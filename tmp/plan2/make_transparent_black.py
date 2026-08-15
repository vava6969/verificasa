import sys, numpy as np
from PIL import Image
from scipy import ndimage

BLACK_THRESH = 25

def process(src, dst):
    im = Image.open(src).convert("RGB")
    arr = np.array(im).astype(np.int16)
    h, w = arr.shape[:2]
    dist_from_black = arr.max(axis=2)  # 0 = pure black ... 255 = far from black
    is_bgish = dist_from_black < BLACK_THRESH

    # Edge-connected-component labeling: only black-ish regions touching the
    # image border count as "background" — protects any near-black pixels
    # that are part of the subject itself (e.g. dark shadow areas) but not
    # connected to the outer border.
    labeled, n = ndimage.label(is_bgish)
    border_labels = set(labeled[0, :]) | set(labeled[-1, :]) | set(labeled[:, 0]) | set(labeled[:, -1])
    border_labels.discard(0)
    bg_mask = np.isin(labeled, list(border_labels)) if border_labels else np.zeros((h, w), dtype=bool)

    alpha = np.where(bg_mask, 0, 255).astype(np.uint8)

    # Feather the edge: dilate+erode band around the mask boundary, blur just
    # that band so foreground edges aren't hard-clipped or halo-fringed.
    dil = ndimage.binary_dilation(bg_mask, iterations=3)
    ero = ndimage.binary_erosion(bg_mask, iterations=3)
    band = dil & ~ero
    alpha_f = ndimage.gaussian_filter(alpha.astype(np.float32), sigma=1.4)
    alpha_final = np.where(band, alpha_f, alpha).clip(0, 255).astype(np.uint8)

    rgba = np.dstack([np.array(im), alpha_final])
    out = Image.fromarray(rgba, mode="RGBA")
    out.save(dst)
    fg_pct = 100.0 * (alpha_final > 128).sum() / (h * w)
    print(f"{src} -> {dst}  fg_pct={fg_pct:.1f}%  mode={out.mode}  size={out.size}")

if __name__ == "__main__":
    pairs = [
        ("icon-contact-raw.png", "icon-contact-v1.png"),
        ("illo-contact-raw.png", "illo-contact-v1.png"),
        ("illo-reclamatii-raw.png", "illo-reclamatii-v1.png"),
        ("illo-parteneri-raw.png", "illo-parteneri-v1.png"),
        ("illo-marketing-raw.png", "illo-marketing-v1.png"),
        ("illo-cariere-raw.png", "illo-cariere-v1.png"),
        ("illo-legal-raw.png", "illo-legal-v1.png"),
        ("illo-birou-raw.png", "illo-birou-v1.png"),
    ]
    for src, dst in pairs:
        process(src, dst)

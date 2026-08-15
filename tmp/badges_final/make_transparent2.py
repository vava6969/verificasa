import sys
import numpy as np
from PIL import Image
from scipy import ndimage

THRESH = 32

def process(path, out_path):
    img = Image.open(path).convert("RGB")
    arr = np.array(img).astype(np.float32)
    h, w = arr.shape[:2]

    patches = [
        arr[0:20, 0:20],
        arr[0:20, w-20:w],
        arr[h-20:h, 0:20],
        arr[h-20:h, w-20:w],
    ]
    means = [p.reshape(-1, 3).mean(axis=0) for p in patches]
    bg = np.median(np.array(means), axis=0)

    dist = np.sqrt(((arr - bg) ** 2).sum(axis=2))
    mask_bg = dist < THRESH

    labeled, num = ndimage.label(mask_bg)
    border_labels = set(labeled[0, :].tolist()) | set(labeled[-1, :].tolist()) | set(labeled[:, 0].tolist()) | set(labeled[:, -1].tolist())
    border_labels.discard(0)

    final_bg = np.isin(labeled, list(border_labels))

    alpha = np.where(final_bg, 0, 255).astype(np.float32)

    dilated = ndimage.binary_dilation(final_bg, iterations=2)
    eroded = ndimage.binary_erosion(final_bg, iterations=2)
    band = dilated & ~eroded
    alpha_smooth = ndimage.gaussian_filter(alpha, sigma=1.5)
    alpha_final = np.where(band, alpha_smooth, alpha)

    rgba = np.dstack([arr.astype(np.uint8), alpha_final.astype(np.uint8)])
    out = Image.fromarray(rgba, "RGBA")
    out.save(out_path)

    fg_pct = (alpha_final > 127).sum() / alpha_final.size * 100
    edge_bg_left = mask_bg[:, 0].mean() * 100
    print(f"{path} -> {out_path}  fg_pct={fg_pct:.1f}%  bg_estimate={bg.round(1).tolist()}")

names = ["basic_icon", "basic_badge", "pro_icon", "pro_badge", "agent_icon", "agent_badge"]
for n in names:
    process(f"/tmp/badges_final/{n}_raw.png", f"/tmp/badges_final/{n}_v1.png")

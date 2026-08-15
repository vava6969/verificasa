from PIL import Image, ImageDraw, ImageFont

CELL = 180
PAD = 10
LABEL_H = 26
COLS = 3
ROWS = 2

items = [
    ("basic_icon_v1.png", "Basic - iconita"),
    ("pro_icon_v1.png", "Pro - iconita"),
    ("agent_icon_v1.png", "Agent - iconita"),
    ("basic_badge_v1.png", "Basic - badge"),
    ("pro_badge_v1.png", "Pro - badge"),
    ("agent_badge_v1.png", "Agent - badge"),
]

def checker(size, c1=(235,235,235), c2=(205,205,205), sq=10):
    img = Image.new("RGB", size, c1)
    d = ImageDraw.Draw(img)
    for y in range(0, size[1], sq):
        for x in range(0, size[0], sq):
            if ((x // sq) + (y // sq)) % 2 == 0:
                d.rectangle([x, y, x+sq, y+sq], fill=c2)
    return img

sheet_w = COLS * CELL + (COLS + 1) * PAD
sheet_h = ROWS * (CELL + LABEL_H) + (ROWS + 1) * PAD
sheet = Image.new("RGB", (sheet_w, sheet_h), (255, 255, 255))

try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
except Exception:
    font = ImageFont.load_default()

d = ImageDraw.Draw(sheet)

for idx, (fname, label) in enumerate(items):
    row = idx // COLS
    col = idx % COLS
    x = PAD + col * (CELL + PAD)
    y = PAD + row * (CELL + LABEL_H + PAD)

    bg = checker((CELL, CELL))
    im = Image.open(f"/tmp/badges_final/{fname}").convert("RGBA")
    im.thumbnail((CELL - 10, CELL - 10))
    ox = (CELL - im.width) // 2
    oy = (CELL - im.height) // 2
    bg.paste(im, (ox, oy), im)

    sheet.paste(bg, (x, y))
    d.rectangle([x, y, x + CELL, y + CELL], outline=(150, 150, 150), width=1)
    tw = d.textlength(label, font=font)
    d.text((x + (CELL - tw) / 2, y + CELL + 4), label, fill=(20, 20, 20), font=font)

sheet.save("/tmp/badges_final/winners_sheet.jpg", quality=68)
print("saved", sheet.size)

import os
from PIL import Image, ImageDraw, ImageFont

def create_transparent_ascii_png(output_path, text_color=(182, 28, 28, 255)):
    ascii_lines = [
        "  ███╗   ███╗██╗ █████╗ ",
        "  ████╗ ████║██║██╔══██╗",
        "  ██╔████╔██║██║███████║",
        "  ██║╚██╔╝██║██║██╔══██║",
        "  ██║ ╚═╝ ██║██║██║  ██║",
        "  ╚═╝     ╚═╝╚═╝╚═╝  ╚═╝"
    ]

    # Load monospace font
    try:
        font = ImageFont.truetype("consolas.ttf", 52)
    except IOError:
        try:
            font = ImageFont.truetype("cour.ttf", 52)
        except IOError:
            font = ImageFont.load_default()

    # Measure exact text dimensions for tight cropping
    temp_img = Image.new("RGBA", (2000, 1000), (0, 0, 0, 0))
    temp_draw = ImageDraw.Draw(temp_img)
    
    line_height = 60
    for i, line in enumerate(ascii_lines):
        temp_draw.text((40, 40 + i * line_height), line, font=font, fill=text_color)

    # Get bounding box of non-transparent pixels and crop tightly
    bbox = temp_img.getbbox()
    if bbox:
        # Add a tiny 20px padding around tight crop
        pad = 20
        crop_box = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), bbox[2] + pad, bbox[3] + pad)
        final_img = temp_img.crop(crop_box)
    else:
        final_img = temp_img

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    final_img.save(output_path, "PNG")
    print(f"Generated clean transparent PNG: {output_path} (Size: {final_img.width}x{final_img.height})")

if __name__ == "__main__":
    create_transparent_ascii_png("docs/assets/mia-ascii.png")

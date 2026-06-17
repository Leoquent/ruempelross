import PIL.Image as Image
import PIL.ImageDraw as ImageDraw
import PIL.ImageFilter as ImageFilter
import os

img_path = r"d:\Coding\Websites\ruempelross\RümpelRossWebsite\kundendaten\icons\Gemini_Generated_Image_jdikacjdikacjdik.png"
output_dir = r"d:\Coding\Websites\ruempelross\RümpelRossWebsite\site\assets\icons"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

im = Image.open(img_path)
width, height = im.size

# List of icon filenames in order row by row, 6 per row
icon_names = [
    # Row 1
    "entruempelung", "haushaltsaufloesung", "wohnungsaufloesung", "messie-haertefall", "innenausbau-renovierung", "nachlasspflege",
    # Row 2
    "bodenverlegung", "zwangsraeumung", "firmenaufloesung", "wohnung", "haus", "keller",
    # Row 3
    "dachboden", "garage", "gewerbe-buero", "messie-wohnung", "sonstiges", "quadratmeter",
    # Row 4
    "fuellstand-1", "fuellstand-2", "fuellstand-3", "fuellstand-4", "erdgeschoss", "treppe",
    # Row 5
    "aufzug", "termin-sofort", "termin-2wochen", "termin-1-2monate", "termin-planung", "wertgegenstaende",
    # Row 6
    "erbfall-nachlass", "besenrein", "renovierung"
]

grid_cols = 6
grid_rows = 6
header_y = 110 # Header text height

cell_w = width / grid_cols
cell_h = (height - header_y) / grid_rows

print(f"Image width: {width}, height: {height}")
print(f"Cell size: {cell_w}x{cell_h}")

# A list to record cropped coordinates for verification
cropped_info = []

# We'll save a copy with bounding boxes drawn for debugging
debug_im = im.copy()
debug_draw = ImageDraw.Draw(debug_im)

icon_idx = 0
for r in range(grid_rows):
    for c in range(grid_cols):
        if icon_idx >= len(icon_names):
            break
            
        name = icon_names[icon_idx]
        icon_idx += 1
        
        # Bounding box of the cell
        x0 = int(c * cell_w)
        y0 = int(header_y + r * cell_h)
        x1 = int((c + 1) * cell_w)
        y1 = int(header_y + (r + 1) * cell_h)
        
        # Crop the cell
        cell_img = im.crop((x0, y0, x1, y1))
        
        # Find the circle inside the cell.
        # The circle is in the upper part of the cell. Let's limit y search area.
        # Height of search area is about 260px (out of 349px cell height).
        search_h = int(cell_h * 0.8)
        gray_cell = cell_img.crop((0, 0, int(cell_w), search_h)).convert("L")
        
        # Find bounding box of dark pixels (grayscale < 100)
        # This will outline the thick black circle border.
        min_x, min_y = int(cell_w), search_h
        max_x, max_y = 0, 0
        
        # Scan pixels
        for py in range(search_h):
            for px in range(int(cell_w)):
                val = gray_cell.getpixel((px, py))
                if val < 80: # Very dark / black
                    if px < min_x: min_x = px
                    if py < min_y: min_y = py
                    if px > max_x: max_x = px
                    if py > max_y: max_y = py
        
        # If no dark pixels found, fallback to center of the top square
        if min_x >= max_x or min_y >= max_y:
            print(f"Warning: could not detect circle for {name}. Using fallback.")
            min_x, min_y = int(cell_w*0.1), int(cell_h*0.1)
            max_x, max_y = int(cell_w*0.9), int(cell_h*0.8)
            
        # Draw on main debug image
        debug_draw.rectangle([x0 + min_x, y0 + min_y, x0 + max_x, y0 + max_y], outline="green", width=2)
        
        # Calculate center and diameter
        cx = (min_x + max_x) // 2
        cy = (min_y + max_y) // 2
        
        # The outer black circle line has some thickness.
        # Let's expand diameter slightly to make sure we don't crop the black border.
        border_padding = 4
        diameter = max(max_x - min_x, max_y - min_y) + border_padding * 2
        radius = diameter // 2
        size_px = radius * 2
        
        # Crop the circle precisely (centered at cx, cy in cell coordinates)
        # We need coordinates relative to the original image
        abs_cx = x0 + cx
        abs_cy = y0 + cy
        
        crop_x0 = abs_cx - radius
        crop_y0 = abs_cy - radius
        crop_x1 = abs_cx + radius
        crop_y1 = abs_cy + radius
        
        # Crop from original image (RGB)
        icon_img = im.crop((crop_x0, crop_y0, crop_x1, crop_y1))
        
        # Create a transparency mask (circular white on black)
        # We will create a high-res mask and downscale it for anti-aliasing
        mask_scale = 4
        mask_size = (size_px * mask_scale, size_px * mask_scale)
        mask = Image.new("L", mask_size, 0)
        draw_mask = ImageDraw.Draw(mask)
        draw_mask.ellipse([0, 0, mask_size[0], mask_size[1]], fill=255)
        mask = mask.resize((size_px, size_px), Image.Resampling.LANCZOS)
        
        # Add alpha channel to the cropped image
        icon_rgba = icon_img.convert("RGBA")
        if icon_rgba.size != mask.size:
            print(f"Warning: size mismatch for {name}. Icon: {icon_rgba.size}, Mask: {mask.size}. Resizing.")
            icon_rgba = icon_rgba.resize(mask.size, Image.Resampling.LANCZOS)
            
        icon_rgba.putalpha(mask)
        
        # Save the icon
        icon_rgba.save(os.path.join(output_dir, f"{name}.png"))
        print(f"Saved {name}.png (size: {size_px}x{size_px})")

debug_im.save(r"d:\Coding\Websites\ruempelross\RümpelRossWebsite\kundendaten\icons\debug_grid_detected.png")
print("Saved debug image with detected circle bounding boxes")

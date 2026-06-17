import PIL.Image as Image
import PIL.ImageDraw as ImageDraw
import os

img_path = r"d:\Coding\Websites\ruempelross\RümpelRossWebsite\kundendaten\icons\icons 3 (1).png"
output_dir = r"d:\Coding\Websites\ruempelross\RümpelRossWebsite\site\assets\icons"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

im = Image.open(img_path)
width, height = im.size
alpha = im.getchannel('A')

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
    "erbfall-nachlass", "besenrein", "renovierung", "video", "beweissicherung"
]

grid_cols = 6
grid_rows = 6
header_y = 100

cell_w = width / grid_cols
cell_h = (height - header_y) / grid_rows

print(f"Image size: {width}x{height}")
print(f"Cell size: {cell_w}x{cell_h}")

# Step 1: Detect circle center and bounds using Alpha channel
detected_circles = []

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
        
        # Define search crop with a margin to avoid neighboring cells
        margin_x = int(cell_w * 0.05)
        margin_y = int(cell_h * 0.05)
        
        cell_alpha = alpha.crop((x0 + margin_x, y0 + margin_y, x1 - margin_x, y1 - margin_y))
        
        min_x, min_y = cell_alpha.width, cell_alpha.height
        max_x, max_y = 0, 0
        
        for py in range(cell_alpha.height):
            for px in range(cell_alpha.width):
                val = cell_alpha.getpixel((px, py))
                if val > 50:  # Opaque pixel of the icon
                    if px < min_x: min_x = px
                    if py < min_y: min_y = py
                    if px > max_x: max_x = px
                    if py > max_y: max_y = py
        
        if min_x >= max_x or min_y >= max_y:
            print(f"Warning: could not detect circle for {name}. Using fallback.")
            cx = x0 + int(cell_w / 2)
            cy = y0 + int(cell_h / 2)
            r_val = 126
        else:
            # Shift back to absolute coordinates
            abs_min_x = x0 + margin_x + min_x
            abs_max_x = x0 + margin_x + max_x
            abs_min_y = y0 + margin_y + min_y
            abs_max_y = y0 + margin_y + max_y
            
            cx = (abs_min_x + abs_max_x) // 2
            cy = (abs_min_y + abs_max_y) // 2
            
            # Since 'entruempelung' is slightly cut off on the left in the original image,
            # we should adjust its center if it's column 0.
            # Normal width for circles is ~252. For entruempelung it's 237.
            # So its left edge is missing 15 pixels. Let's adjust its center to make it align with others.
            if c == 0:
                # Normal width is 252. The right edge is abs_max_x.
                # So the adjusted center should be abs_max_x - 126.
                # Let's see: for entruempelung, abs_max_x = 308. Adjusted center cx = 308 - 126 = 182.
                # Let's do this adjustment for all column 0 icons if their width is smaller than 250!
                w = abs_max_x - abs_min_x + 1
                if w < 248:
                    cx = abs_max_x - 126
                    print(f"Adjusted center of column 0 icon '{name}' to {cx} to compensate for left cutoff.")
            
            r_val = max(abs_max_x - cx, cx - abs_min_x, abs_max_y - cy, cy - abs_min_y)
            
        detected_circles.append({
            "name": name,
            "cx": cx,
            "cy": cy,
            "r": r_val
        })

# Step 2: Determine crop size.
# The actual circular outlines are all roughly radius 126 (diameter 252).
# We want them all to be exactly the same size. Let's use a uniform radius of 132 (crop size 264x264).
# This gives a nice 6px transparent padding around the circular outlines.
crop_r = 132
crop_size = crop_r * 2

print(f"\nUsing uniform crop size: {crop_size}x{crop_size} (radius {crop_r}px)")

# Step 3: Crop and save
for item in detected_circles:
    name = item["name"]
    cx, cy = item["cx"], item["cy"]
    
    crop_x0 = cx - crop_r
    crop_y0 = cy - crop_r
    crop_x1 = cx + crop_r
    crop_y1 = cy + crop_r
    
    # Crop from original RGBA image directly to preserve transparency
    icon_img = im.crop((crop_x0, crop_y0, crop_x1, crop_y1))
    
    # Save the cropped icon directly! No need to apply a new mask because the original
    # background is already perfectly transparent outside the circles.
    icon_img.save(os.path.join(output_dir, f"{name}.png"))
    print(f"Saved {name}.png (size: {icon_img.size})")

print("\nAll icons cropped and saved successfully without masking issues!")

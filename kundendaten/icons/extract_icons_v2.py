import PIL.Image as Image
import PIL.ImageDraw as ImageDraw
import os

img_path = r"d:\Coding\Websites\ruempelross\RümpelRossWebsite\kundendaten\icons\icons 3 (1).png"
output_dir = r"d:\Coding\Websites\ruempelross\RümpelRossWebsite\site\assets\icons"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

im = Image.open(img_path)
width, height = im.size

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
header_y = 100  # Estimate whitespace height at the top

cell_w = width / grid_cols
cell_h = (height - header_y) / grid_rows

print(f"Image size: {width}x{height}")
print(f"Cell size: {cell_w}x{cell_h}")

# Step 1: Detect circle center and radius for each cell
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
        
        # We search inside the cell for the circle.
        # Crop the cell and look for dark pixels (grayscale < 120)
        # To avoid any noise at cell borders, we crop with a small inner margin
        margin_x = int(cell_w * 0.05)
        margin_y = int(cell_h * 0.05)
        
        cell_img = im.crop((x0 + margin_x, y0 + margin_y, x1 - margin_x, y1 - margin_y))
        gray_cell = cell_img.convert("L")
        
        min_x, min_y = gray_cell.width, gray_cell.height
        max_x, max_y = 0, 0
        
        for py in range(gray_cell.height):
            for px in range(gray_cell.width):
                val = gray_cell.getpixel((px, py))
                if val < 100:  # Dark border pixel
                    if px < min_x: min_x = px
                    if py < min_y: min_y = py
                    if px > max_x: max_x = px
                    if py > max_y: max_y = py
        
        # Fallback if no dark pixel found
        if min_x >= max_x or min_y >= max_y:
            print(f"Warning: could not detect circle for {name}")
            cx = gray_cell.width // 2
            cy = gray_cell.height // 2
            radius = int(min(gray_cell.width, gray_cell.height) * 0.4)
        else:
            # Shift back by margin to get cell coordinates
            min_x += margin_x
            max_x += margin_x
            min_y += margin_y
            max_y += margin_y
            
            cx = (min_x + max_x) // 2
            cy = (min_y + max_y) // 2
            
            # The circle outline has width, let's find the radius from center
            r_x = max(max_x - cx, cx - min_x)
            r_y = max(max_y - cy, cy - min_y)
            radius = max(r_x, r_y)
            
        # Absolute center in original image
        abs_cx = x0 + cx
        abs_cy = y0 + cy
        
        detected_circles.append({
            "name": name,
            "cx": abs_cx,
            "cy": abs_cy,
            "r": radius
        })
        print(f"Detected circle for '{name}': center=({abs_cx}, {abs_cy}), radius={radius}")

# Step 2: Determine uniform crop size
# We want all icons to have the same size, and the circle centered perfectly.
# To make sure no circle is cut off, we use the maximum radius found + a padding.
max_radius = max(item["r"] for item in detected_circles)
border_padding = 6  # Margin around the black outline
final_radius = max_radius + border_padding
final_size = final_radius * 2

print(f"\nUniform final radius: {final_radius}px, final size: {final_size}x{final_size}px")

# Step 3: Crop and apply mask
debug_im = im.copy()
debug_draw = ImageDraw.Draw(debug_im)

for item in detected_circles:
    name = item["name"]
    cx, cy = item["cx"], item["cy"]
    
    # Draw on debug image
    debug_draw.circle((cx, cy), item["r"], outline="green", width=2)
    debug_draw.rectangle([cx - final_radius, cy - final_radius, cx + final_radius, cy + final_radius], outline="red", width=1)
    
    # Crop square of size final_size
    crop_x0 = cx - final_radius
    crop_y0 = cy - final_radius
    crop_x1 = cx + final_radius
    crop_y1 = cy + final_radius
    
    icon_img = im.crop((crop_x0, crop_y0, crop_x1, crop_y1))
    
    # High-quality circular mask
    mask_scale = 4
    mask_size = (final_size * mask_scale, final_size * mask_scale)
    mask = Image.new("L", mask_size, 0)
    draw_mask = ImageDraw.Draw(mask)
    draw_mask.ellipse([0, 0, mask_size[0], mask_size[1]], fill=255)
    mask = mask.resize((final_size, final_size), Image.Resampling.LANCZOS)
    
    # Add alpha
    icon_rgba = icon_img.convert("RGBA")
    if icon_rgba.size != mask.size:
        print(f"Resizing icon_img for {name} from {icon_rgba.size} to {mask.size}")
        icon_rgba = icon_rgba.resize(mask.size, Image.Resampling.LANCZOS)
        
    icon_rgba.putalpha(mask)
    
    # Save PNG
    icon_rgba.save(os.path.join(output_dir, f"{name}.png"))
    print(f"Saved uniform icon: {name}.png")

debug_im.save(r"d:\Coding\Websites\ruempelross\RümpelRossWebsite\kundendaten\icons\debug_grid_detected_v2.png")
print("\nDone! Saved all icons and debug_grid_detected_v2.png")

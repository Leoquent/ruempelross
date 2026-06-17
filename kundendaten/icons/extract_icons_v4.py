import PIL.Image as Image
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

# Approximate centers of the circles on the sheet
rough_x = [190, 508, 822, 1133, 1445, 1763]
rough_y = [277, 632, 971, 1310, 1654, 1997]

grid_cols = 6
grid_rows = 6

detected_circles = []
icon_idx = 0

for r in range(grid_rows):
    for c in range(grid_cols):
        if icon_idx >= len(icon_names):
            break
        name = icon_names[icon_idx]
        icon_idx += 1
        
        # Approximate center
        rx = rough_x[c]
        ry = rough_y[r]
        
        # Define search window of 300x300 pixels centered at (rx, ry)
        # We clamp coordinates to image boundaries
        win_x0 = max(0, rx - 150)
        win_y0 = max(0, ry - 150)
        win_x1 = min(width, rx + 150)
        win_y1 = min(height, ry + 150)
        
        # Crop the alpha channel in this window
        win_alpha = alpha.crop((win_x0, win_y0, win_x1, win_y1))
        
        # Find bounding box of alpha > 50 inside the window
        min_x, min_y = win_alpha.width, win_alpha.height
        max_x, max_y = 0, 0
        
        for py in range(win_alpha.height):
            for px in range(win_alpha.width):
                val = win_alpha.getpixel((px, py))
                if val > 50:
                    if px < min_x: min_x = px
                    if py < min_y: min_y = py
                    if px > max_x: max_x = px
                    if py > max_y: max_y = py
                    
        # Check if we detected it
        if min_x >= max_x or min_y >= max_y:
            print(f"Error: could not detect circle for {name} using rough center ({rx}, {ry}). Using fallback.")
            cx = rx
            cy = ry
            r_val = 126
        else:
            # Calculate absolute coordinates
            abs_min_x = win_x0 + min_x
            abs_max_x = win_x0 + max_x
            abs_min_y = win_y0 + min_y
            abs_max_y = win_y0 + max_y
            
            cx = (abs_min_x + abs_max_x) // 2
            cy = (abs_min_y + abs_max_y) // 2
            
            w = abs_max_x - abs_min_x + 1
            h = abs_max_y - abs_min_y + 1
            r_val = max(w, h) // 2
            print(f"Detected circle for '{name}': center=({cx}, {cy}), detected size=({w}x{h}), radius={r_val}")
            
        detected_circles.append({
            "name": name,
            "cx": cx,
            "cy": cy,
            "r": r_val
        })

# Let's find the max radius to crop uniformly.
# The normal circle is 252x252, so radius is 126.
# Let's use a uniform crop radius of 136 (crop size 272x272 pixels).
# This gives a 10px padding on all sides around the 252px circles.
# This padding ensures that NO part of the outer circular border or anti-aliased pixels is cut off!
crop_r = 136
crop_size = crop_r * 2
print(f"\nUsing uniform crop size: {crop_size}x{crop_size} (radius {crop_r}px)")

for item in detected_circles:
    name = item["name"]
    cx, cy = item["cx"], item["cy"]
    
    crop_x0 = cx - crop_r
    crop_y0 = cy - crop_r
    crop_x1 = cx + crop_r
    crop_y1 = cy + crop_r
    
    # Ensure coordinates are within image boundaries.
    # If they go slightly out of bounds, Pillow crop will pad with transparent pixels since we crop from RGBA.
    icon_img = im.crop((crop_x0, crop_y0, crop_x1, crop_y1))
    
    icon_img.save(os.path.join(output_dir, f"{name}.png"))
    print(f"Saved uniform centered icon: {name}.png")

print("\nDone! All icons saved perfectly zentriert und ohne Abschnitte.")

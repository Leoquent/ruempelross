"""Apply shared social previews and icons while preserving each page's copy."""
from pathlib import Path
from html import escape, unescape
import re

ROOT = Path(__file__).resolve().parents[1] / 'site'
ORIGIN = 'https://www.ruempelross.de/'
IMAGE = ORIGIN + 'assets/og-ruempelross.jpg'

for file in ROOT.rglob('*.html'):
    text = file.read_text(encoding='utf-8')
    head, rest = text.split('</head>', 1)
    title = unescape(re.search(r'<title>(.*?)</title>', head, re.S)[1])
    match = re.search(r'<meta name="description" content="([^"]*)"', head)
    description = unescape(match[1]) if match else 'Kostenlose Anfrage für Ihre Entrümpelung bei RümpelRoss in Stuttgart und Region.'
    english = file.parent.name == 'en'
    prefix = '../' if english else ''
    path = file.relative_to(ROOT).as_posix()
    if path in ('index.html', 'anfrage.html'):
        path = ''
    elif path == 'en/index.html':
        path = 'en/'
    url = ORIGIN + path
    # Remove only metadata owned by this normalizer, not verification/hreflang/schema.
    head = re.sub(r'<meta\s+(?:property|name)="(?:og:[^"]*|twitter:[^"]*|theme-color)"[^>]*>\s*', '', head)
    head = re.sub(r'<link\s+rel="(?:canonical|icon|shortcut icon|apple-touch-icon)"[^>]*>\s*', '', head)
    alt = ('RümpelRoss – house and household clearance in Stuttgart and the surrounding region'
           if english else 'RümpelRoss – Entrümpelung und Haushaltsauflösung in Stuttgart und Region')
    tags = [f'<link rel="canonical" href="{url}">']
    for key, value in [('og:type','website'),('og:site_name','RümpelRoss'),('og:locale','en_GB' if english else 'de_DE'),
                       ('og:title',title),('og:description',description),('og:url',url),('og:image',IMAGE),
                       ('og:image:secure_url',IMAGE),('og:image:type','image/jpeg'),('og:image:width','1200'),
                       ('og:image:height','630'),('og:image:alt',alt)]:
        tags.append(f'<meta property="{key}" content="{escape(value, quote=True)}">')
    for key, value in [('twitter:card','summary_large_image'),('twitter:title',title),
                       ('twitter:description',description),('twitter:image',IMAGE),('twitter:image:alt',alt)]:
        tags.append(f'<meta name="{key}" content="{escape(value, quote=True)}">')
    tags += [f'<link rel="icon" href="{prefix}favicon.ico" sizes="16x16 32x32 48x48">',
             *[f'<link rel="icon" type="image/png" sizes="{n}x{n}" href="{prefix}assets/favicon-{n}.png">' for n in (16,32,48)],
             f'<link rel="apple-touch-icon" sizes="180x180" href="{prefix}assets/apple-touch-icon.png">',
             '<meta name="theme-color" content="#FFC400">']
    file.write_text(head.rstrip()+'\n'+ '\n'.join(tags)+'\n</head>'+rest, encoding='utf-8')
print('Normalized social metadata, canonical URLs and icons on all HTML pages.')

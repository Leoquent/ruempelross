"""Static integrity checks; no external requests or production writes."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1] / 'site'

class Page(HTMLParser):
    def __init__(self, file):
        super().__init__()
        self.ids, self.links, self.images = [], [], []
        self.h1 = 0
        self.description = ''
        self.text = file.read_text(encoding='utf-8')
        self.feed(self.text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'h1':
            self.h1 += 1
        if tag == 'img':
            self.images.append(attrs)
        if tag == 'meta' and attrs.get('name') == 'description':
            self.description = attrs.get('content', '')
        if tag in ('a', 'script', 'img', 'link'):
            ref = attrs.get('href') or attrs.get('src')
            if ref:
                self.links.append(ref)

pages = {p.resolve(): Page(p) for p in ROOT.rglob('*.html')}
for file, page in pages.items():
    assert len(page.ids) == len(set(page.ids)), (file, 'duplicate IDs')
    if file.name != 'anfrage.html':  # Existing redirect page.
        assert page.h1 == 1, (file, 'H1 count', page.h1)
        assert page.description and len(page.description) <= 155, (file, 'description length')
    assert all('alt' in img for img in page.images), (file, 'missing alt')
    for raw in re.findall(r'<script type="application/ld\+json">(.*?)</script>', page.text, re.S):
        json.loads(raw)
    for ref in page.links:
        url = urlsplit(ref)
        if url.scheme or url.netloc:
            continue
        target = (file.parent / unquote(url.path)).resolve() if url.path else file
        if target.is_dir():
            target /= 'index.html'
        assert target.exists(), (file, 'missing file', ref)
        if url.fragment and target in pages and url.fragment != 'anfrage':
            assert url.fragment in pages[target].ids, (file, 'missing anchor', ref)

for file in [ROOT / 'index.html', ROOT / 'en/index.html']:
    text = pages[file.resolve()].text
    assert text.count('class="result-range"') == 1
    assert 'showcase-project' not in text
    assert text.count('href="https://www.ardmediathek.de/') == 4
    assert text.count('class="service-link"') == 6
    assert '<iframe' not in text, 'External embeds must be gated by explicit interaction.'
    assert 'js/enhancements.js' in text

for name in ['agb.html', 'impressum.html', 'datenschutz.html']:
    text = pages[(ROOT / name).resolve()].text
    assert 'id="quizOverlay"' not in text
    assert 'js/quiz.js' not in text

sitemap = ET.parse(ROOT / 'sitemap.xml')
locations = [node.text for node in sitemap.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert len(locations) == len(set(locations)), 'Duplicate sitemap locations'
for url in locations:
    path = ROOT / urlsplit(url).path.lstrip('/')
    if path.is_dir():
        path /= 'index.html'
    assert path.exists(), ('Missing sitemap target', url)

print(f'PASS: {len(pages)} HTML pages; local links, anchors, H1, alt text, metadata, JSON-LD, sitemap and core UI structure.')

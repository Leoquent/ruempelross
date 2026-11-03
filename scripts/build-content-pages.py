"""Build the additional static service/area pages from approved site content.

Run from the repository root: python scripts/build-content-pages.py
Business identity and shared header/footer are reused from the existing site.
No branches, local projects, prices or testimonials are invented for area pages.
"""
from pathlib import Path
from html import escape
import json
import re

SITE = Path(__file__).resolve().parents[1] / 'site'
base = (SITE / 'haushaltsaufloesung-stuttgart.html').read_text(encoding='utf-8')
home = (SITE / 'index.html').read_text(encoding='utf-8')
header = re.search(r'<header.*?</header>', base, re.S).group()
header = re.sub(r'href="#([^"]+)"', r'href="index.html#\1"', header)
footer = base[base.index('<footer'):]
provider = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', base, re.S).group(1))['provider']
provider['url'] = 'https://www.ruempelross.de/'

AREAS = [
    ('stuttgart', 'Stuttgart', 'City', 'stuttgart',
     'Von der Wohnung in Vaihingen bis zum Keller in Bad Cannstatt: RümpelRoss räumt Wohnungen, Häuser und Nebenräume in ganz Stuttgart. Unser Familienbetrieb sitzt in der Liststraße 81. Sie sprechen direkt mit dem Team, das Ihren Auftrag plant.',
     'Wohnung räumen, Übergabe vorbereiten',
     'Bei einem Mieterwechsel zählt nicht nur der leere Raum. Vor der Räumung halten wir fest, welche Möbel, Einbauten und persönlichen Gegenstände bleiben. Falls anschließend Renovierungsarbeiten oder ein neuer Boden nötig sind, können Sie beides mit uns besprechen. So lassen sich Räumung und weitere Arbeiten aufeinander abstimmen.',
     'Was ist bei einer Wohnung ohne Aufzug wichtig?',
     'Nennen Sie uns die Etage und zeigen Sie bei der Besichtigung Treppenhaus und Zugang. Auch sperrige Möbel und die Entfernung zum Fahrzeug beeinflussen den Aufwand. Wir berücksichtigen diese Punkte im Angebot.'),
    ('landkreis-ludwigsburg', 'Landkreis Ludwigsburg', 'AdministrativeArea', 'ludwigsburg',
     'Wir übernehmen Entrümpelungen im gesamten Landkreis Ludwigsburg – beispielsweise in Ludwigsburg, Bietigheim-Bissingen, Kornwestheim und Vaihingen an der Enz. Ob einzelne Nebenräume oder ein vollständiger Haushalt: Den Umfang legen wir vorab gemeinsam fest.',
     'Ein ganzes Haus auflösen – mit klarer Abgrenzung',
     'Bei einer Haushaltsauflösung gehören oft Keller, Dachboden und Garage zum Auftrag. Gehen Sie bei der Besichtigung alle betroffenen Bereiche mit uns durch. Persönliche Unterlagen und Erinnerungsstücke werden vorab vom Räumgut abgegrenzt; verwertbare Gegenstände prüfen wir auf eine mögliche Wertanrechnung. So wissen Sie, welche Arbeiten das Festpreisangebot umfasst.',
     'Kann ich nur Keller und Garage räumen lassen?',
     'Ja. Sie müssen keinen kompletten Haushalt auflösen lassen. Teilen Sie uns mit, welche Räume betroffen sind und welche Dinge bleiben sollen. Daraus erstellen wir ein Angebot für den vereinbarten Umfang.'),
    ('landkreis-esslingen', 'Landkreis Esslingen', 'AdministrativeArea', 'esslingen',
     'RümpelRoss ist im gesamten Landkreis Esslingen für Sie unterwegs: unter anderem in Esslingen am Neckar, Nürtingen, Kirchheim unter Teck, Filderstadt und Leinfelden-Echterdingen. Wir kümmern uns um Wohnungsauflösungen, Haushaltsauflösungen und die Räumung einzelner Räume.',
     'Vor dem Umzug Platz schaffen',
     'Soll eine Wohnung vor dem Auszug geräumt werden, klären wir zuerst den Übergabetermin und den vereinbarten Zustand der Räume. Möbel, die mit umziehen, gehören nicht zum Räumgut. Kennzeichnen Sie diese vor dem Einsatz oder besprechen Sie mit uns, wie die Bereiche getrennt werden. Zusätzliche Renovierungsarbeiten vereinbaren wir ausdrücklich; sie sind nicht automatisch Teil einer besenreinen Übergabe.',
     'Was bedeutet besenreine Übergabe?',
     'Wir räumen die vereinbarten Gegenstände und übergeben die Flächen besenrein. Malerarbeiten, Bodenverlegung oder weitergehende Reinigung sind damit nicht automatisch eingeschlossen. Den gewünschten Umfang halten wir im Angebot fest.'),
    ('landkreis-boeblingen', 'Landkreis Böblingen', 'AdministrativeArea', 'boeblingen',
     'Von Böblingen und Sindelfingen über Leonberg bis Herrenberg: Wir fahren den gesamten Landkreis Böblingen an. Unser Team aus Stuttgart räumt Wohnungen, Häuser, Keller und Garagen und bespricht auf Wunsch auch die anschließende Renovierung.',
     'Nach der Räumung direkt weiterplanen',
     'Wenn eine Immobilie wieder vermietet oder selbst genutzt werden soll, ist Entrümpeln häufig nur der erste Schritt. Besprechen Sie bei der Besichtigung, ob Wände, Einbauten oder Bodenbeläge ebenfalls bearbeitet werden sollen. Unser Team umfasst Handwerksgesellen, Raumausstatter und Bodenleger. Wir klären gemeinsam, welche Arbeiten wir für Ihr Objekt übernehmen und in welcher Reihenfolge sie sinnvoll sind.',
     'Kann ich Räumung und Bodenverlegung gemeinsam anfragen?',
     'Ja. Nennen Sie beide Wünsche im ersten Gespräch. Wir prüfen den Zustand vor Ort und stimmen Leistungsumfang, Material und Termine mit Ihnen ab. Der Entrümpelungsrechner bildet zusätzliche Handwerksarbeiten nicht verbindlich ab.'),
    ('rems-murr-kreis', 'Rems-Murr-Kreis', 'AdministrativeArea', 'remsmurr',
     'Wir entrümpeln im gesamten Rems-Murr-Kreis, unter anderem in Waiblingen, Fellbach, Schorndorf, Backnang und Winnenden. Auch für Objekte in den übrigen Gemeinden des Kreises können Sie sich direkt an unser Stuttgarter Team wenden.',
     'Eine Räumung aus der Entfernung organisieren',
     'Wenn Sie nicht in der Nähe des Objekts wohnen, helfen genaue Angaben und erste Fotos bei der Vorbereitung. Wir besprechen mit Ihnen, wer Zugang zur Immobilie hat, wer Entscheidungen über den Hausrat trifft und wie die Übergabe organisiert wird. Bei einem Nachlass entscheiden Sie, welche Erinnerungsstücke und Unterlagen erhalten bleiben. Den verbindlichen Umfang klären wir persönlich.',
     'Kann eine bevollmächtigte Person die Besichtigung begleiten?',
     'Sprechen Sie das bei der Terminvereinbarung mit uns ab. Wichtig ist, dass die zuständige Person Zugang zum Objekt hat und verbindlich klären kann, was geräumt werden darf und was bleiben soll.'),
    ('landkreis-goeppingen', 'Landkreis Göppingen', 'AdministrativeArea', 'goeppingen',
     'RümpelRoss übernimmt Entrümpelungen im gesamten Landkreis Göppingen – etwa in Göppingen, Geislingen an der Steige, Eislingen/Fils, Ebersbach an der Fils und Uhingen. Den Einsatz planen wir von unserem Standort in Stuttgart aus.',
     'Umfang und Zugang vor der Anfahrt klären',
     'Gerade bei größeren Häusern lohnt sich eine vollständige Bestandsaufnahme: Welche Etagen, Nebenräume und Außenbereiche gehören dazu? Gibt es einen Aufzug und eine geeignete Möglichkeit zum Beladen? Fotos helfen bei der Vorbereitung, ersetzen aber nicht jede Prüfung vor Ort. Bei der kostenlosen Besichtigung klären wir den Aufwand und den Zeitrahmen, bevor Sie sich für ein Angebot entscheiden.',
     'Sind Anfahrt und zusätzliche Räume im Preis enthalten?',
     'Unser Festpreisangebot bezieht sich auf den gemeinsam vereinbarten Auftrag. Lassen Sie alle gewünschten Räume und Leistungen bei der Besichtigung aufnehmen. Zusätzliche Arbeiten außerhalb dieses Umfangs stimmen wir mit Ihnen ab.'),
]

SERVICES = [
    ('innenausbau-renovierung-stuttgart', 'Innenausbau & Renovierung in Stuttgart und Region',
     'Erst Platz schaffen. Dann Räume neu gestalten.', 'innenausbau-renovierung',
     'In Stuttgart und den umliegenden Landkreisen machen wir aus leeren Räumen wieder nutzbare Räume. RümpelRoss verbindet Entrümpelung mit Innenausbau und Renovierung: Unser Team umfasst ausgebildete Handwerksgesellen, Raumausstatter und Bodenleger. Gemeinsam besprechen wir, welche Arbeiten Ihr Objekt braucht.',
     [('Was wir für Ihr Objekt übernehmen', 'Zu unserem Angebot gehören Abriss- und Rückbauarbeiten, Malerarbeiten und Trockenbau. Welche Maßnahmen im konkreten Objekt möglich und sinnvoll sind, klären wir bei der Besichtigung. So beauftragen Sie einen klar beschriebenen Leistungsumfang und keine pauschale Komplettsanierung mit unklaren Grenzen.'),
      ('Entrümpelung und Renovierung gemeinsam planen', 'Bleiben alte Möbel, Einbauten oder Bodenbeläge zurück, stimmen wir Räumung und anschließende Arbeiten aufeinander ab. Zuerst legen Sie fest, was erhalten bleiben soll. Danach planen wir die vereinbarten Rückbau- und Renovierungsarbeiten. Die Reihenfolge, den Zeitrahmen und die Übergabe besprechen wir vor Beginn.'),
      ('Was bestimmt den Preis einer Renovierung?', 'Entscheidend sind unter anderem die betroffene Fläche, der Zustand der vorhandenen Oberflächen, der Arbeitsumfang und die gewünschten Materialien. Der Entrümpelungsrechner ist kein Renovierungsangebot. Für Handwerksarbeiten erhalten Sie eine auf Ihr Objekt abgestimmte Kalkulation.'),
      ('So bereiten Sie die Anfrage vor', 'Beschreiben Sie die Räume, den gewünschten Zustand nach den Arbeiten und Ihren Terminrahmen. Fotos der betroffenen Flächen helfen beim ersten Gespräch. Wenn Sie bereits wissen, welche Beläge oder Einbauten bleiben sollen, teilen Sie uns dies direkt mit.')],
     [('Renovieren Sie auch ohne vorherige Entrümpelung?', 'Sie können Innenausbau und Renovierung direkt bei uns anfragen. Wir besprechen, welche Arbeiten anstehen und ob wir Ihren Auftrag im gewünschten Zeitraum übernehmen können.'),
      ('Ist Renovieren in einer besenreinen Übergabe enthalten?', 'Nein. Eine besenreine Übergabe nach der Entrümpelung umfasst nicht automatisch Malerarbeiten, Trockenbau oder neue Bodenbeläge. Diese Leistungen vereinbaren wir gesondert.'),
      ('Kann ich gleichzeitig einen neuen Boden verlegen lassen?', 'Ja. Bodenverlegung gehört zu unserem Angebot. Wir stimmen den Untergrund, das gewünschte Material und die Reihenfolge der Arbeiten mit Ihnen ab.')]),
    ('bodenverlegung-stuttgart', 'Bodenverlegung in Stuttgart und Region',
     'Ein neuer Boden. Ein gutes Gefühl beim Heimkommen.', 'bodenverlegung',
     'Vinyl und Designbelag, Parkett, Laminat oder Teppich: RümpelRoss verlegt Bodenbeläge in Stuttgart und Umgebung. Unsere Bodenleger und Raumausstatter besprechen mit Ihnen, welcher Leistungsumfang zu Ihren Räumen passt – auch im Anschluss an eine Entrümpelung oder Renovierung.',
     [('Welche Bodenbeläge verlegen wir?', 'Wir bieten die Verlegung von Vinyl und Designbelägen, Parkett, Laminat und Teppich an. Im Gespräch klären wir Ihren Materialwunsch, die Nutzung der Räume und den vorhandenen Boden. Die konkrete Ausführung stimmen wir passend zum gewählten Produkt und zum Zustand vor Ort ab.'),
      ('Der vorhandene Untergrund gehört zur Planung', 'Ein neuer Belag beginnt nicht erst mit dem Verlegen. Wir prüfen vorab, welcher Boden vorhanden ist und welche Vorarbeiten vereinbart werden müssen. Auch Übergänge zu anderen Räumen, Türen und Sockelleisten gehören in die Abstimmung. So ist klar, was im Angebot enthalten ist.'),
      ('Alten Boden entfernen und Räume vorbereiten', 'Wenn alte Beläge entfernt oder Räume zunächst geräumt werden sollen, können Sie dies zusammen mit der Bodenverlegung anfragen. Wir planen die einzelnen Arbeitsschritte gemeinsam. Welche Möbel und Einbauten bleiben und welche Vorarbeiten übernommen werden, halten wir vor dem Einsatz fest.'),
      ('Was kostet die Bodenverlegung?', 'Fläche, Belag, Untergrund, Rückbau und ergänzende Arbeiten bestimmen den Aufwand. Deshalb nennen wir keinen pauschalen Preis, der nur die Quadratmeterzahl betrachtet. Nach Abstimmung der Materialien und Leistungen erstellen wir ein individuelles Angebot.')],
     [('Kann ich den Bodenbelag selbst bereitstellen?', 'Bitte besprechen Sie dies vor einem Kauf mit uns. Wir klären gemeinsam Material, Menge, Zubehör und die geplante Verlegung, damit Produkt und Auftrag zusammenpassen.'),
      ('Verlegen Sie auch nach einer Wohnungsauflösung?', 'Ja. Sie können Wohnungsauflösung, notwendige Renovierungsarbeiten und Bodenverlegung gemeinsam anfragen. Die Leistungen und Termine werden vorab aufeinander abgestimmt.'),
      ('Wie lange dauert die Verlegung?', 'Das hängt von Fläche, Material und notwendigen Vorarbeiten ab. Den Zeitrahmen und die mögliche Nutzung der Räume nach den Arbeiten besprechen wir für Ihr konkretes Projekt.')]),
]

def write_page(slug, title, desc, hero, intro, content, area='Stuttgart', area_type='City', faq=(), photo=True):
    filename = slug + '.html'
    url = 'https://www.ruempelross.de/' + filename
    head = base[:base.index('<body>')]
    head = re.sub(r'<script type="application/ld\+json">.*?</script>', '', head, flags=re.S)
    head = re.sub(r'<title>.*?</title>', '<title>' + escape(title) + '</title>', head)
    for attr, value in [('name="description"',desc),('property="og:title"',title),('property="og:description"',desc)]:
        head = re.sub(r'(<meta '+attr+r' content=")[^"]*', lambda m:m[1]+escape(value,quote=True), head)
    head = head.replace('haushaltsaufloesung-stuttgart.html', filename)
    schemas = [{'@context':'https://schema.org','@type':'Service','name':hero,'provider':provider,'areaServed':([{'@type':t,'name':n} for _,n,t,*_ in AREAS]+[{'@type':'City','name':n} for n in ['Tübingen','Reutlingen','Heilbronn']] if slug in [x[0] for x in SERVICES] else {'@type':area_type,'name':area})},
               {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Startseite','item':'https://www.ruempelross.de/'},{'@type':'ListItem','position':2,'name':hero,'item':url}]}]
    if faq:
        schemas.append({'@context':'https://schema.org','@type':'FAQPage','mainEntity':[{'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}} for q,a in faq]})
    head=head.replace('</head>','<link rel="stylesheet" href="css/refinements.css?v=20261103-5">\n'+''.join('<script type="application/ld+json">\n'+json.dumps(s,ensure_ascii=False,indent=2)+'\n</script>\n' for s in schemas)+'</head>')
    photo_html='<img class="content-hero-photo" src="assets/team/team-im-einsatz.webp" alt="Mitarbeiter von RümpelRoss vor dem Firmenfahrzeug" width="960" height="720">' if photo else ''
    body=f'''<body>
{header}
<main>
<section class="page-hero">
  <div class="container content-hero-grid">
    <div>
      <nav class="breadcrumbs" aria-label="Brotkrümelnavigation"><a href="index.html">Startseite</a> / {escape(hero)}</nav>
      <span class="kicker">RümpelRoss · Familienbetrieb aus Stuttgart</span>
      <h1>{escape(hero)}</h1>
      <p class="lead">{escape(intro)}</p>
      <a class="btn btn-primary" href="tel:+4971123178489">Vorhaben besprechen · 0711 23178489</a>
    </div>
    {photo_html}
  </div>
</section>
{content}
'''
    if faq:
        body+='<section class="sec-alt"><div class="container local-copy"><span class="kicker">Gut zu wissen</span><h2>Häufige Fragen</h2>\n'
        for q,a in faq: body+='<details class="content-faq"><summary>'+escape(q)+'</summary><p>'+escape(a)+'</p></details>\n'
        body+='</div></section>\n'
    body+='''<section class="sec-dark"><div class="container local-copy"><span class="kicker">Persönlich statt kompliziert</span><h2>Was dürfen wir für Sie anpacken?</h2><p>Schildern Sie uns Ihr Vorhaben. Wir besprechen Umfang und Wunschtermin und vereinbaren bei Bedarf eine kostenlose Besichtigung.</p><a class="btn btn-primary" href="tel:+4971123178489">0711 23178489 anrufen</a> <a class="btn btn-outline-light" href="mailto:info@ruempelross.de">E-Mail schreiben</a><p class="content-contact-note">Für Entrümpelungen: <a href="index.html#anfrage">Ersteinschätzung im Preisrechner anfragen →</a></p></div></section>
</main>
'''
    (SITE/filename).write_text(head+body+footer,encoding='utf-8')

service_links='''<div class="content-link-grid">
<a href="haushaltsaufloesung-stuttgart.html"><img class="content-service-icon" src="assets/icons/haushaltsaufloesung.png" alt="" width="272" height="272" loading="lazy" decoding="async"><strong>Haushaltsauflösung</strong><span>Ein gesamter Haushalt – mit Zeit für persönliche Entscheidungen. →</span></a>
<a href="wohnungsaufloesung-stuttgart.html"><img class="content-service-icon" src="assets/icons/wohnungsaufloesung.png" alt="" width="272" height="272" loading="lazy" decoding="async"><strong>Wohnungsauflösung</strong><span>Räumen vor Auszug, Neuvermietung oder Verkauf. →</span></a>
<a href="keller-entruempelung-stuttgart.html"><img class="content-service-icon" src="assets/icons/entruempelung.png" alt="" width="272" height="272" loading="lazy" decoding="async"><strong>Keller, Dachboden &amp; Garage</strong><span>Auch einzelne Räume bekommen wieder Platz. →</span></a>
<a href="messie-entruempelung-stuttgart.html"><img class="content-service-icon" src="assets/icons/messie-haertefall.png" alt="" width="272" height="272" loading="lazy" decoding="async"><strong>Messie-Entrümpelung</strong><span>Diskrete Unterstützung bei belastenden Wohnsituationen. →</span></a>
<a href="innenausbau-renovierung-stuttgart.html"><img class="content-service-icon" src="assets/icons/innenausbau-renovierung.png" alt="" width="272" height="272" loading="lazy" decoding="async"><strong>Innenausbau &amp; Renovierung</strong><span>Die nächsten Schritte nach der Räumung mitplanen. →</span></a>
<a href="bodenverlegung-stuttgart.html"><img class="content-service-icon" src="assets/icons/bodenverlegung.png" alt="" width="272" height="272" loading="lazy" decoding="async"><strong>Bodenverlegung</strong><span>Vinyl, Parkett, Laminat und Teppich. →</span></a>
</div>'''

for slug,area,typ,panel,intro,sub,detail,question,answer in AREAS:
    towns=re.search(r'id="ort-panel-'+panel+r'".*?<div class="ort-panel-inner">(.*?)</div>',home,re.S).group(1)
    towns=re.sub('<[^>]*>','',towns).strip().rstrip('.')
    # Read the original place list, before generated links are inserted below.
    towns=towns.split('Mehr zur Entrümpelung')[0].strip().rstrip('.')
    hero='Entrümpelung '+('im ' if typ=='AdministrativeArea' else 'in ')+area
    content=f'''<section><div class="container local-copy"><span class="kicker">Ihr Auftrag, klar geplant</span><h2>{escape(sub)}</h2><p>{escape(detail)}</p>
<h2>{'In allen Stuttgarter Stadtteilen' if typ=='City' else 'Im gesamten '+escape(area)+' für Sie da'}</h2>
<p>{'Dazu gehören:' if typ=='City' else 'Zu unserem Einsatzgebiet gehören unter anderem diese Städte und Gemeinden:'}</p><p class="area-towns">{escape(towns)}.</p>
<p>Unser Betrieb sitzt in Stuttgart. Wir fahren Ihr Objekt nach Terminvereinbarung an; eine separate Niederlassung vor Ort betreiben wir nicht.</p>
<h2>Wie läuft die Entrümpelung ab?</h2><ol class="content-steps"><li><strong>Objekt und Wunschtermin nennen.</strong> Teilen Sie uns Adresse, Räume und ungefähren Füllgrad mit. Erste Fotos können bei der Vorbereitung helfen.</li><li><strong>Kostenlos besichtigen und Angebot erhalten.</strong> Wir prüfen Umfang und Zugang und vereinbaren einen verbindlichen Festpreis für die besprochenen Arbeiten.</li><li><strong>Räumen und besenrein übergeben.</strong> Unser Team trägt, sortiert und entsorgt. Verwertbare Gegenstände werden auf eine mögliche Wertanrechnung geprüft.</li></ol>
<h2>Was kostet die Entrümpelung?</h2><p>Fläche allein genügt nicht für einen verlässlichen Preis. Füllgrad, Zugang, Entsorgungsaufwand und der vereinbarte Leistungsumfang zählen ebenfalls. Unser <a href="index.html#anfrage">Preisrechner</a> gibt nach Ihrer Anfrage eine unverbindliche Basispreis-Einschätzung. Verbindlich ist das Angebot nach der kostenlosen Besichtigung.</p>
</div></section><section id="leistungen" class="sec-alt"><div class="container"><span class="kicker">Passend zu Ihrem Vorhaben</span><h2>Unsere Leistungen {'im' if typ=='AdministrativeArea' else 'in'} {escape(area)}</h2>{service_links}</div></section>'''
    faq=[(question,answer),('Wie schnell ist ein Termin möglich?','Nennen Sie uns Ihren Wunschtermin bereits bei der Anfrage. Die Verfügbarkeit stimmen wir persönlich mit Ihnen ab. Die meisten Aufträge erledigen wir innerhalb eines Arbeitstages; große oder besonders aufwendige Objekte können länger dauern.'),('Was soll vor der Räumung erhalten bleiben?','Entscheiden Sie vor dem Einsatz, welche Erinnerungsstücke, Unterlagen, Möbel und Einbauten bleiben. Bei der Besichtigung grenzen wir den Auftrag gemeinsam ab. Ohne diese Abstimmung wird nicht pauschal alles als Räumgut behandelt.')]
    title='Entrümpelung '+area+' | RümpelRoss'
    desc='Entrümpelung '+('im ' if typ=='AdministrativeArea' else 'in ')+area+': kostenlose Besichtigung, Festpreis und besenreine Übergabe. Familienbetrieb aus Stuttgart.'
    write_page('entruempelung-'+slug,title,desc,hero,intro,content,area,typ,faq)

for slug,hero,sub,icon,intro,sections,faq in SERVICES:
    content='<section><div class="container local-copy"><span class="kicker">Handwerk aus einer Hand</span><h2>'+escape(sub)+'</h2>'
    for heading,text in sections:content+='<h2>'+escape(heading)+'</h2><p>'+escape(text)+'</p>\n'
    other='bodenverlegung-stuttgart.html' if icon=='innenausbau-renovierung' else 'innenausbau-renovierung-stuttgart.html'
    other_label='Bodenverlegung' if icon=='innenausbau-renovierung' else 'Innenausbau und Renovierung'
    content+='<p>Passend dazu: <a href="'+other+'">'+other_label+'</a> und <a href="wohnungsaufloesung-stuttgart.html">Wohnungsauflösung</a>.</p><h2>Stuttgart und Umgebung</h2><p>Unser Betrieb sitzt in Stuttgart – unser Angebot gilt auch in der Region. Wir übernehmen Projekte in den Landkreisen Ludwigsburg, Esslingen, Böblingen und Göppingen sowie im Rems-Murr-Kreis. Auch für Tübingen, Reutlingen und Heilbronn können Sie bei uns anfragen. Umfang, Anfahrt und Termin stimmen wir für Ihr Objekt persönlich ab. <a href="einsatzgebiete.html">Unser Einsatzgebiet ansehen →</a></p></div></section>'
    desc=('Innenausbau und Renovierung in Stuttgart und Region: Rückbau, Malerarbeiten und Trockenbau. Auf Wunsch mit Entrümpelung aus einer Hand.' if icon=='innenausbau-renovierung' else 'Bodenverlegung in Stuttgart und Region: Vinyl, Parkett, Laminat und Teppich. RümpelRoss plant Verlegung und Vorarbeiten mit Ihnen.')
    write_page(slug,('Innenausbau & Renovierung | Stuttgart & Region' if icon=='innenausbau-renovierung' else 'Bodenverlegung | Stuttgart & Region')+' | RümpelRoss',desc,hero,intro,content,faq=faq)

area_links=[('entruempelung-'+slug+'.html',area) for slug,area,*_ in AREAS]+[('entruempelung-'+slug+'.html',city) for slug,city in [('tuebingen','Tübingen'),('reutlingen','Reutlingen'),('heilbronn','Heilbronn')]]
content='<section><div class="container"><h2>Hier sind wir für Sie unterwegs</h2><div class="content-link-grid">'+''.join('<a href="'+url+'"><strong>'+escape(label)+'</strong><span>Orte, Leistungen und Ablauf ansehen →</span></a>' for url,label in area_links)+'</div><p class="content-contact-note">Die genannten Landkreise gehören vollständig zu unserem Einsatzgebiet. Für Tübingen, Reutlingen und Heilbronn beziehen sich die Angaben auf die Städte. Fragen Sie uns nach Ihrem konkreten Ort und Wunschtermin.</p></div></section>'
write_page('einsatzgebiete','Entrümpelung: Stuttgart & Einsatzgebiete | RümpelRoss','RümpelRoss entrümpelt in Stuttgart und den umliegenden Landkreisen. Einsatzgebiete, größere Orte und Ablauf auf einen Blick.','Unser Einsatzgebiet rund um Stuttgart','Unser Familienbetrieb sitzt in Stuttgart. Wir fahren die aufgeführten Landkreise sowie Tübingen, Reutlingen und Heilbronn an. Für Ihren Auftrag klären wir Umfang und Termin persönlich.',content,photo=True)

# Use real, crawlable links on the existing cards and area panels.
targets=['entruempelung-stuttgart.html','haushaltsaufloesung-stuttgart.html','wohnungsaufloesung-stuttgart.html','messie-entruempelung-stuttgart.html','innenausbau-renovierung-stuttgart.html','bodenverlegung-stuttgart.html']
for file,en in [(SITE/'index.html',False),(SITE/'en/index.html',True)]:
    text=file.read_text(encoding='utf-8');prefix='../' if en else ''
    start=text.index('<section id="leistungen"');end=text.index('</section>',start)
    part=text[start:end];count=[0]
    def card(match):
        i=count[0];count[0]+=1
        if i>=6:return match[0]
        card_html=match[0]
        if 'service-link' in card_html:return card_html
        label=('Service details (German)' if en else 'Leistung ansehen')
        card_html=card_html.replace('class="card"','class="card service-card"')
        title=re.search('<h3>(.*?)</h3>',card_html,re.S).group(1)
        return card_html.replace('</div>','<a class="service-link" href="'+prefix+targets[i]+'" aria-label="'+re.sub('<[^>]+>','',title)+' – '+label+'">'+label+' <span aria-hidden="true">→</span></a></div>')
    part=re.sub(r'<div class="card(?: service-card)?" data-reveal>.*?</div>',card,part,flags=re.S);text=text[:start]+part+text[end:]
    for slug,area,typ,panel,*_ in AREAS:
        pattern=r'(id="ort-panel-'+panel+r'".*?<div class="ort-panel-inner">)(.*?)(</div>)'
        label='Clearance details (German)' if en else 'Mehr zur Entrümpelung '+('im ' if typ=='AdministrativeArea' else 'in ')+area
        def link(m):
            if 'area-detail-link' in m[2]:return m[0]
            return m[1]+m[2]+'<a class="area-detail-link" href="'+prefix+'entruempelung-'+slug+'.html">'+label+' →</a>'+m[3]
        text=re.sub(pattern,link,text,flags=re.S)
    file.write_text(text,encoding='utf-8')

for file in SITE.rglob('*.html'):
    text=file.read_text(encoding='utf-8');prefix='../' if file.parent.name=='en' else ''
    text=text.replace('<li><a href="'+prefix+'index.html#leistungen">Innenausbau &amp; Bodenverlegung</a></li>', '<li><a href="'+prefix+'innenausbau-renovierung-stuttgart.html">Innenausbau &amp; Renovierung</a></li><li><a href="'+prefix+'bodenverlegung-stuttgart.html">Bodenverlegung</a></li>')
    text=text.replace('<li><a href="#leistungen">Innenausbau &amp; Bodenverlegung</a></li>', '<li><a href="innenausbau-renovierung-stuttgart.html">Innenausbau &amp; Renovierung</a></li><li><a href="bodenverlegung-stuttgart.html">Bodenverlegung</a></li>')
    if '<footer' in text:
        idx=text.index('<footer');before,foot=text[:idx],text[idx:]
        if 'einsatzgebiete.html' not in foot:
            foot=foot.replace('<h4>Quicklinks</h4>','<h4>Quicklinks</h4>').replace('<h4>Quicklinks</h4>\n        <ul>','<h4>Quicklinks</h4>\n        <ul>\n          <li><a href="'+prefix+'einsatzgebiete.html">'+('Service areas (German)' if prefix else 'Einsatzgebiete')+'</a></li>')
        text=before+foot
    file.write_text(text,encoding='utf-8')

new_slugs=['entruempelung-'+a[0] for a in AREAS]+[s[0] for s in SERVICES]+['einsatzgebiete']
file=SITE/'sitemap.xml';text=file.read_text(encoding='utf-8')
for slug in new_slugs:
    if '/'+slug+'.html' not in text:text=text.replace('</urlset>','  <url><loc>https://www.ruempelross.de/'+slug+'.html</loc><lastmod>2026-11-03</lastmod></url>\n</urlset>')
file.write_text(text,encoding='utf-8')
print('Built',len(new_slugs),'pages; linked services and regions; updated sitemap.')

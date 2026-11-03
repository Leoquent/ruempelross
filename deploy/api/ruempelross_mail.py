"""RümpelRoss mail presentation; all visitor-controlled values are escaped."""
from html import escape


def ruempelross_mail_html(payload, meta, cfg):
    def value(key):
        val = payload.get(key)
        if isinstance(val, list):
            val = ', '.join(str(item) for item in val)
        return escape(str(val)) if val not in (None, '', []) else 'Nicht angegeben'

    def block(title, fields):
        rows = ''.join('<tr><th align="left" valign="top" style="padding:10px 12px;border-bottom:1px solid #e7e7e7;width:36%;font-weight:400;color:#626262">'+escape(label)+'</th><td style="padding:10px 12px;border-bottom:1px solid #e7e7e7;color:#141414;overflow-wrap:anywhere">'+value(key)+'</td></tr>' for label, key in fields)
        return '<h2 style="font-size:17px;margin:26px 0 10px">'+title+'</h2><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fafafa;font-size:14px">'+rows+'</table>'

    parts = [block('Kontakt', [('Name','name'),('Telefon','telefon'),('E-Mail','email')]),
             block('Objekt und Umfang', [('Objekt','objekt'),('Größe','groesse'),('Füllgrad','fuellgrad'),('Zugang','zugang'),('Postleitzahl','plz')]),
             block('Termin und Zusatzleistungen', [('Wunschtermin','termin'),('Zusatzleistungen','extras')]),
             block('Unverbindliche Preisorientierung', [('Im Quiz angezeigt','einschaetzung')])]
    if not payload.get('objekt'):
        parts.append(block('Zusammenfassung', [('Anfrage','Zusammenfassung')]))
    test = '<p style="padding:12px;background:#fff1c2;border:1px solid #dba900"><strong>TECHNISCHER TEST – ausschließlich fiktive Angaben. Kein Kundenauftrag.</strong></p>' if payload.get('_test_preview') else ''
    return ('<!doctype html><html lang="de"><meta charset="utf-8"><body style="margin:0;background:#f2f2f0;font-family:Arial,Helvetica,sans-serif;color:#141414">'
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">'
            '<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:white"><tr><td style="padding:24px 28px;background:#ffc400">'
            '<strong style="font-size:25px">RÜMPELROSS</strong><br><span style="font-size:14px">Neue Anfrage über die Website</span></td></tr>'
            '<tr><td style="padding:8px 28px 28px">'+test+''.join(parts)+
            '<p style="font-size:12px;line-height:1.6;color:#666;margin-top:24px">Die Preisorientierung ist unverbindlich. Bitte besprechen Sie die Details und den verbindlichen Festpreis persönlich.<br>'
            'Quelle: ruempelross.de · Eingang (UTC): '+escape(str(meta.get('empfangen','')))+'<br>'
            'Eine Antwort geht an die im Formular angegebene E-Mail-Adresse. Fehlt diese, nutzen Sie bitte die Telefonnummer.</p>'
            '</td></tr></table></td></tr></table></body></html>')

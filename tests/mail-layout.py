import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('mail_layout', Path(__file__).resolve().parents[1] / 'deploy/api/ruempelross_mail.py')
mail = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mail)


class MailLayoutTests(unittest.TestCase):
    def test_visitor_content_is_escaped(self):
        html = mail.ruempelross_mail_html({'name':'<script>alert(1)</script>', 'extras':['<img src=x onerror=alert(1)>']}, {'empfangen':'<img>'}, {})
        self.assertNotIn('<script>', html)
        self.assertNotIn('<img', html)
        self.assertIn('&lt;script&gt;', html)

    def test_blocks_and_optional_contact(self):
        html = mail.ruempelross_mail_html({'objekt':'Wohnung', 'einschaetzung':'1.480 € – 1.870 €'}, {}, {})
        for title in ('Kontakt', 'Objekt und Umfang', 'Termin und Zusatzleistungen', 'Unverbindliche Preisorientierung'):
            self.assertIn(title, html)
        self.assertIn('Nicht angegeben', html)
        self.assertIn('1.480 € – 1.870 €', html)
        self.assertNotIn('TECHNISCHER TEST', html)

    def test_older_browser_payload_remains_visible(self):
        html = mail.ruempelross_mail_html({'Zusammenfassung':'Altversion: Keller, Stuttgart', '_test_preview':True}, {}, {})
        self.assertIn('Altversion: Keller, Stuttgart', html)
        self.assertIn('TECHNISCHER TEST', html)


if __name__ == '__main__':
    unittest.main()

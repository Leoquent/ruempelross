"""No SMTP or real customer records: verifies policy with synthetic metadata."""
import importlib.util
import sqlite3
import tempfile
from contextlib import closing
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('retention', Path(__file__).parents[1] / 'deploy/api/delivery_retention.py')
retention = importlib.util.module_from_spec(spec)
spec.loader.exec_module(retention)


class RetentionTest(unittest.TestCase):
    def test_contact_records_are_minimal_and_expire(self):
        with tempfile.TemporaryDirectory() as directory:
            retention.DATA = Path(directory)
            for tenant in ('lqnt', 'gebruederross', 'moll', 'ruempelross', 'future_customer'):
                for state in ('sent', 'unconfirmed'):
                    retention.record_delivery(tenant, state)
            with closing(sqlite3.connect(retention.DATA / 'delivery-receipts.sqlite3')) as db:
                self.assertEqual([r[1] for r in db.execute('PRAGMA table_info(deliveries)')], ['id', 'tenant', 'state', 'received'])
                self.assertEqual(db.execute('SELECT COUNT(*) FROM deliveries').fetchone()[0], 10)
                db.execute("INSERT INTO deliveries VALUES ('expired','moll','sent',datetime('now','-31 days'))")
                db.execute("INSERT INTO deliveries VALUES ('boundary','moll','sent',datetime('now','-30 days'))")
                db.execute("INSERT INTO deliveries VALUES ('recent','moll','sent',datetime('now','-29 days'))")
                db.commit()
            self.assertEqual(retention.purge(), 2)
            self.assertEqual(retention.purge(), 0)
            self.assertEqual([p.name for p in retention.DATA.iterdir()], ['delivery-receipts.sqlite3'])

    def test_existing_moll_receipts_expire_without_losing_recent_idempotency(self):
        with tempfile.TemporaryDirectory() as directory:
            retention.DATA = Path(directory)
            with closing(sqlite3.connect(retention.DATA / 'moll-form-receipts.sqlite3')) as db:
                db.execute('CREATE TABLE receipts (id TEXT PRIMARY KEY, digest TEXT, state TEXT, received TEXT)')
                db.execute("INSERT INTO receipts VALUES ('old','synthetic-hash','sent',datetime('now','-31 days'))")
                db.execute("INSERT INTO receipts VALUES ('current','synthetic-hash','pending',datetime('now'))")
                db.commit()
            self.assertEqual(retention.purge(), 1)
            with closing(sqlite3.connect(retention.DATA / 'moll-form-receipts.sqlite3')) as db:
                self.assertEqual(db.execute('SELECT id,state FROM receipts').fetchall(), [('current', 'pending')])


if __name__ == '__main__':
    unittest.main()


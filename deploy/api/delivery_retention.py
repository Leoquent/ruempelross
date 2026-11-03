"""Shared API policy: metadata only, 30-day retention, no message copies.

Installed beside server.py; invoked every minute and before serving requests.
Host-level snapshots have a separate lifecycle. On restore, purge before restart.
"""
import os
import sqlite3
import uuid
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path

DATA = Path(os.environ.get('DATA_FILE', '/data/leads.jsonl')).parent


def record_delivery(tenant, state):
    # No payload, IP, address, subject or SMTP error is accepted by this API.
    if state not in ('sent', 'unconfirmed'):
        raise ValueError('Invalid delivery state')
    path = DATA / 'delivery-receipts.sqlite3'
    with closing(sqlite3.connect(path, timeout=30)) as db:
        db.execute('PRAGMA secure_delete=ON')
        db.execute('CREATE TABLE IF NOT EXISTS deliveries (id TEXT PRIMARY KEY, tenant TEXT, state TEXT, received TEXT)')
        db.execute("DELETE FROM deliveries WHERE julianday(received) <= julianday('now', '-30 days')")
        db.execute('INSERT INTO deliveries VALUES (?,?,?,?)',
                   (str(uuid.uuid4()), tenant, state, datetime.now(timezone.utc).isoformat()))
        db.commit()
    path.chmod(0o600)


def purge():
    removed = 0
    for filename, table in [('delivery-receipts.sqlite3', 'deliveries'),
                            ('moll-form-receipts.sqlite3', 'receipts')]:
        path = DATA / filename
        if not path.exists():
            continue
        with closing(sqlite3.connect(path, timeout=30)) as db:
            db.execute('PRAGMA secure_delete=ON')
            exists = db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (table,)).fetchone()
            if exists:
                removed += db.execute(f"DELETE FROM {table} WHERE julianday(received) <= julianday('now', '-30 days')").rowcount
                db.commit()
        path.chmod(0o600)
    return removed


if __name__ == '__main__':
    purge()

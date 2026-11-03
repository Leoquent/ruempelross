"""Authenticated, single-purpose HTTPS deployment trigger behind Traefik."""
from http.server import BaseHTTPRequestHandler, HTTPServer
import hmac
import json
import os
import subprocess

TOKEN = os.environ['DEPLOY_TOKEN']
REPO = '/docker/hermes-agent-yasb/data/clients/ruempelross/RRwebsite'


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != '/__deploy/ruempelross':
            self.send_error(404)
            return
        if not hmac.compare_digest(self.headers.get('Authorization', ''), 'Bearer '+TOKEN):
            self.send_error(403)
            return
        try:
            subprocess.run(['/bin/sh', '/app/sync-github.sh'], check=True, timeout=90)
            commit = subprocess.check_output(['git', '-C', REPO, 'rev-parse', 'HEAD'], text=True).strip()
            body = json.dumps({'deployed': commit}).encode()
            self.send_response(200)
        except (subprocess.SubprocessError, OSError):
            body = b'{"error":"Deployment failed; check server logs"}'
            self.send_response(500)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


# Serial handler prevents overlapping git updates; request data is never executed.
HTTPServer(('0.0.0.0', 8080), Handler).serve_forever()

#!/usr/bin/env python3
"""One-time DNS-gated ACME activation; changes only the RümpelRoss service.

Installed with a one-minute systemd timer. Stops the timer after verifying both
certificates and the canonical redirect. Never prints certificate private keys.
"""
import ipaddress
import json
from pathlib import Path
import subprocess
import time

BASE = Path('/docker/ruempelross')
CONFIG = BASE / 'docker-compose.yml'
STATE = BASE / 'domain-activation.json'
DOMAINS = ('ruempelross.de', 'www.ruempelross.de')
IP = '187.124.181.132'
RESOLVER_LABEL = '      - "traefik.http.routers.ruempelross-domain.tls.certresolver=letsencrypt"'


def run(args, **kwargs):
    return subprocess.run(args, check=True, capture_output=True, text=True, timeout=40, **kwargs).stdout


def addresses(domain, record, resolver):
    output = run(['dig', '@'+resolver, '+short', '+time=3', '+tries=1', domain, record])
    found = set()
    for line in output.splitlines():
        try:
            found.add(str(ipaddress.ip_address(line.strip())))
        except ValueError:
            pass  # A CNAME target is not an address.
    return found


def dns_ready():
    for resolver in ('1.1.1.1', '8.8.8.8'):
        for domain in DOMAINS:
            if addresses(domain, 'A', resolver) != {IP}:
                return False
            if addresses(domain, 'AAAA', resolver):
                return False  # IPv6 routing has not been commissioned/verified.
    return True


def save(state):
    temp = STATE.with_suffix('.tmp')
    temp.write_text(json.dumps(state, indent=2)+'\n')
    temp.chmod(0o600)
    temp.replace(STATE)


def main():
    state = json.loads(STATE.read_text()) if STATE.exists() else {}
    if state.get('status') == 'verified':
        run(['systemctl', 'disable', '--now', 'ruempelross-domain-activation.timer'])
        return
    if not dns_ready():
        print('Waiting for both public DNS resolvers to return the VPS IPv4 and no IPv6.')
        return
    config = CONFIG.read_text()
    if RESOLVER_LABEL not in config:
        marker = '      - "traefik.http.routers.ruempelross-domain.tls=true"'
        if config.count(marker) != 1:
            raise RuntimeError('Unexpected routing configuration; refusing to alter it.')
        candidate = CONFIG.with_name('docker-compose.acme-next.yml')
        candidate.write_text(config.replace(marker, marker+'\n'+RESOLVER_LABEL))
        run(['docker', 'compose', '-p', 'ruempelross', '-f', str(candidate), 'config', '-q'])
        CONFIG.with_name('docker-compose.before-acme.yml').write_text(config)
        candidate.replace(CONFIG)
        state = {'status':'activating', 'started':time.time()}
        save(state)
    if state.get('status') == 'activating':
        run(['docker', 'compose', '-p', 'ruempelross', '-f', str(CONFIG), 'up', '-d', '--no-deps', 'ruempelross-web'])
        state['status'] = 'awaiting_certificate'
        save(state)
    try:
        run(['curl','--fail','--silent','--show-error','--max-time','15',
             '--resolve',f'www.ruempelross.de:443:{IP}',
             'https://www.ruempelross.de/assets/og-ruempelross.jpg','--output','/dev/null'])
        headers = run(['curl','--silent','--show-error','--max-time','15',
                       '--resolve',f'ruempelross.de:443:{IP}',
                       'https://ruempelross.de/','--dump-header','-','--output','/dev/null'])
        if 'location: https://www.ruempelross.de/' not in headers.lower():
            raise RuntimeError('Canonical redirect not confirmed.')
    except (subprocess.CalledProcessError, RuntimeError):
        print('DNS ready; waiting for valid certificates and canonical redirect.')
        return
    state.update(status='verified', verified_at=time.time())
    save(state)
    run(['systemctl','disable','--now','ruempelross-domain-activation.timer'])
    print('HTTPS verified for both domains; www redirect verified; one-time timer disabled.')


if __name__ == '__main__':
    main()

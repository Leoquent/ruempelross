"""Check that ACME activation waits for complete DNS cutover."""
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('activation', Path(__file__).resolve().parents[1] / 'deploy/vps/activate-domain.py')
activation = importlib.util.module_from_spec(spec)
spec.loader.exec_module(activation)


class DomainActivationTests(unittest.TestCase):
    def test_old_dns_never_starts_deployment(self):
        with patch.object(activation, 'addresses', return_value={'185.230.63.107'}), patch.object(activation, 'run') as run:
            activation.main()
            run.assert_not_called()

    def test_partial_propagation_is_not_ready(self):
        def addresses(domain, record, resolver):
            return set() if record == 'AAAA' else {activation.IP if resolver == '1.1.1.1' else '185.230.63.107'}
        with patch.object(activation, 'addresses', side_effect=addresses):
            self.assertFalse(activation.dns_ready())

    def test_stale_ipv6_prevents_activation(self):
        with patch.object(activation, 'addresses', side_effect=lambda d, r, s: {activation.IP} if r == 'A' else {'2001:db8::1'}):
            self.assertFalse(activation.dns_ready())

    def test_both_domains_on_both_resolvers_are_ready(self):
        with patch.object(activation, 'addresses', side_effect=lambda d, r, s: {activation.IP} if r == 'A' else set()) as addresses:
            self.assertTrue(activation.dns_ready())
            self.assertEqual(addresses.call_count, 8)


if __name__ == '__main__':
    unittest.main()

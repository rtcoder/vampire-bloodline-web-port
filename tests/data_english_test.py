import importlib.util
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def verifier():
    path=ROOT/'tools/verify_english.py'
    assert path.exists(),'missing independent English verifier'
    spec=importlib.util.spec_from_file_location('verify_english',path)
    mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);return mod

class EnglishSourceTest(unittest.TestCase):
    def test_class_constant_pool_body_boundary(self):
        # UTF8 entry followed by integer; double occupies two CP indices.
        import struct
        raw=b'\xca\xfe\xba\xbe'+struct.pack('>HHH',0,45,5)+b'\x01\x00\x02hi'+b'\x03\x00\x00\x00\x07'+b'\x06'+bytes(8)+b'BODY'
        result=verifier().parse_class(raw)
        self.assertEqual(result['body'],b'BODY')
        self.assertEqual(result['pool'][1],{'tag':1,'value':'hi'})
        self.assertIsNone(result['pool'][4])

    def test_pinned_comparison(self):
        result=verifier().verify()
        self.assertEqual(result['status'],'passed',result.get('errors'))
        self.assertEqual(result['changedEntries'],['Strings.class','background.png','mainCanvas.class'])
        self.assertEqual(len(result['mainCanvas']['utf8Changes']),18)
        self.assertTrue(result['mainCanvas']['postConstantPoolEqual'])

if __name__=='__main__':unittest.main()

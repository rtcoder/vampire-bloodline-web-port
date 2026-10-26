import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def decoder():
    path = ROOT / 'tools/decode_levels.py'
    assert path.exists(), 'missing source map decoder'
    spec = importlib.util.spec_from_file_location('decode_levels', path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.decode_map

class SourceMapDecoderTest(unittest.TestCase):
    def test_signed_descriptors_unsigned_column_major_cells(self):
        # Byte 128 must stay -128 in descriptor, but stay 128 in a cell.
        records = [[0, 0, 0]] * 129
        records[128] = [255, 128, 254]
        # Real files cannot encode >127 descriptor records, so exercise unsigned
        # cells with valid highest index 126 and reject 128 separately.
        records = records[:127]
        records[126] = [255, 128, 254]
        raw = bytes([3, 127]) + b''.join(bytes(r) for r in records) + bytes([126] + [0]*15 + [1] + [0]*15)
        result = decoder()(raw, 'm11')
        self.assertEqual(result['tileset'], 4)
        self.assertEqual(result['width'], 2)
        self.assertEqual(result['descriptors'][126], [-1, -128, -2])
        self.assertEqual(result['cells'][16], 1)
        self.assertEqual(result['cells'][0], 126)
        with self.assertRaisesRegex(ValueError, 'descriptor index'):
            decoder()(raw[:-1] + bytes([128]), 'm11')

    def test_rejects_truncated_column(self):
        with self.assertRaisesRegex(ValueError, 'column'):
            decoder()(bytes([0,1,0,0,0,0]), 'm11')

    def test_real_m11_fixture_from_jar(self):
        import zipfile
        with zipfile.ZipFile(ROOT/'source/vampire-bloodline-176x208.jar') as jar:
            raw=jar.read('m11')
        result=decoder()(raw,'m11')
        self.assertEqual((result['width'], result['height'], result['tileset']), (256,16,1))
        # Independent header/cell slice from original binary, not decoder output.
        n=raw[1]; offset=2+3*n
        self.assertEqual(result['descriptors'][0], list(raw[2:5]))
        self.assertEqual(result['cells'][16:32],list(raw[offset+16:offset+32]))
        self.assertTrue(result['start'])

if __name__=='__main__': unittest.main()

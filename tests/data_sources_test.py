import hashlib
import json
import unittest
import zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class DeliveredSourceDataTest(unittest.TestCase):
    def test_every_delivered_map_round_trips_to_pinned_jar_bytes(self):
        levels=json.loads((ROOT/'web/data/levels.json').read_text())['levels']
        self.assertEqual([x['id'] for x in levels],[f'm{a}{b}' for a in range(1,6) for b in range(1,4)])
        with zipfile.ZipFile(ROOT/'source/vampire-bloodline-176x208.jar') as jar:
            for m in levels:
                raw=jar.read(m['id'])
                encoded=bytes([m['tileset']-1,len(m['descriptors'])])+bytes(v&255 for d in m['descriptors'] for v in d)+bytes(m['cells'])
                self.assertEqual(encoded,raw,m['id'])
                self.assertEqual(m['width'],16 if m['stage']==3 else 256)
                self.assertEqual(hashlib.sha256(raw).hexdigest(),m['sha256'])
        self.assertEqual(sum(len(x['cells']) for x in levels),42240)
        self.assertEqual([[s['type'] for s in m['spawns'] if 14<=s['type']<=18] for m in levels if m['stage']==3],[[14],[17],[16],[17],[18]])

    def test_original_runtime_assets_are_exact_and_spanish_source_untouched(self):
        with zipfile.ZipFile(ROOT/'source-packages/extra/vampire-bloodline-extra-jars/jars/vampire-bloodline-176-en-patch.jar') as jar:
            for name in jar.namelist():
                if name.endswith('.png'):self.assertEqual((ROOT/'web/assets/original'/name).read_bytes(),jar.read(name))
                if name.endswith('.wav'):self.assertEqual((ROOT/'web/assets/audio'/name).read_bytes(),jar.read(name))
        with zipfile.ZipFile(ROOT/'source/vampire-bloodline-176x208.jar') as jar:
            self.assertEqual((ROOT/'web/assets/original/background-es.png').read_bytes(),jar.read('background.png'))
        self.assertEqual((ROOT/'tools/verify_source.py').read_bytes(),(ROOT/'source-packages/main/vampire-bloodline-handoff/tools/verify_source.py').read_bytes())

    def test_polish_has_every_source_scene_and_attribution(self):
        en=json.loads((ROOT/'web/data/strings-en.json').read_text())
        pl=json.loads((ROOT/'web/data/strings-pl.json').read_text())
        self.assertEqual(len(pl['ruleString']),4)
        self.assertEqual([len(x) for x in pl['cutString']],[len(x) for x in en['cutString']])
        self.assertEqual(set(pl['ui']),set(en['ui']))
        self.assertEqual(set(pl['runtimeUI']),set(en['runtimeUI']))
        for name in ['Lanzz','2021','Kahvibreak','Paul Jacobson','Daniel Rammelt','Matthew Risley','Nic Garner','Mforma']:
            self.assertIn(name,pl['runtimeUI']['credits'])
if __name__=='__main__':unittest.main()

import importlib.util
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class StringExtractionTest(unittest.TestCase):
    def test_extracts_real_class_initializers_and_constant_fields(self):
        path=ROOT/'tools/extract_strings.py'
        self.assertTrue(path.exists(),'missing bytecode string extractor')
        spec=importlib.util.spec_from_file_location('extract_strings',path)
        mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
        import zipfile
        with zipfile.ZipFile(ROOT/'source-packages/extra/vampire-bloodline-extra-jars/jars/vampire-bloodline-176-en-patch.jar') as jar:
            data=mod.extract_strings(jar.read('Strings.class'))
        self.assertEqual(len(data['ruleString']),4)
        self.assertEqual(len(data['cutString']),16)
        self.assertEqual(data['cutString'][2][3],'Joanna Von Jäger.')
        self.assertEqual(data['cutString'][15][-1],'I am REBORN!!!')
        self.assertEqual(data['String5'],'play')
        self.assertIn('Paul Jacobson',data['creditString'])
if __name__=='__main__':unittest.main()

import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'site'))
from solution_checks import check_answer, check_tromino

cases = [
    ('rooms-closed', '2\n0 1\n1 2', '2\n2 1', '2\n1 1', '2\n1 2'),
    ('activities-closed', '2\n0 1\n1 2', '1\n2', '1\n1 2', '1\n1'),
    ('robot', '2 2\n1 1\n1 1', '3\n1 1\n2 1\n2 2', '3\n1 1\n2 2', '3\n1 1\n1 2\n2 2'),
    ('triangle', '2\n1\n2 2', '3\n0 1', '3\n0 2', '3\n0 0'),
    ('lis', '3 1 2 4', '3\n1 2 4', '3\n1 3 4', '3\n1 2 4'),
    ('lnds', '2 2', '2\n2 2', '2\n2 3', '2\n2 2'),
    ('wordchain', 'abcd cdef efgh', '3\nabcd cdef efgh', '3\nabcd efgh cdef', '3\nabcd cdef efgh'),
    ('knapsack', '2 2\n2 3\n2 3', '3\n2', '3\n1 2', '3\n1'),
    ('jobs', '2\n4 1\n5 2', '9\n1 2', '9\n2 1', '9\n1 2'),
    ('activities', '2\n0 2\n0 2', '1\n2', '1\n1 2', '1\n1'),
    ('cubes', '2\n5 1\n5 2', '5\n2', '5\n1 2', '5\n1'),
    ('weighted', '2\n1 1\n1 1', '3\n2 1', '3\n1 1', '3\n1 2'),
    ('partition', '2 2', '0\n2', '0\n', '0\n1'),
    ('rooms', '2\n0 2\n0 2', '2\n2 1', '2\n1 1', '2\n1 2'),
    ('points', '2\n1 3\n2 4', '1\n2', '1\n4', '1\n3'),
    ('coins', '1 2 3\n4', '2\n3 1', '2\n2 3', '2\n2 2'),
    ('segment', '1 -1 1', '1\n2 2', '1\n0 1', '1\n0 0'),
    ('rectangle', '0 0 4 4\n1\n2 2', '8\n0 2 4 4', '8\n0 1 4 3', '8\n0 0 2 4'),
    ('set-lines', '', '2 1\n0 2', '0 2\n2 1\n2 1', '0 2\n2 1'),
    ('subset', '0 1\n0', '0\n1', '0\n2', '0\n'),
    ('vectors', '2 5\n2 3\n2 3', '1\n3 2', '1\n1 4', '1\n2 3'),
    ('text3', 'aa bb', '2\n1\nbb', '2\n1\naa\nbb', '2\n1\naa'),
    ('codes', '1\nAna', 'Ana Wxyz1234', 'Ana xyz1234', 'Ana COD_VALID')
]
for kind, input_text, good, bad, expected in cases:
    assert check_answer(kind, input_text, good, expected)[0], (kind, 'alternative rejected')
    assert not check_answer(kind, input_text, bad, expected)[0], (kind, 'invalid solution accepted')
    assert not check_answer(kind, input_text, 'incorrect format', expected)[0], (kind, 'bad format accepted')
assert check_tromino('1 1 1', '0 42\n42 42')[0]
assert not check_tromino('1 1 1', '0 42\n42 43')[0]
assert not check_tromino('1 1 1', '42 42\n42 0')[0]
spec = importlib.util.spec_from_file_location('runner', ROOT / 'site/runner.py')
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)
data = json.loads((ROOT / 'site/exercises.json').read_text(encoding='utf-8'))
item = next(e for e in data['exercises'] if e.get('editableFiles'))
case = item['tests'][0]
files = json.loads(case['input'])
files[item['editableFiles'][0]] = 'def nr_cifre(n):\n    return 999\ndef invers(n):\n    return 999\ndef cmmdc(a, b):\n    return 999\n'
result = json.loads(runner.evaluate(dict(item, code=item['solution'], input=json.dumps(files), expected=case['expected'])))
assert not result['error'] and result['output'].strip() == '999 999 999'
assert result['output'].strip() != case['expected'], 'edited module was ignored'
fresh = json.loads(runner.evaluate(dict(item, code=item['solution'], input=case['input'], expected=case['expected'])))
assert fresh['output'].strip() == case['expected'], 'module cache leaked between tests'
files[item['editableFiles'][0]] = 'def nr_cifre(n):\n    return missing\ndef invers(n):\n    return 0\ndef cmmdc(a, b):\n    return 0\n'
error = json.loads(runner.evaluate(dict(item, code=item['solution'], input=json.dumps(files))))['error']
assert error['type'] == 'NameError' and error['file'] == 'algoritmi_elementari.py' and error['line'] == 2, error
files[item['editableFiles'][0]] = 'def nr_cifre(n)\n    pass\n'
error = json.loads(runner.evaluate(dict(item, code=item['solution'], input=json.dumps(files))))['error']
assert error['type'] == 'SyntaxError' and error['file'] == 'algoritmi_elementari.py' and error['line'] == 1, error
print(f'{len(cases) * 3 + 3} constructive checks and 4 module isolation/error checks passed.')

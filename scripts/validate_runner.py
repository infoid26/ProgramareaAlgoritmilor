import importlib.util
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('runner', root / 'site/runner.py')
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)
data = json.loads((root / 'site/exercises.json').read_text(encoding='utf-8'))
beginner_js = (root / 'site/python-course.js').read_text(encoding='utf-8')
beginner = json.loads(beginner_js.removeprefix('window.PA_BEGINNER = ').removesuffix(';\n'))
count = 0
for item in data['exercises'] + beginner['exercises']:
    for case in item['tests']:
        result = json.loads(runner.evaluate(dict(item, code=item['solution'], input=case['input'])))
        actual = result['fileOutput'] if item.get('outputFile') else result['output']
        expected = case['expected']
        if item.get('compare') != 'exact':
            actual = '\n'.join(line.rstrip() for line in actual.rstrip('\n').split('\n'))
            expected = '\n'.join(line.rstrip() for line in expected.rstrip('\n').split('\n'))
        assert not result['error'] and actual == expected, (item['id'], result, expected)
        count += 1
for code, kind, line in [('print(unknown)', 'NameError', 1), ('if True\n    pass', 'SyntaxError', 1), ('print(1)\nprint(2 / 0)', 'ZeroDivisionError', 2), ('input()\ninput()', 'EOFError', 2), ('print("x" * 20001)', 'RuntimeError', 1)]:
    result = json.loads(runner.evaluate(dict(code=code, input='1')))
    assert result['error']['type'] == kind and result['error']['line'] == line, result
result = json.loads(runner.evaluate(dict(code='print(1)', input='', outputFile='date.out')))
assert result['error']['type'] == 'FileNotFoundError'
result = json.loads(runner.evaluate(dict(code='print(4)', input='2', requiredFunction='patrat')))
assert result['error']['type'] == 'ValueError'
result = json.loads(runner.evaluate(dict(code='print("before")\n1 / 0', input='')))
assert result['output'] == 'before\n'
print(f'{count} reference cases (subject + beginner) and 8 error/partial-output checks passed in the evaluator.')

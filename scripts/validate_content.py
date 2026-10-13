import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'site/exercises.json').read_text(encoding='utf-8'))
failures = []
count = 0
def normalize(value, mode):
    return value if mode == 'exact' else '\n'.join(line.rstrip() for line in value.replace('\r\n', '\n').rstrip('\n').split('\n'))
for exercise in data['exercises']:
    compile(exercise['starter'], '<starter>', 'exec')
    for index, case in enumerate(exercise['tests']):
        with tempfile.TemporaryDirectory() as folder:
            if exercise.get('inputFile'):
                Path(folder, exercise['inputFile']).write_text(case['input'], encoding='utf-8')
            process = subprocess.run([sys.executable, '-X', 'utf8', '-c', exercise['solution']], input=case['input'], text=True, encoding='utf-8', capture_output=True, cwd=folder, timeout=5)
            output = Path(folder, exercise['outputFile']).read_text(encoding='utf-8') if exercise.get('outputFile') and Path(folder, exercise['outputFile']).exists() else process.stdout
            count += 1
            if process.returncode or normalize(output, exercise.get('compare')) != normalize(case['expected'], exercise.get('compare')):
                failures.append(dict(id=exercise['id'], case=index + 1, expected=case['expected'], actual=output, error=process.stderr))
assert len({e['id'] for e in data['exercises']}) == len(data['exercises'])
for chapter in data['chapters']:
    assert any(e['chapter'] == chapter['id'] for e in data['exercises'])
print(json.dumps(failures, ensure_ascii=True, indent=2))
print(f'{count} cases; {len(failures)} failures')
sys.exit(bool(failures))

import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'site'))
from solution_checks import check_answer, check_tromino
data = json.loads((ROOT / 'site/exercises.json').read_text(encoding='utf-8'))
failures = []
count = 0
def normalize(value, mode):
    return value if mode == 'exact' else '\n'.join(line.rstrip() for line in value.replace('\r\n', '\n').rstrip('\n').split('\n'))
for exercise in data['exercises']:
    compile(exercise['starter'], '<starter>', 'exec')
    for index, case in enumerate(exercise['tests']):
        with tempfile.TemporaryDirectory() as folder:
            if exercise.get('inputFiles'):
                bundle = json.loads(case['input'])
                for name in exercise['inputFiles']:
                    Path(folder, name).write_text(bundle[name], encoding='utf-8')
            input_text = json.loads(case['input']).get('_stdin', '') if exercise.get('inputFiles') else case['input']
            if exercise.get('inputFile'):
                Path(folder, exercise['inputFile']).write_text(case['input'], encoding='utf-8')
            process = subprocess.run([sys.executable, '-X', 'utf8', '-c', exercise['solution']], input=input_text, text=True, encoding='utf-8', capture_output=True, cwd=folder, timeout=5)
            output = Path(folder, exercise['outputFile']).read_text(encoding='utf-8') if exercise.get('outputFile') and Path(folder, exercise['outputFile']).exists() else process.stdout
            count += 1
            valid = check_tromino(case['input'], output)[0] if exercise.get('validator') == 'tromino' else check_answer(exercise['validator'], case['input'], output, case['expected'])[0] if exercise.get('validator') else normalize(output, exercise.get('compare')) == normalize(case['expected'], exercise.get('compare'))
            if process.returncode or not valid:
                failures.append(dict(id=exercise['id'], case=index + 1, expected=case['expected'], actual=output, error=process.stderr))
assert len({e['id'] for e in data['exercises']}) == len(data['exercises'])
for chapter in data['chapters']:
    assert any(e['chapter'] == chapter['id'] for e in data['exercises'])
print(json.dumps(failures, ensure_ascii=True, indent=2))
print(f'{count} cases; {len(failures)} failures')
sys.exit(bool(failures))

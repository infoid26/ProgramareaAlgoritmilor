"""Python evaluator used inside a disposable browser worker."""
import ast
import contextlib
import io
import json
import os
import sys
import tempfile
import traceback
from solution_checks import check_answer, check_tromino

class LimitedOutput(io.StringIO):
    def write(self, text):
        if self.tell() + len(text) > 20000:
            raise RuntimeError('Limita de 20000 de caractere afișate a fost depășită.')
        return super().write(text)

def evaluate(payload):
    output = LimitedOutput()
    response = dict(output='', fileOutput=None, error=None, correct=None, feedback='')
    previous_input = sys.stdin
    previous_directory = os.getcwd()
    previous_path = sys.path[:]
    module_names = [os.path.splitext(name)[0] for name in payload.get('inputFiles', []) if name.endswith('.py')]
    try:
        with tempfile.TemporaryDirectory() as folder:
            with contextlib.chdir(folder):
                sys.path.insert(0, folder)
                for name in module_names:
                    sys.modules.pop(name, None)
                if payload.get('inputFiles'):
                    bundle = json.loads(payload['input'])
                    for name in payload['inputFiles']:
                        with open(name, 'w', encoding='utf-8', newline='') as stream:
                            stream.write(bundle[name])
                    payload = dict(payload, input=bundle.get('_stdin', ''))
                if payload.get('inputFile'):
                    with open(payload['inputFile'], 'w', encoding='utf-8', newline='') as stream:
                        stream.write(payload['input'])
                sys.stdin = io.StringIO(payload['input'])
                with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
                    tree = ast.parse(payload['code'], filename='solutia.py')
                    names = payload.get('requiredFunctions', []) + ([payload['requiredFunction']] if payload.get('requiredFunction') else [])
                    for name in names:
                        if not any(isinstance(node, ast.FunctionDef) and node.name == name for node in tree.body):
                            raise ValueError(f'Cerința solicită definirea funcției {name}.')
                    scope = {'__name__': '__main__'}
                    exec(compile(tree, 'solutia.py', 'exec'), scope)
                if payload.get('outputFile'):
                    with open(payload['outputFile'], encoding='utf-8') as stream:
                        response['fileOutput'] = stream.read(20001)
                    if len(response['fileOutput']) > 20000:
                        raise RuntimeError('Fișierul rezultat depășește 20000 de caractere.')
            os.chdir(previous_directory)
    except BaseException as error:
        names = ['solutia.py'] + [name + '.py' for name in module_names]
        frames = [frame for frame in traceback.extract_tb(error.__traceback__) if os.path.basename(frame.filename) in names]
        filename = os.path.basename(getattr(error, 'filename', None) or (frames[-1].filename if frames else 'solutia.py'))
        response['error'] = dict(type=type(error).__name__, message=str(error), file=filename, line=getattr(error, 'lineno', None) or (frames[-1].lineno if frames else None))
    finally:
        sys.stdin = previous_input
        sys.path[:] = previous_path
        for name in module_names:
            sys.modules.pop(name, None)
        os.chdir(previous_directory)
    response['output'] = output.getvalue()
    if not response['error'] and payload.get('validator') and payload.get('expected') is not None:
        actual = response['fileOutput'] if payload.get('outputFile') else response['output']
        response['correct'], response['feedback'] = check_tromino(payload['input'], actual) if payload['validator'] == 'tromino' else check_answer(payload['validator'], payload['input'], actual, payload['expected'])
    return json.dumps(response, ensure_ascii=False)



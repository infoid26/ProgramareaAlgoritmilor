"""Python evaluator used inside a disposable browser worker."""
import ast
import contextlib
import io
import json
import os
import sys
import tempfile
import traceback

class LimitedOutput(io.StringIO):
    def write(self, text):
        if self.tell() + len(text) > 20000:
            raise RuntimeError('Limita de 20000 de caractere afișate a fost depășită.')
        return super().write(text)

def evaluate(payload):
    output = LimitedOutput()
    response = dict(output='', fileOutput=None, error=None)
    previous_input = sys.stdin
    previous_directory = os.getcwd()
    try:
        with tempfile.TemporaryDirectory() as folder:
            with contextlib.chdir(folder):
                if payload.get('inputFile'):
                    with open(payload['inputFile'], 'w', encoding='utf-8', newline='') as stream:
                        stream.write(payload['input'])
                sys.stdin = io.StringIO(payload['input'])
                with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
                    tree = ast.parse(payload['code'], filename='solutia.py')
                    name = payload.get('requiredFunction')
                    if name and not any(isinstance(node, ast.FunctionDef) and node.name == name for node in tree.body):
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
        frames = [frame for frame in traceback.extract_tb(error.__traceback__) if frame.filename == 'solutia.py']
        response['error'] = dict(type=type(error).__name__, message=str(error), line=getattr(error, 'lineno', None) or (frames[-1].lineno if frames else None))
    finally:
        sys.stdin = previous_input
        os.chdir(previous_directory)
    response['output'] = output.getvalue()
    return json.dumps(response, ensure_ascii=False)



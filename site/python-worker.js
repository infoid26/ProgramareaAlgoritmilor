let runtime;
self.onmessage = async ({ data }) => {
try {
importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');
runtime = await loadPyodide();
const response = await fetch(new URL('runner.py', self.location.href));
if (!response.ok) { throw new Error('Nu se poate încărca evaluatorul Python.'); }
const checksResponse = await fetch(new URL('solution_checks.py', self.location.href));
if (!checksResponse.ok) { throw new Error('Nu se pot încărca verificările soluțiilor.'); }
runtime.FS.writeFile('/home/pyodide/solution_checks.py', await checksResponse.text());
await runtime.runPythonAsync(await response.text());
for (const [index, test] of data.tests.entries()) {
self.postMessage({ type: 'starting', index });
const input = data.editableFiles ? JSON.stringify({ ...JSON.parse(test.input), ...data.editableFiles }) : test.input;
runtime.globals.set('payload_json', JSON.stringify({ ...data.exercise, code: data.code, input, expected: test.expected }));
const result = JSON.parse(await runtime.runPythonAsync('evaluate(json.loads(payload_json))'));
self.postMessage({ type: 'result', index, result });
}
self.postMessage({ type: 'done' });
} catch (error) { self.postMessage({ type: 'error', message: String(error.message || error) }); }
};

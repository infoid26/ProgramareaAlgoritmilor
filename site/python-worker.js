let runtime;
self.onmessage = async ({ data }) => {
try {
importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');
runtime = await loadPyodide();
const response = await fetch(new URL('runner.py', self.location.href));
if (!response.ok) { throw new Error('Nu se poate încărca evaluatorul Python.'); }
await runtime.runPythonAsync(await response.text());
for (const [index, test] of data.tests.entries()) {
self.postMessage({ type: 'starting', index });
runtime.globals.set('payload_json', JSON.stringify({ ...data.exercise, code: data.code, input: test.input }));
const result = JSON.parse(await runtime.runPythonAsync('evaluate(json.loads(payload_json))'));
self.postMessage({ type: 'result', index, result });
}
self.postMessage({ type: 'done' });
} catch (error) { self.postMessage({ type: 'error', message: String(error.message || error) }); }
};

import { basicSetup } from 'codemirror';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { autocompletion, acceptCompletion } from '@codemirror/autocomplete';
import { indentWithTab } from '@codemirror/commands';
import { syntaxTree, syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
const mounted = new WeakMap();
function suggestions(context) {
const word = context.matchBefore(/[A-Za-z_][A-Za-z_0-9]*/);
if (!word || (!context.explicit && word.from === word.to)) { return null; }
const node = syntaxTree(context.state).resolveInner(context.pos, -1);
for (let current = node; current; current = current.parent) { if (/String|Comment/.test(current.name)) { return null; } }
const aliases = { true:'True', false:'False', null:'None' };
const words = ['True','False','None','print','input','int','float','str','len','range','list','dict','set','tuple','sum','min','max','sorted','enumerate','zip','abs','round','open','if','elif','else','for','while','def','return','import','from','in','and','or','not','break','continue','with','as','try','except','class','yield'];
const options = words.map(label => ({ label, type:/^(True|False|None)$/.test(label) ? 'constant' : 'keyword' }));
const seen = new Set(words);
syntaxTree(context.state).iterate({ enter(n) { if (n.name === 'VariableName') { const label = context.state.sliceDoc(n.from,n.to); if (!seen.has(label) && !aliases[label]) { seen.add(label); options.push({ label, type:'variable' }); } } } });
if (aliases[word.text]) { options.unshift({ label:aliases[word.text], displayLabel:word.text + ' → ' + aliases[word.text], apply:aliases[word.text], type:'constant', boost:100, info:'În Python se scrie ' + aliases[word.text] + '. Acceptă sugestia pentru a înlocui.' }); }
return { from:word.from, options, validFor:/^[A-Za-z_][A-Za-z_0-9]*$/ };
}
function mount(field) {
if (mounted.has(field)) { return; }
const host = document.createElement('div');
host.className = 'python-codemirror';
field.after(host);
const editable = new Compartment();
let syncing = false;
const valueProperty = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value');
const readonlyProperty = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'readOnly');
const view = new EditorView({ parent:host, state:EditorState.create({ doc:field.value, extensions:[basicSetup, python(), syntaxHighlighting(HighlightStyle.define([{ tag:tags.keyword,color:'#c5a3ff' },{ tag:tags.string,color:'#a8e6c3' },{ tag:tags.number,color:'#ffc78a' },{ tag:tags.comment,color:'#a39db6',fontStyle:'italic' },{ tag:tags.bool,color:'#ffc78a' },{ tag:tags.function(tags.variableName),color:'#91ccff' }])), autocompletion({ override:[suggestions] }), keymap.of([{ key:'Tab', run:acceptCompletion }, indentWithTab, { key:'Mod-Enter', run:() => { document.querySelector('#python-check').click(); return true; } }]), editable.of([EditorState.readOnly.of(field.readOnly),EditorView.editable.of(!field.readOnly)]), EditorView.contentAttributes.of({ 'aria-label':field.id === 'python-code' ? 'Codul tău Python' : 'Codul modulului Python', spellcheck:'false' }), EditorView.updateListener.of(update => { if (update.docChanged && !syncing) { valueProperty.set.call(field,update.state.doc.toString()); field.dispatchEvent(new Event('input',{ bubbles:true })); } }), EditorView.theme({ '&':{ background:'#25213f',color:'#eeeafc',fontSize:'14px' }, '.cm-content':{ fontFamily:'Consolas, monospace',minHeight:'200px',caretColor:'#fff' }, '.cm-scroller':{ overflow:'auto',fontFamily:'Consolas, monospace' }, '.cm-gutters':{ background:'#201c37',color:'#a69bbf',border:'none' }, '.cm-activeLine,.cm-activeLineGutter':{ background:'#ffffff0a' }, '.cm-tooltip':{ background:'#fff',color:'#25213f',border:'1px solid #d8d1ee' }, '.cm-selectionBackground':{ background:'#6555a8 !important' } },{ dark:true })] }) });
Object.defineProperty(field,'value',{ configurable:true,get:() => view.state.doc.toString(),set:value => { const text = String(value); valueProperty.set.call(field,text); if (text !== view.state.doc.toString()) { syncing = true; view.dispatch({ changes:{ from:0,to:view.state.doc.length,insert:text },selection:{ anchor:0 } }); syncing = false; } } });
Object.defineProperty(field,'readOnly',{ configurable:true,get:() => readonlyProperty.get.call(field),set:value => { readonlyProperty.set.call(field,value); view.dispatch({ effects:editable.reconfigure([EditorState.readOnly.of(!!value),EditorView.editable.of(!value)]) }); } });
field.focus = () => view.focus();
field.setSelectionRange = (start,end) => view.dispatch({ selection:{ anchor:start,head:end },scrollIntoView:true });
field.hidden = true;
mounted.set(field,{ view,host });
}
window.PA_CODEMIRROR = { mount };
mount(document.querySelector('#python-code'));
window.addEventListener('pa-module-editor',() => { const field = document.querySelector('#python-input'); const existing = mounted.get(field); if (field.classList.contains('module-code')) { mount(field); field.hidden = true; mounted.get(field).host.hidden = false; } else if (existing) { existing.host.hidden = true; field.hidden = false; } });
window.dispatchEvent(new Event('pa-module-editor'));

"""Extract text from study documents without modifying the source files."""
import json
import re
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / '.audit'
TARGET.mkdir(exist_ok=True)
manifest = []
for folder in ['Curs', 'Laborator']:
    for path in sorted((ROOT / folder).rglob('*')):
        if not path.is_file():
            continue
        sections = []
        if path.suffix.lower() == '.pdf':
            sections = [f'PAGE {index + 1}\n{page.extract_text() or ""}' for index, page in enumerate(PdfReader(path).pages)]
        elif path.suffix.lower() in ['.docx', '.pptx']:
            with zipfile.ZipFile(path) as archive:
                names = ['word/document.xml'] if path.suffix.lower() == '.docx' else sorted([name for name in archive.namelist() if re.fullmatch(r'ppt/slides/slide\d+\.xml', name)], key=lambda name: int(re.search(r'slide(\d+)', name).group(1)))
                for name in names:
                    tree = ET.fromstring(archive.read(name))
                    paragraphs = [''.join(node.itertext()) for node in tree.iter() if node.tag.endswith('}t')]
                    sections.append(name + '\n' + '\n'.join(paragraphs))
        elif path.suffix.lower() == '.ipynb':
            notebook = json.loads(path.read_text(encoding='utf-8-sig'))
            sections = [f'CELL {index + 1} {cell["cell_type"]}\n' + ''.join(cell.get('source', [])) for index, cell in enumerate(notebook['cells'])]
        elif path.suffix.lower() in ['.py', '.cpp', '.h', '.txt']:
            sections = [path.read_text(encoding='utf-8-sig', errors='replace')]
        else:
            raise ValueError(f'Unexamined file type: {path}')
        text = '\n\n'.join(sections)
        output = TARGET / (str(path.relative_to(ROOT)).replace('\\', '__').replace('/', '__') + '.txt')
        output.write_text(text, encoding='utf-8')
        manifest.append(dict(path=path.relative_to(ROOT).as_posix(), extracted=output.name, sections=len(sections), characters=len(text)))
(TARGET / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(dict(files=len(manifest), characters=sum(item['characters'] for item in manifest), empty=[item['path'] for item in manifest if item['characters'] < 20]), ensure_ascii=True))

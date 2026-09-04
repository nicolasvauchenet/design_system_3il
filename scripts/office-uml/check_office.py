"""Structural coverage checks; no modification of delivered Office files."""
from pathlib import Path
import json, re, zipfile, unicodedata
from lxml import etree

base=Path(__file__).resolve().parent
root=base.parent.parent
docs=json.loads((base/'sources.json').read_text(encoding='utf8'))
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
with zipfile.ZipFile(root/'office/UML/3iL-UML-Cours-complet.docx') as z:
    x=etree.fromstring(z.read('word/document.xml'))
    names=set(x.xpath('//w:bookmarkStart/@w:name',namespaces=ns))
    anchors=x.xpath('//w:hyperlink/@w:anchor',namespaces=ns)
    assert all(a in names for a in anchors), 'Broken Word internal anchor'
    word='\n'.join(x.xpath('//w:p',namespaces=ns)[i].xpath('string(.)') for i in range(len(x.xpath('//w:p',namespaces=ns))))
    for n in z.namelist():
        if n.endswith('.xml'):etree.fromstring(z.read(n))
with zipfile.ZipFile(root/'office/UML/3iL-UML-Presentation.pptx') as z:
    slides=[n for n in z.namelist() if re.fullmatch(r'ppt/slides/slide\d+.xml',n)]
    notes=[]
    for n in z.namelist():
        if n.endswith('.xml'):
            x=etree.fromstring(z.read(n))
            if re.fullmatch(r'ppt/notesSlides/notesSlide\d+.xml',n):notes.append('\n'.join(x.xpath('//a:t/text()',namespaces=ns)))
    missing=[]
    for d in docs:
        norm=lambda s:re.sub(r'\s+',' ',s).strip()
        if not any(norm(d['raw']) in norm(n) for n in notes):missing.append(d['path'])
    assert not missing, missing
    assert len(slides)==92,len(slides)
print(json.dumps({'source_documents':len(docs),'full_documents_in_notes':len(docs),'slides':len(slides),'word_internal_links':len(anchors),'xml':'valid'},ensure_ascii=False))

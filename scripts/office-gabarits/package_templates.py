"""Preserve reference themes and package macro-free native Office templates."""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
from lxml import etree
import re,json,posixpath
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'office/Gabarits';TMP=Path(__file__).parent
ref=ROOT/'office/UML/3iL-UML-Presentation.pptx'
ppt=OUT/'3iL-Gabarit-Presentation.pptx'
with ZipFile(ref) as z:
    themes={n:z.read(n) for n in z.namelist() if re.fullmatch(r'ppt/theme/theme\d+.xml',n)}
with ZipFile(ppt) as z:parts={n:z.read(n) for n in z.namelist()}
# Export remaps theme paths; all four reference theme parts are identical.
assert len(set(themes.values()))==1
theme_bytes=next(iter(themes.values()))
exported_themes=[n for n in parts if re.search(r'/theme/theme\d+\.xml$',n)]
for n in exported_themes:parts[n]=theme_bytes
with ZipFile(ppt,'w',ZIP_DEFLATED) as z:
    for n,data in parts.items():z.writestr(n,data)
with ZipFile(OUT/'3iL-Gabarit-Presentation.potx','w',ZIP_DEFLATED) as z:
    for n,data in parts.items():
        if n=='[Content_Types].xml':data=data.replace(b'application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml',b'application/vnd.openxmlformats-officedocument.presentationml.template.main+xml')
        z.writestr(n,data)
ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main','w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
report={}
for f in OUT.iterdir():
    if f.name.startswith('~$') or f.suffix not in ['.docx','.dotx','.pptx','.potx']:continue
    with ZipFile(f) as z:
        names=z.namelist();assert not any('vbaProject' in n for n in names)
        for n in names:
            if n.endswith('.xml') or n.endswith('.rels'):etree.fromstring(z.read(n))
            if n.endswith('.rels'):
                x=etree.fromstring(z.read(n))
                folder=posixpath.dirname(n).replace('/_rels','') if n!='_rels/.rels' else ''
                for rel in x:
                    if rel.get('TargetMode')=='External':continue
                    t=rel.get('Target');target=t.lstrip('/') if t.startswith('/') else posixpath.normpath(posixpath.join(folder,t))
                    assert target in names,(f.name,n,target)
        if f.suffix in ['.pptx','.potx']:
            slides=[n for n in names if re.fullmatch(r'ppt/slides/slide\d+.xml',n)];assert len(slides)==10
            for n in slides:
                x=etree.fromstring(z.read(n));text=' '.join(x.xpath('//a:t/text()',namespaces=ns));assert 'UML' not in text and 'Modéliser les systèmes' not in text
                assert x.xpath('//p:ph[@type="title"]',namespaces=ns),(n,'missing native title')
                for sp in x.xpath('//p:sp[p:nvSpPr/p:nvPr/p:ph]',namespaces=ns):
                    assert ''.join(sp.xpath('.//a:t/text()',namespaces=ns)).strip(),(n,'empty placeholder')
            for n in exported_themes:assert z.read(n)==theme_bytes
        else:
            x=etree.fromstring(z.read('word/document.xml'));assert 'UML' not in ''.join(x.xpath('//w:t/text()',namespaces=ns))
            assert any('TOC' in t for t in x.xpath('//w:instrText/text()',namespaces=ns))
        ct=z.read('[Content_Types].xml')
        assert (b'template.main+xml' in ct)==(f.suffix in ['.dotx','.potx'])
        report[f.name]={'xml':'valid','relationships':'valid','macros':False,'bytes':f.stat().st_size}
(TMP/'package-check.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print(json.dumps(report,indent=2))

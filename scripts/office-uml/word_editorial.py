"""Targeted Word-only editorial changes, reapplied on every revision build."""
from copy import deepcopy
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

UPDATE = 'Mise à jour : UML 2.5.1 a été publié par l’OMG en décembre 2017. Les développements suivants décrivent l’apport historique d’UML 2.5 (2015).'
HISTORY_PREFIX = "UML 2.5 est une version du langage de modélisation unifié"
HISTORY_END = "Voici quelques aspects clés d'UML 2.5 :"
HISTORY_REPLACEMENT = "L’OMG a ensuite publié UML 2.5.1 en décembre 2017. Les points suivants présentent l’apport historique d’UML 2.5 (2015) :"
SUFFIX = ' — En annexe'


def is_exercise_reference(p):
    return p.style.name == 'Heading 3' and any(
        a in {f'source_{i}' for i in range(9, 21)}
        for a in p._p.xpath('.//w:hyperlink/@w:anchor')
    )


def apply_editorial_changes(doc):
    # Preserve cover typography without inheriting a collapsible heading level.
    name = '3iL Établissement'
    s = doc.styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH) if name not in doc.styles else doc.styles[name]
    s.base_style = doc.styles['Normal']
    for tag in ('w:pPr', 'w:rPr'):
        existing = s.element.find(qn(tag))
        if existing is not None:
            s.element.remove(existing)
        source = doc.styles['Heading 2'].element.find(qn(tag))
        if source is not None:
            s.element.append(deepcopy(source))
    pp = s.element.get_or_add_pPr()
    for outline in list(pp.findall(qn('w:outlineLvl'))):
        pp.remove(outline)
    outline = OxmlElement('w:outlineLvl')
    outline.set(qn('w:val'), '9')
    pp.append(outline)

    brand = update = history = references = 0
    for p in list(doc.paragraphs):
        if p.text == '3iL Programmes Experts':
            p.style = s
            brand += 1
        elif p.text == UPDATE:
            p._p.getparent().remove(p._p)
            update += 1
        elif p.text.startswith(HISTORY_PREFIX):
            assert p.text.endswith(HISTORY_END)
            p.text = p.text[:-len(HISTORY_END)] + HISTORY_REPLACEMENT
            history += 1
        elif is_exercise_reference(p):
            p.add_run(SUFFIX)
            references += 1
    assert (brand, update, history, references) == (1, 1, 1, 12), (brand, update, history, references)

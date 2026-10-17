#!/usr/bin/env python3
"""Static coverage/binding audit only; NOT a PlusCal parser or semantic proof.
Run in Actions. Source modules are parsed as text/AST, never imported/executed.
The separate translation review owns semantic branch/order/authority assessment.
"""
import argparse
import ast
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OWNERS = {
    'system.py': 'system.pcal',
    'backend/project_state.py': 'backend/project_state.pcal',
    'backend/project_efsm.py': 'backend/project_efsm.pcal',
    'backend/assets_files.py': 'backend/assets_files.pcal',
    'backend/graphs.py': 'backend/graphs.pcal',
    'backend/layout_annotations.py': 'backend/layout_annotations.pcal',
    'application/adapter.py': 'application/adapter.pcal',
    'application/public_api/__init__.py': 'application/public_api/contract.pcal',
    'application/public_api/assets.py': 'application/public_api/assets.pcal',
    'application/public_api/graphs.py': 'application/public_api/graphs.pcal',
    'application/public_api/layout_annotations.py': 'application/public_api/layout_annotations.pcal',
    'frontend/interface_fsm.py': 'frontend/interface_fsm.pcal',
    'frontend/mantine_ui.py': 'frontend/mantine_ui.pcal',
    'frontend/renderer.py': 'frontend/renderer.pcal',
    'portable_build/portable_build.py': 'portable_build/portable_build.pcal',
}
ALIASES = {
    ('application/adapter.py', 'runLifecycleTask'): 'ApplicationAdapter_runLifecycleTask',
    ('frontend/mantine_ui.py', 'runLifecycleTask'): 'MantineUi_runLifecycleTask',
    ('backend/layout_annotations.py', 'readLabelsApiState'): 'BackendAnnotations_readLabelsApiState',
    ('application/public_api/layout_annotations.py', 'readLabelsApiState'): 'ApplicationApi_readLabelsApiState',
    ('frontend/renderer.py', 'prepareDashboardFileDrop'): 'Renderer_prepareDashboardFileDrop',
    ('application/public_api/layout_annotations.py', 'prepareDashboardFileDrop'): 'ApplicationApi_prepareDashboardFileDrop',
}


def assignment(tree, name):
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == name for t in node.targets):
            return ast.literal_eval(node.value)
    raise AssertionError('Missing Source assignment: ' + name)


def entries(tree):
    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            yield node.name, node
        elif isinstance(node, ast.ClassDef):
            for method in node.body:
                if isinstance(method, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    yield node.name + '.' + method.name, method


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    sources = {p.relative_to(ROOT / 'sourcescript').as_posix() for p in (ROOT / 'sourcescript').rglob('*.py')}
    assert sources == set(OWNERS), ('Unmapped/missing Source owner', sources ^ set(OWNERS))
    active = {p.relative_to(ROOT / 'pseudocode').as_posix() for p in (ROOT / 'pseudocode').rglob('*.pcal')}
    assert active == set(OWNERS.values()), ('Wrong hierarchy/legacy active file', active ^ set(OWNERS.values()))
    tables, texts, trees = {}, {}, {}
    for source, target in OWNERS.items():
        trees[source] = ast.parse((ROOT / 'sourcescript' / source).read_text(encoding='utf-8'))
        text = (ROOT / 'pseudocode' / target).read_text(encoding='utf-8')
        texts[target] = text
        table = {}
        for match in re.finditer(r'^procedure\s+(\w+)\(([^)]*)\)', text, re.M):
            name = match[1]
            assert name not in table, ('Duplicate local procedure', target, name)
            params = [p.strip() for p in match[2].split(',') if p.strip()]
            table[name] = (params, text.count('\n', 0, match.start()) + 1)
        tables[target] = table
    rows = []
    for source, target in OWNERS.items():
        for qualified, node in entries(trees[source]):
            name = ALIASES.get((source, qualified), qualified.replace('.', '_'))
            assert name in tables[target], ('Missing Source entry', source, qualified, target, name)
            params, line = tables[target][name]
            source_params = [p.arg for p in node.args.posonlyargs + node.args.args if p.arg not in ('self', 'cls')]
            assert len(params) == len(source_params), ('Input arity mismatch', source, qualified, source_params, params)
            rows.append(f'| sourcescript/{source}:{node.lineno} `{qualified}({", ".join(source_params)})` | pseudocode/{target}:{line} `{name}({", ".join(params)})` |')
    all_names = [name for table in tables.values() for name in table]
    assert len(set(all_names)) == len(all_names), 'Cross-owner procedure collision; qualify Source owner explicitly'
    declared = set(all_names)
    for target, text in texts.items():
        for name in re.findall(r'\bcall\s+(\w+)\s*\(', text):
            assert name in declared, ('Unbound explicit procedure call', target, name)
        for placeholder in ('PendingSourceDomainCandidate', 'SourceArgumentsForWrapper', 'InvokeTranslatedSourceProcedure',
                            'ExistingRejectedRasterOutcome', 'ExistingSavedHandoffOutcome',
                            'FfpxDocumentsUsingTypedEncoder', 'ReadFfpxDocumentsUsingTypedDecoder',
                            'CompleteSingleFileCollisionChoiceUsingOfficialQueries'):
            assert placeholder not in text, ('Unexpanded domain placeholder', target, placeholder)
    methods = assignment(trees['application/public_api/__init__.py'], 'PUBLIC_API_METHODS')
    source_api = {ns + '.' + method for ns, group in methods.items() for method in group}
    contract = texts['application/public_api/contract.pcal']
    routes = re.findall(r'^ "([^"]+)" \|->', contract, re.M)
    assert len(routes) == len(set(routes)) and set(routes) == source_api, ('Public API coverage mismatch', source_api ^ set(routes))
    wrapper_routes = set(re.findall(r'^ "([^"]+)" \|-> <<"wrapper",', contract, re.M))
    wrapper_branches = re.findall(r'(?:if|elsif) method = "([^"]+)" then', contract)
    # Restrict to the dedicated wrapper procedure, not selection/query helper branches.
    wrapper_body = contract.split('procedure InvokePublicWrapper(', 1)[1].split('end procedure;', 1)[0]
    wrapper_branches = re.findall(r'(?:if|elsif) method = "([^"]+)" then', wrapper_body)
    assert set(wrapper_branches) == wrapper_routes and len(wrapper_branches) == len(wrapper_routes), 'Wrapper mapping incomplete/duplicated'
    tokens = set(re.findall(r'"([A-Z][A-Z_]+)"', '\n'.join(texts.values())))
    for source, constant in [('backend/project_efsm.py', 'PROJECT_COMMANDS'), ('frontend/interface_fsm.py', 'INTERFACE_EVENTS')]:
        expected = set(assignment(trees[source], constant))
        assert expected <= tokens, ('Missing event vocabulary', source, expected - tokens)
    report = '# Static Source → pseudocode entry/input trace\n\n'
    report += 'Coverage/binding only; not semantic execution, PlusCal parser or TLC evidence.\n\n'
    report += '| Source entry/input | Translated entry/input |\n|---|---|\n' + '\n'.join(rows) + '\n'
    report += f'\n{len(rows)} entries; {len(source_api)} APIs; {len(wrapper_routes)} explicit wrapper bindings; {len(active)} active owner files.\n'
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(report, encoding='utf-8')
    print(report if not args.report else report.splitlines()[-1])
    print('pseudocode static coverage/binding: PASS (semantic review remains separate)')


if __name__ == '__main__':
    main()

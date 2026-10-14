# PlusCal translation review — Source Script r23 / pseudocode r9

## 대응 범위
- project EFSM command set에 `ASSETS_IMPORTED`를 추가했다.
- assets pseudocode의 CSV/image create, batch import, delete, move, trash empty, project import, FFSX apply를 application project-command dispatch로 수렴시켰다.
- assets module의 project 값은 read projection으로만 사용하고 독립 authoritative commit을 제거했다.
- graphs pseudocode의 command record 생성만 하던 경로를 실제 application dispatch로 바꿨다.
- graph-object selection은 project mutation 내부에서 직접 쓰지 않고 result hint 이후 interface reconciliation 책임으로 남겼다.
- headerLines/layout/palette/editable/import의 command route를 r23과 맞췄다.

## 일반 코딩 원칙
candidate 계산과 authoritative commit을 분리했고, 기존 application/projectEFSM 경계를 재사용했다. 별도 mutation bus나 중복 project state를 추가하지 않았다. mixed batch import만 `ASSETS_IMPORTED` 한 command로 표현해 원자성을 보존한다.

## 대조 결과
`assets_files.pcal`, `graphs.pcal`, `layout_annotations_export.pcal`에는 더 이상 `projectAuthority/projectView := candidate` 또는 `command := ...` 형태의 독립 persistent mutation 경로가 남지 않는다.

verification r21은 r9 lineage가 아니므로 stale다.

# PlusCal translation review — Source Script r22 / pseudocode r8

## 번역 범위

Source Script r22의 project command coverage와 persistent mutation path를 `project_efsm.pcal`과 `layout_annotations_export.pcal`에 직접 번역했다.

## 대응 확인

- `PROJECT_COMMANDS`를 PlusCal에 명시해 r22의 persistent command 집합을 직접 추적할 수 있게 했다.
- public persistent mutation surface가 declared command 집합에 포함된다는 coverage assertion을 추가했다.
- layout style/grid/merge/split, slot image settings, label settings/position, caption text/settings, export settings를 application orchestration의 project command 경계로 수렴시켰다.
- `layout_annotations_export.pcal`의 로컬 project 값은 authoritative commit owner가 아니라 `ReadActiveProject()`에서 다시 읽는 projection으로 사용한다.
- merge/split 등의 candidate 계산과 project commit을 분리했다. candidate/precondition 계산은 domain pseudocode에 남고 authoritative commit은 projectEFSM command가 소유한다.
- renderer/interface effect는 이 모듈의 project mutation과 합치지 않았다.

## 일반 코딩 원칙 대조

- 계산과 상태 변경 분리: candidate/normalize 단계와 command commit을 구분했다.
- single source of truth: layout module이 별도 project authority로 commit하지 않는다.
- 최소 구현: 기존 application/projectEFSM 경계를 재사용하고 별도 mutation bus나 generic patch layer를 추가하지 않았다.
- 중복 금지: 같은 caption/label owner의 세부 field는 기존 settings command로 통합했다.

## 구체화 수준

Source Code 구현자는 새 persistent command나 owner를 발명할 필요 없이 r8의 command dispatch와 candidate/validation 순서를 그대로 구현할 수 있다.

## 하위 단계

verification r19는 r8 lineage가 아니므로 stale다. 다음 단계에서 r8에서 verification model을 다시 파생하고 TLC를 실행한다.

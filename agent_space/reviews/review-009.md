# review-009 — pre-Mantine 복구 후 migration patch 재적용 감사

## 목적

`plan-006`에 따라 pre-Mantine source를 복구하고 `20260906-036`에서 JavaScript/Plotly를 다시 분리한 뒤, 복구로 빠진 `20260906-001~035` 변경 중 **Mantine migration helper가 아니라 현재 main에 독립적으로 다시 적용해야 할 실제 기능 수정이 있는지** 판정한다.

판정은 다음 네 종류만 사용한다.

- `재적용`: 기존 patch 의미를 현재 main에 다시 적용해야 함
- `재구현`: 목적은 필요하지만 현재 구조에서 새 patch로 다시 구현
- `폐기`: 잘못된 migration 구조이거나 현재 목표에 불필요
- `보류`: Mantine UI를 실제 구현할 때 기능 요구사항으로 다시 판단

## 기준 상태

현재 main application source는 pre-Mantine 기준점 `5e9fecc2f2007b6dc63659acbd115220846e5bc2`에서 복구되었고, application JavaScript는 `20260906-036`에서 byte-preserving split을 다시 수행했다.

현재 `fast-figure.js`의 `APP_BUILD`는 `1.1.29-alpha`다.

중요하게, Mantine 계획 중 별도 실제 결함으로 취급했던 slot-content 구조 개선은 이미 이 기준점에 포함되어 있다.

현재 source에서 확인됨:

- `ProjectObject` 생성/초기화에서 `normalizeSlotContents(...)` 사용
- `normalizeSlotContent(...)` 존재
- `slot.content` canonical movable state 구조 존재
- `swapSlotContents(source, target)`는 직접 필드 swap이 아니라 `appFSM.send("SLOTS_SWAPPED", ...)` 경로 사용

따라서 caption 누락을 포함한 과거 `swapSlotContents()` 문제를 위해 후대 migration patch를 다시 가져올 필요가 없다.

---

## 판정표

| patch | 실제 역할 | Mantine 독립 가치 | 판정 | 이유 |
|---|---|---:|---|---|
| 20260906-001 | 후대 source의 JS/Plotly/Mantine runtime 분리 | 있음: source split 자체 | 재구현 완료 | pre-Mantine source에서 `036`으로 다시 분리함 |
| 20260906-002~005 | split/portable build 보정 과정 | 있음: portable build | 재구현 완료 | 중간 실패 patch를 replay하지 않고 `036`에서 byte-identical builder로 재구현 |
| 20260906-006 | split 후 built-in README 위치 설명 | 문서만 | 보류 | React/Mantine runtime이 아직 없으므로 현재 문구를 그대로 적용하면 사실과 달라짐 |
| 20260906-007 | `006` 재적용 | 문서만 | 보류 | 같은 이유. 최종 source 구조가 정해진 뒤 README를 다시 씀 |
| 20260906-008 | lifecycle/overlay helper를 legacy active 경로와 통합 | 없음 | 폐기 | 이미 존재하던 UI FSM/EFSM 위 migration helper를 공통화하기 위한 변경 |
| 20260906-009 | workspace domain helper와 legacy wrapper 연결 | 없음 | 폐기 | Mantine cutover용 이중 경계를 legacy active path에 연결하는 준비 작업 |
| 20260906-010 | CSV header command에서 legacy form sync 분리 | 조건부 | 보류 | 현재 legacy UI에는 불필요. Mantine CSV control 구현 시 실제 기존 command가 DOM에 묶여 있으면 최소 command 추출 여부를 그때 판단 |
| 20260906-011 | image settings command에서 legacy form sync 분리 | 조건부 | 보류 | 동일. 실제 Mantine image form 구현 시 필요성 판단 |
| 20260906-012 | layout command에서 legacy controls sync 분리 | 조건부 | 보류 | layout Mantine 구현 시 기존 renderer/command 호출 경계를 보고 필요한 최소 수정만 재작성 |
| 20260906-013 | legacy UI infrastructure 초기화 wrapper | 없음 | 폐기 | legacy owner와 Mantine owner를 병행하기 위한 cutover 준비 경계 |
| 20260906-014 | workspace domain/presentation wrapper 분리 | 없음 | 폐기 | UI FSM/EFSM이 이미 분리된 구조에 migration wrapper를 추가한 작업 |
| 20260906-015 | overlay domain/presentation wrapper 분리 | 없음 | 폐기 | 동일 |
| 20260906-016 | lifecycle domain/presentation wrapper 분리 | 없음 | 폐기 | 동일 |
| 20260906-017 | `auditApp`의 legacy-control owner 옵션 | 없음 | 보류 | 현재는 legacy control 검사가 맞다. 실제 cutover 시 audit 대상을 Mantine shell 기준으로 직접 재설계해야 하며 기존 옵션 patch를 그대로 가져오지 않음 |
| 20260906-018 | FFPX import/export owner-independent bridge | 파일 기능 자체는 기존에 존재 | 보류 | FFPX 기능 수정이 아니라 Mantine에서 legacy UI를 거치지 않기 위한 호출 경계. 실제 FileButton 구현 시 기존 parser/writer를 직접 호출할 방법을 확인 |
| 20260906-019 | label preview target isolation | 조건부 | 보류 | pre-Mantine 단일 preview에는 필요 없음. Mantine Label UI 구현 시 기존 renderer가 explicit target을 필요로 하면 renderer target interface로 재구현 |
| 20260906-020 | sidebar parity compatibility host | 없음 | 폐기 | legacy DOM을 Mantine shell 안으로 옮기는 compatibility 구조이며 최종 목표와 직접 충돌 |
| 20260906-021 | Mantine native asset tree staging | UI 구현 참고 가치 | 보류 | bridge 코드는 replay하지 않고, asset tree 기능 inventory 후 Mantine component를 직접 다시 구현 |
| 20260906-022 | CSV/image asset selection domain/presentation split | 조건부 | 보류 | 실제 Mantine tree selection 구현 시 기존 UI FSM/command를 직접 호출하고 필요한 경우에만 기능 command 추출 |
| 20260906-023 | Mantine asset tree drag/drop bridge/staging | UI 구현 참고 가치 | 보류 | drag/drop 기능은 반드시 재구현하지만 migration bridge는 재사용하지 않음 |
| 20260906-024 | status runtime source-of-truth + Mantine staging | 조건부 | 보류 | status의 실제 authority가 DOM인지 Mantine 구현 시 확인. 별도 bridge/store를 선행 도입하지 않음 |
| 20260906-025 | UI palette Mantine staging | UI 구현 참고 가치 | 보류 | persisted palette authority는 기존 project appearance. Mantine controls를 그 상태에 직접 연결하도록 재구현 |
| 20260906-026 | debug UI source-of-truth + Mantine staging | 조건부 | 보류 | debug 기능은 유지하되 migration store/bridge를 그대로 replay하지 않음 |
| 20260906-027 | generic Mantine confirmation + trash empty | UI 기능 참고 가치 | 보류 | confirmation 기능은 Mantine으로 구현하되 legacy adapter/bridge 없이 기존 command에 직접 연결 |
| 20260906-028 | generic Mantine text input modal + new folder | UI 기능 참고 가치 | 보류 | 폴더 생성 기능 보존. Mantine input dialog에서 기존 VFS/FSM command 직접 사용 |
| 20260906-029 | slot reset Mantine confirmation | UI 기능 참고 가치 | 보류 | async modal에서 stale slot 방지는 다시 필요한 요구사항이지만 pre-Mantine blocking `confirm`의 버그가 아님. Mantine 구현 시 다시 적용 |
| 20260906-030 | CSV/image delete Mantine confirmation | UI 기능 참고 가치 | 보류 | 기존 cascade semantics를 inventory로 보존하고 Mantine dialog에서 직접 구현 |
| 20260906-031 | drag-to-trash Mantine confirmation | UI 기능 참고 가치 | 보류 | async confirm 후 VFS 재검증 요구는 Mantine 구현 시 재적용. 현재 legacy blocking confirm에는 필요 없음 |
| 20260906-032 | import collision read-model/resolver 분리 | 없음(현재) | 보류 | replace/rename 기능은 기존에 존재. Mantine choice UI를 구현할 때 기존 import 경계가 비동기 선택을 지원하지 못하면 최소 재구현 |
| 20260906-033 | Mantine choice dialog/file loader 연결 | UI 구현 참고 가치 | 보류 | Mantine 포팅 단계에서 직접 재구현 |
| 20260906-034 | external asset-tree drop을 async choice와 연결 | UI 구현 참고 가치 | 보류 | Mantine 포팅 단계에서 직접 재구현 |
| 20260906-035 | README source-of-truth 분리 시도 | 적용되지 않음 | 폐기/재구현 | 실패한 patch를 복구할 이유 없음. README Mantine 구현 시 canonical static source를 그때 결정 |

---

## 핵심 결론

### 지금 즉시 application source에 다시 적용할 후대 기능 patch는 없음

`20260906-001~035` 중 현재 pre-Mantine main에 **즉시 다시 적용해야 하는 독립 기능/버그 수정은 확인되지 않았다.**

- source split/portable build는 `036`으로 이미 새로 구현했다.
- 실제 slot-content/swap 결함 수정은 rollback 기준점 이전에 이미 포함되어 있다.
- `008~017`의 핵심은 Mantine cutover를 위한 helper/wrapper/owner boundary다.
- `018~034`는 대부분 Mantine UI가 기존 기능을 호출하기 위한 staging/bridge 또는 Mantine용 dialog/tree 기능이다.
- 이들의 **사용자 기능 요구사항은 버리지 않지만 코드 patch는 replay하지 않는다.**

### 보류는 기능 폐기가 아님

`보류` 항목은 Mantine UI 구현 시 반드시 inventory와 대조한다.

예를 들어 다음 요구는 그대로 유지한다.

- CSV header 편집
- image fit/scale/x/y
- layout apply/preview/merge/split
- FFPX import/export
- label preview/drag
- asset tree/drop
- status/debug/palette
- confirmation/input/choice dialog
- delete/reset cascade
- import collision replace/rename

단, 구현은 `Mantine → migration bridge → legacy DOM`이 아니라 기존 UI FSM/기능 command에 직접 연결한다.

---

## 다음 단계

1. `20260906-037`에서 split-source patch workflow를 현재 pre-Mantine 구조에 맞춘다.
2. 별도 후대 application patch 재적용 없이 React/Mantine runtime vendoring 단계로 이동한다.
3. runtime 도입 뒤 legacy UI 기능 inventory를 실제 source 기준으로 작성한다.
4. inventory를 기준으로 Mantine UI를 직접 포팅한다.

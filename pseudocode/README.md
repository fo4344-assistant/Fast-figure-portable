# Fast Figure PlusCal pseudocode r17

이 디렉터리의 활성 `.pcal` 파일은 닫힌 Source Script 전체를 언어중립 실행 절차로 직접 번역한 정식 중간 개발 계층이다.

```text
Source Script
→ PlusCal pseudocode
→ Source Code
```

상태 기반 검증이 필요한 범위에서는 pseudocode와 Source Code 사이에 선택적 verification/TLC 단계가 추가된다.

```text
Source Script
→ PlusCal pseudocode
→ verification model
→ TLA+/TLC
→ Source Code
```

verification model은 pseudocode의 대체물이나 상위 권위가 아니다. 필요한 상태전이·불변식 범위를 pseudocode에서 파생한 검증 표현이다.

## 현재 lineage

- Source Script revision: r17
- Source Script fingerprint: `sha256:2fec6d0c59f9b29a3d1d824ced75db46787fb566dd81373b07812db03b357664`
- Source Script closure review: `agent_space/reviews/review-20261013-006-sourcescript-closure-r17.md`
- PlusCal pseudocode revision: r3
- pseudocode fingerprint: `sha256:459b4ea5f5eefe9cda1e27b9241e4deb379df5c5ec9e2e82b0649751b8caf898`
- translation review: `agent_space/reviews/review-20261013-007-pluscal-r17.md`
- status: current

pseudocode fingerprint는 활성 의미 파일인 `pseudocode/**/*.pcal`만 대상으로 한다. 이 README와 과거 비교용 `.md` 문서는 상태 설명/역사 자료이며 pseudocode 의미 fingerprint에 포함하지 않는다.

## 번역 원칙

활성 pseudocode는 Source Script의 module/책임 경계, Module decomposition hierarchy, authoritative state와 reference source, 입력/출력, branch와 실행 순서, 값의 생성/소비, candidate→validation→commit 경계, mutation 순서·원자성, 실패·거부·취소 의미와 lifecycle을 직접 구체화한다.

Source Script에 없는 domain state, branch, 책임, 의미 decomposition 또는 mutation source를 추가하지 않는다. 충돌할 경우 Source Script가 원천이며 pseudocode를 수정한다.

## 전체 module mapping

| Source Script | Active PlusCal | 현재 번역 |
| --- | --- | --- |
| `sourcescript/application_fsm.py` | `application_fsm.pcal` | r17 |
| `sourcescript/renderer_runtime.py` | `renderer_runtime.pcal` | r17 |
| `sourcescript/api_ui.py` | `api_ui.pcal` | r17 |
| `sourcescript/project_state.py` | `project_state.pcal` | r16에서 번역, r17에서 해당 Source Script 의미 변경 없음 |
| `sourcescript/graphs.py` | `graphs.pcal` | r17 |
| `sourcescript/assets_files.py` | `assets_files.pcal` | r17 |
| `sourcescript/layout_annotations_export.py` | `layout_annotations_export.pcal` | r16에서 번역, r17에서 해당 Source Script 의미 변경 없음 |
| `sourcescript/system.py` | `system.pcal` | r16에서 번역, r17에서 해당 Source Script 의미 변경 없음 |
| `sourcescript/portable_build.py` | `portable_build.pcal` | r16에서 번역, r17에서 해당 Source Script 의미 변경 없음 |

r17에서 일부 module 파일의 주석이 r16으로 남아 있는 것은 해당 Source Script module의 의미가 r17에서 변경되지 않았기 때문이다. 전체 pseudocode 계층은 현재 Source Script r17의 전체 번역이다.

과거 `.md` pseudocode 파일은 이전 workflow에서 작성된 비교·역사 자료이며 현재 활성 번역은 `.pcal` 파일이다.

## r17 변경 번역

r17 갱신 범위에는 selection-state-first slot interaction, dashboard background deselection, 일반 빈 CSV 생성/선택, empty CSV 생성과 graph-object mutation의 분리, trash asset selection과 row action Menu 접근의 분리, 공통 설정 Modal maximum ownership, graph object의 current CSV reference contract가 포함된다.

구체적인 DOM 측정, CSS 단위, Mantine API 호출 방식 같은 renderer/platform 구현 세부는 Source Code에서 결정한다.

## verification과의 관계

현재 `verification/`은 pseudocode 전체를 대체하지 않는다. 상태공간 검증의 가치가 있는 bounded slice를 pseudocode에서 파생하여 TLC로 검사한다.

검증 coverage에 없는 영역이 있다는 사실은 pseudocode가 불완전한 번역이라는 뜻이 아니다. Source Code의 상위 언어중립 명세는 전체 `pseudocode/**/*.pcal`이다.

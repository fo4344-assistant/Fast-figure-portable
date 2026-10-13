# Review 20261013-009 — Source Code r13 plan-009 validation

## 판정

Source Script r17과 verification-model r11에서 확정된 plan-009 의미를 Source Code r13에 반영한 뒤 GitHub-hosted runner에서 development lineage, distribution build, inline file:// regression, split ZIP file:// regression을 확인했다.

최종 판정:

```text
Source Script r17       current / closed
verification-model r11  current / TLC passed
Source Code r13         current / regression passed
```

Source Code fingerprint:

```text
sha256:a76944037f6bc203b950b889aa37a57f2d6e94ce61a4790bcfa1bcc8829c4bcb
```

derived_from:

- Source Script: `sha256:2fec6d0c59f9b29a3d1d824ced75db46787fb566dd81373b07812db03b357664`
- verification-model: `sha256:66274b5f28db2ce3ba3a509689fa2d827713ece54c71c69bbd2ce898471acf8a`

## 구현 commit

주 구현:

- commit: `0c66f7a3d3b47f6f539427eb8c96d46c68fe15d1`
- patch record: `agent_space/patches/20261013-022.patch`
- explanation: `agent_space/patches/20261013-022.md`

구현 범위:

- selection-state-first slot click dispatch
- dashboard background deselection
- 일반 빈 CSV 생성 및 current CSV selection command
- graph/data editor의 빈 CSV 삽입 control
- trash asset row selection disabled와 action Menu target enabled 분리
- Layout / Label / Caption / Print 공통 Modal maximum
- Layout preview actual rendered width 기반 geometry
- preview와 resize handle의 공통 width/alignment ownership
- APP_BUILD 1.1.33-wip
- source-code r13 lineage/fingerprint

## 실행기

사용자 지시에 따라 self-hosted runner는 사용하지 않았다.

검증에 사용한 workflow는 모두 GitHub-hosted `ubuntu-latest`다.

실행 조건 변경은 `plan-010.md`와 `20261013-021`에 기록되어 있다.

## Development layer version 검사

- workflow: Development layer versions
- run id: `38382334919`
- tested commit: `0c66f7a3d3b47f6f539427eb8c96d46c68fe15d1`
- conclusion: success

따라서 r13 source-code fingerprint와 r17/r11 derived_from 관계가 repository checker를 통과했다.

## Distribution build

- workflow: Build distribution
- run id: `38382334870`
- tested commit: `0c66f7a3d3b47f6f539427eb8c96d46c68fe15d1`
- conclusion: success
- generated artifact commit: `6f6ac92f8c4cac82e5739bfca62de19a3f8f95b8`

이후의 commit은 regression test/patch/review만 변경하므로 generated distribution의 application source 내용은 r13과 동일하다.

## Regression correction history

### 최초 r13 regression

- run id: `38382334821`
- conclusion: failure
- failure: headless Chrome timeout

실제 commit diff 재검토에서 새 empty CSV regression block이 공용 `run()` helper 내부에 잘못 삽입되어 재귀 실행되는 테스트 harness 오류를 확인했다.

교정:

- `20261013-023`
- commit: `e5cf27dc4e75bb8afe2ac58f0da72fbd215f3959`

교정 후 run `38382455279`에서 기존 1~27 regression은 inline/split 모두 통과했다.

### UI 직접 regression 추가

plan-009의 UI ownership을 직접 확인하기 위해 `20261013-024`에서 다음을 추가했다.

- Layout preview 공통 rendered width / 가운데 정렬 / rendered-width geometry
- 네 설정 overlay 공통 Modal width
- trash asset action Menu 접근

첫 실행:

- run id: `38382725246`
- conclusion: failure

실패 원인은 application이 아니라 테스트 관찰 경계였다.

- centered 판정이 preview content container가 아니라 Mantine outer content box를 기준으로 함
- Menu open 판정이 accessibility contract가 아니라 Mantine 내부 class name을 사용함

`20261013-025`에서 관찰 기준만 교정했다.

## 최종 browser regression

- workflow: Fast Figure regression
- run id: `38382915972`
- job id: `115247513903`
- tested commit: `82cc232f12d49af0fc2870cb73fe0fa80a381df4`
- conclusion: success

문법 검사:

- `node --check agent_space/tests/browser-regression.js`: passed

inline file://:

- tests 1~30: passed
- 28 layout preview rendered-width ownership: passed
- 29 settings overlays common modal width: passed
- 30 trashed asset action menu accessible: passed

split ZIP file://:

- tests 1~30: passed
- 28 layout preview rendered-width ownership: passed
- 29 settings overlays common modal width: passed
- 30 trashed asset action menu accessible: passed

workflow가 확인한 distribution 크기:

```text
inline = 6,155,698 bytes
split ZIP = 1,723,170 bytes
```

## Source of Truth 확인

새 persistent authority는 추가되지 않았다.

- slot selection: 기존 SELECT_SLOT/ApplicationStateMachine
- CSV asset: 기존 DATA_OBJECT_CREATED/activeProject csvFiles
- CSV current selection: 기존 SELECT_ASSET/graphEditorSelectCsv
- Modal maximum: 공통 renderer definition 1개
- preview requested width: UI-local interaction state
- preview actual rendered width: DOM measurement에서 단방향으로 얻는 renderer projection

requested width와 measured width 사이의 양방향 동기화나 별도 project state는 없다.

## plan-009 대응

검증된 항목:

- 미선택 graph/image/empty slot surface selection
- selected graph/image content pass-through
- bookmark toggle
- selected empty slot toggle
- dashboard background deselection
- bookmark drag click suppression 기존 회귀 유지
- empty CSV 생성/선택
- empty CSV 생성 시 chart/object 자동 mutation 없음
- trash asset Menu target 접근
- 설정 overlay 공통 폭
- Layout preview 가운데 정렬
- preview/handle 공통 rendered width
- rendered width 기반 preview height/geometry
- distribution 재생성
- development layer version chain

README Modal은 공통 설정 Modal width 대상에서 제외된 상태를 유지한다.

## 남은 범위

이번 review는 plan-009에서 정의한 Source Code r13 구현과 자동 회귀를 닫는다.

pixel-level 시각 품질이나 사람이 판단해야 하는 미세한 미관 차이는 자동 regression의 판정 범위가 아니다.

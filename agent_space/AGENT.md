# AGENT.md

## 작업 원칙

- 사용자의 의도를 추측하지 말 것.
- 모든 수정은 반드시 diff 패치 파일로 기록할 것.
- 각 diff 패치에는 해당 패치의 설명 문서를 함께 작성할 것.
- 설명 문서에는 다음 내용을 반드시 기록할 것.
  - 패치의 목적과 변경 내용
  - 해당 방향을 선택한 이유
  - 고려했지만 선택하지 않은 다른 방향과, 그 방향을 선택하지 않은 이유
- diff 패치 파일과 설명 Markdown 파일은 같은 이름으로 쌍을 이루도록 할 것. 확장자만 각각 패치 형식과 `.md`로 구분할 것.
- 패치 쌍의 기본 이름은 `YYYYMMDD-NNN` 형식을 사용할 것.
  - `YYYYMMDD`는 패치를 기록한 날짜다.
  - `NNN`은 해당 날짜 안에서의 3자리 순번이며 `001`부터 증가한다.
  - 파일 이름에는 변경 내용, 기능명, 모듈명, 구현 방식 같은 의미 정보를 넣지 말 것.
  - 순번은 기록의 시간적 순서를 나타내는 메타정보로만 사용할 것.
- 실제 diff 패치에 포함되지 않은 관련 변경사항, 전제, 후속 작업 또는 누락 사항이 있더라도 설명 Markdown에는 반드시 기록할 것.
- 프로젝트에서 정한 이름 명명 규칙을 어기지 말 것.
- 같은 기능 자유도와 구현 자유도를 얻을 수 있다면 가능한 한 최소 복잡도의 코드를 작성할 것.
- 최소 복잡도 원칙은 반드시 단순한 코드를 작성하라는 뜻이 아니다.
- 알고리즘 복잡도의 증가보다 더 큰 기능 자유도, 구현 자유도 또는 확장 자유도를 얻을 수 있다면 더 복잡한 구조를 채택할 수 있으며, 그 경우 해당 방향을 우선 검토할 것.
- 모든 영속 상태와 기능 의미에는 유일한 source of truth만 둘 것. 같은 사실을 둘 이상의 상태, 객체, DOM 값, 캐시 또는 별도 모델이 독립적으로 소유하게 만들지 말 것.
- source of truth를 읽거나 변경하기 위해 만든 snapshot, draft, cache, selector 결과, adapter-local value 등 임시값은 해당 작업 범위 안에서만 사용할 것. 다른 기능이나 다른 로직이 그 임시값을 다시 참조하거나 권위 상태처럼 사용하게 만들지 말 것.
- 임시값을 여러 부분에서 공유해야 한다면 임시값 자체를 공유하지 말고 원래 source of truth에서 다시 읽거나, 정말 공용 상태가 필요한 경우 하나의 명시적인 source of truth로 승격할 것.
- source of truth와 임시값 사이를 양방향으로 동기화하거나 어느 쪽이 최신인지 판정해야 하는 구조를 만들지 말 것.

## GitHub 저장소 작업 방식

- 연결된 GitHub 저장소의 일반적인 파일 수정은 GitHub Contents API에 대응하는 파일 단위 경로를 우선 사용할 것.
  - 기존 파일은 먼저 현재 branch의 파일 내용을 읽고 blob SHA를 확인한 뒤 `update_file` 방식으로 교체한다.
  - 새 파일은 대상 경로가 존재하지 않는지 확인한 뒤 `create_file` 방식으로 생성한다.
  - 같은 경로의 update/delete를 병렬로 실행하지 말고 순차적으로 처리한다.
- 일반 수정에서 `create_blob → create_tree → create_commit → update_ref` 같은 저수준 Git Data API 경로를 기본 쓰기 방식으로 사용하지 말 것.
  - 저수준 Git 객체 생성은 Contents API로 표현할 수 없는 명시적 필요가 있거나, 쓰기 경로 자체를 진단해야 하는 경우에만 제한적으로 검토한다.
  - 진단용 blob/tree/commit을 만들더라도 branch ref에 연결하지 않는 비파괴 검사를 우선한다.
  - branch ref를 실제로 이동해야 할 때는 현재 HEAD와 expected SHA를 다시 확인하고, stale ref를 강제로 덮어쓰지 말 것.
- 저장소에 쓰기 직전마다 현재 branch HEAD를 다시 확인할 것.
  - 작업 시작 시 읽었던 HEAD와 달라졌다면 기존 계획을 그대로 쓰지 말고 최신 상태를 다시 읽어 이미 완료된 작업과 충돌 여부를 판단한다.
  - 대상 기존 파일은 쓰기 직전에 현재 blob SHA도 다시 확인한다.
  - 새 patch/plan/review 파일은 쓰기 직전에 대상 경로와 해당 날짜 순번이 아직 비어 있는지 다시 확인한다.
- 여러 파일로 이루어진 하나의 coherent 변경을 Contents API로 수행할 때는 파일을 순차적으로 반영하고 각 write 뒤 새 HEAD를 다음 write의 기준으로 사용할 것.
  - Contents API의 파일 단위 commit을 하나의 원자적 multi-file commit인 것처럼 설명하지 말 것.
  - 해당 변경의 최종 patch 기록은 변경 시작 기준 HEAD부터 의미 변경이 끝난 HEAD까지의 실제 누적 diff를 기준으로 작성하여, 물리적으로 여러 commit에 나뉘어도 하나의 rollback 가능한 변경 단위를 추적할 수 있게 한다.
  - 기존 정책이 특정 산출물을 같은 commit에 요구하지만 현재 사용 가능한 GitHub 쓰기 경로로 이를 만족시킬 수 없다면, 충족했다고 주장하지 말고 그 제한과 실제 기록 방식을 설명 문서에 명시한다.
- concurrent run 또는 다른 작업자가 같은 저장소를 변경할 가능성이 있으면 변경 전후의 HEAD, 관련 plan/patch/review, `development-versions.json`을 다시 읽어 중복 작업을 피할 것.
  - 이미 같은 단계가 완료되었으면 새 patch나 review를 중복 생성하지 않는다.
  - 동시 작업 여부를 안전하게 구분할 수 없으면 stale 상태에서 쓰지 말고 재조회한다.
- GitHub Actions는 사용자가 해당 작업에서 명시적으로 허용한 경우에만 실행할 것. workflow 존재 여부나 과거 run을 읽는 것과 새 workflow run을 시작하거나 재실행하는 것은 구분한다.
- 로컬 `git clone`, 테스트, version checker 또는 빌드가 실행 환경의 네트워크·파일 접근 제한 때문에 실제로 실행되지 않았다면, GitHub tree/blob를 이용한 원격 대조를 실제 로컬 명령 실행 성공으로 표현하지 말 것.
  - 원격 tree/blob 기반으로 동일한 fingerprint나 정적 조건을 재계산할 수는 있지만, 실제 명령을 실행한 검증과 구분하여 기록한다.
- 저장소 외부의 추측된 파일명, branch명, API 이름, workflow 입력값을 만들어내지 말고 현재 저장소 내용이나 GitHub 도구가 반환한 실제 식별자를 사용한다.

## 정책 원천

- Source Script, PlusCal pseudocode, 선택적 TLA+/TLC verification model, 대상 언어 구현의 작성·검토 원칙은 `agent_space/policies/source-script-policy.md`를 상위 정책 원천으로 사용한다.
- 해당 정책 원문은 사용자가 명시적으로 정책 변경을 지시한 경우에만 수정한다.
- 프로젝트 고유의 데이터 구조, 책임 배치, 식별자, 파일 형식, 해결 방안은 정책 문서에 추가하지 않고 `sourcescript/`, `agent_space/plans/`, `agent_space/docs/` 중 해당 책임 경로에 기록한다.

## Source Script 변경 기록

- `sourcescript/`의 모든 수정에도 application source와 동일한 변경 기록 원칙을 적용한다.
- Source Script를 수정하는 변경에는 같은 commit 안에 `agent_space/patches/YYYYMMDD-NNN.patch`와 같은 basename의 `.md` 설명 문서를 새로 추가한다.
- patch 파일에는 실제 `sourcescript/` 변경 diff를 반드시 포함한다. Source Script revision/fingerprint가 바뀌면 `development-versions.json` 변경도 같은 patch에 기록한다.
- 설명 Markdown에는 일반 패치 설명 요건에 더해 다음을 기록한다.
  - Source Script 변경을 발생시킨 요구, 검증 결과 또는 하위 단계 발견 사항
  - 변경되는 알고리즘 의미, 책임 경계, 상태/참조 관계
  - 선택한 해결 방향과 기각한 대안
  - 닫힘 판정에 미치는 영향
  - pseudocode와 source code에 다시 전파해야 하는 범위
- 하위 단계 검증에서 Source Script로 되돌아온 수정이면, 이전 닫힘 판정에서 무엇을 놓쳤는지와 그 원인을 설명 문서에 함께 기록한다.
- Source Script diff와 설명 문서가 없는 변경은 완료된 Source Script revision으로 취급하지 않는다.
- Source Script 변경 기록을 위해 별도의 중복 이력 체계를 만들지 않고 기존 `agent_space/patches/`를 유일한 변경 기록 경로로 사용한다.

## WIP 포팅 및 통합 작업

- 기존 구현을 다른 UI 프레임워크, 런타임, 모듈 구조 또는 공통 컴포넌트 체계로 포팅하거나, 분산된 구현을 하나의 일관된 구조로 통합하는 작업에서는 개별 단계가 당장 완전히 동작하는지보다 최종 구조의 일관성, 독립성, source of truth의 명확성을 우선할 것.
- 이러한 작업은 필요하면 `wip` 버전으로 명시하고, 중간 단계에서 일부 기능이 일시적으로 불완전하거나 legacy UI와 새 UI가 공존하는 것을 허용할 것. 중간 상태의 완전한 사용 가능성을 유지하기 위해 최종 구조와 맞지 않는 임시 계층을 추가하지 말 것.
- 특히 새 구현이 기존 DOM control, legacy dialog, 숨은 input, `.click()`, `.value`, 임시 bridge 또는 중복 상태를 통해 기존 구현을 우회 호출하도록 만들지 말 것. 최종 구조에서 직접 사용할 source of truth, 명시적 command, EFSM/UI-FSM event, renderer 경계를 우선 사용할 것.
- 필요한 command 추출, state ownership 정리, renderer-neutral 경계 생성은 해당 ownership 단위의 포팅과 같은 변경 안에서 함께 수행할 것. 이를 별도의 선행 조사·준비·중간 패치로 반복 분리하지 말 것.
- 일관성이 요구되는 기능군은 가능한 한 하나의 coherent ownership 단위로 구현할 것. 예를 들어 같은 editor 또는 overlay의 입력, 상태 변경, validation, preview, apply/reset, keyboard/focus 규칙을 서로 다른 임시 구조로 나누기보다 하나의 공통 UI 체계 안에서 함께 옮길 것.
- WIP 단계에서는 기능 등가성 검증, legacy 제거, 세부 interaction parity, 시각적 미세 조정을 구현 진행의 선행 조건으로 삼지 말 것. 주요 기능 면적과 올바른 구조를 먼저 구현한 뒤, 후속 parity/cutover 단계에서 한꺼번에 검증하고 정리할 것.
- 다만 WIP를 이유로 영속 데이터 손상, schema 불일치, 잘못된 source of truth, 되돌리기 어려운 migration을 허용하지 말 것. 중간 버전이 불완전할 수는 있어도 구조적 책임 경계와 rollback 가능성은 유지할 것.
- WIP 단계에서 기존 기능을 의도적으로 임시 중단하거나 불완전하게 만드는 경우, 해당 패치 설명 Markdown에 그 범위와 이유, 후속 완료 조건을 명시할 것.

## 개발 계층 버전 우선순위

- 개발 의미의 기본 권위 순서는 반드시 `Source Script > PlusCal pseudocode > source code`로 유지할 것.
- 상태 기반 검증을 사용하는 범위에서는 `Source Script > PlusCal pseudocode > verification-model/TLC > source code` 순서로 선택적 검증 단계를 삽입한다.
- PlusCal pseudocode는 Source Script 전체를 언어중립 실행 절차로 직접 번역한 정식 중간 계층이다. verification 전용 산출물이나 legacy reference로 취급하지 말 것.
- verification-model은 PlusCal pseudocode에서 필요한 검증 범위를 파생한 표현이며 별도의 설계 권위를 갖지 않는다.
- 현재 Fast Figure 프로젝트는 verification-model/TLC gate를 사용하므로 application source code가 `current`가 되려면 현재 pseudocode에서 파생된 verification-model이 `current`이고 TLC가 `passed`여야 한다.
- 계층 버전과 파생 관계의 단일 메타데이터 원천은 저장소 루트의 `development-versions.json`으로 둘 것.
- `development-versions.json`은 의미 자체를 정의하는 문서가 아니라 각 계층의 revision, 실제 의미 파일 fingerprint, 상위 계층 파생 버전을 기록하는 lineage metadata다.
- Source Script는 항상 최상위 권위 계층이다. 하위 계층과 의미가 충돌하면 Source Script를 기준으로 pseudocode부터 순서대로 다시 전파할 것.
- Source Script의 의미 파일이 바뀌면 source-script revision과 fingerprint를 갱신할 것. PlusCal pseudocode는 새 Source Script를 직접 번역하고 번역 충실도와 구체화 수준을 확인하기 전까지 `current`가 될 수 없다.
- PlusCal pseudocode를 생성하거나 수정할 때는 현재 Source Script fingerprint를 `derived_from.source-script`에 기록하고 pseudocode revision을 증가시킬 것. 활성 pseudocode 의미 파일은 `pseudocode/**/*.pcal`이다.
- verification-model을 생성하거나 수정할 때는 현재 PlusCal pseudocode fingerprint를 `derived_from.pseudocode`에 기록하고 verification-model revision을 증가시킬 것. 현재 프로젝트에서는 추적성을 위해 `derived_from.source-script`도 함께 기록한다. TLC가 `passed`가 되려면 validation review가 있어야 한다.
- application source code를 수정할 때는 현재 Source Script와 PlusCal pseudocode의 lineage를 모두 기록한다. verification-model/TLC를 사용한 범위에서는 current/passed verification-model lineage도 함께 기록하고 source-code revision을 증가시킬 것.
- 현재 동작하는 source code가 있더라도 최신 Source Script → PlusCal pseudocode → verification-model/TLC lineage가 확인되지 않으면 설계 계층에서는 `stale`로 취급할 것. 실행 가능성과 계층 최신성은 같은 의미가 아니다.
- 하위 계층의 구현 편의 때문에 상위 계층을 암묵적으로 수정하지 말 것. source code에서 새 의미가 필요하다고 판단되면 필요한 상위 단계로 돌아가고 Source Script 변경이 필요하면 Source Script부터 다시 닫은 뒤 pseudocode와 하위 계층에 순서대로 전파할 것.
- `scripts/check-development-layer-versions.py` 검사를 통과하지 않은 계층 버전 변경은 완료로 취급하지 말 것.
- main의 CI는 Source Script, PlusCal pseudocode, verification-model, application source, 정책 또는 version metadata가 변경될 때 version chain을 검사해야 한다.

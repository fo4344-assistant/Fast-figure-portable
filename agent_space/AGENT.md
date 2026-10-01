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

## 정책 원천

- Source Script, pseudocode, 대상 언어 구현의 작성·검토 원칙은 `agent_space/policies/source-script-policy.md`를 상위 정책 원천으로 사용한다.
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

- 개발 의미의 권위 순서는 반드시 `Source Script > pseudocode > source code`로 유지할 것.
- 계층 버전과 파생 관계의 단일 메타데이터 원천은 저장소 루트의 `development-versions.json`으로 둘 것.
- `development-versions.json`은 의미 자체를 정의하는 문서가 아니라 각 계층의 revision, 실제 내용 fingerprint, 상위 계층 파생 버전을 기록하는 lineage metadata다.
- Source Script는 항상 최상위 권위 계층이다. pseudocode 또는 source code와 의미가 충돌하면 Source Script를 기준으로 하위 계층을 수정할 것.
- Source Script의 의미 파일이 바뀌면 source-script revision과 fingerprint를 갱신할 것. 기존 pseudocode와 source code는 새 Source Script fingerprint를 정확히 반영하기 전까지 `current`로 표시하지 말 것.
- pseudocode를 생성하거나 수정할 때는 현재 Source Script fingerprint를 `derived_from.source-script`에 기록하고 pseudocode revision을 증가시킬 것. 최신 Source Script와 정확히 일치하지 않는 pseudocode는 `current`가 될 수 없다.
- application source code를 수정할 때는 pseudocode가 먼저 `current`여야 하고, source code의 `derived_from.source-script`와 `derived_from.pseudocode`가 각각 현재 상위 계층 fingerprint와 정확히 일치해야 한다. source-code revision도 증가시킬 것.
- 현재 동작하는 source code가 있더라도 최신 pseudocode에서 내려온 lineage가 확인되지 않으면 설계 계층에서는 `stale`로 취급할 것. 실행 가능성과 계층 최신성은 같은 의미가 아니다.
- 하위 계층의 구현 편의 때문에 상위 계층을 암묵적으로 수정하지 말 것. source code에서 새 의미가 필요하다고 판단되면 Source Script 단계로 돌아가 먼저 반영하고 version chain을 다시 아래로 전파할 것.
- `scripts/check-development-layer-versions.py` 검사를 통과하지 않은 계층 버전 변경은 완료로 취급하지 말 것.
- main의 CI는 Source Script, pseudocode, application source 또는 version metadata가 변경될 때 version chain을 검사해야 한다.

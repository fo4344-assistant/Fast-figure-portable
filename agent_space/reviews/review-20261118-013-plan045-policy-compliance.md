# Plan045 작업 정책 및 Source Script 양식 준수 검토

대상은 커밋 `744d1dd17dd71afc9ef01d5e99afc2985dd6dfd8`의 Plan045 변경이다. `AGENT.md`, 개발 정책 v0.2.6 전체, 저장된 Source Script 예시, Plan045, Source Script 패치 `20261118-007.patch` 전체를 읽었다. 관련 pseudocode·source code 호출부, 계층 메타데이터, 버전 검사 절차를 정적으로 대조했다. 기존 전체 프로젝트에 대한 재검토는 이번 범위에 포함하지 않았다. 아래 경로는 저장소 루트 기준이다.

## 판정

**준수하지 않은 부분이 있다.** 가장 큰 문제는 Source Script를 열린 상태로 둔 채 하위 두 계층을 변경한 것이다. Source Script 안에도 반환값의 생성이 빠진 절차와 서로 다른 구독 규칙이 남아 있다. 세 계층의 수정 순서, 패치·설명 문서의 존재, 빌드 성공은 각각 확인할 수 있으나 닫힘 판정이나 계층 버전 검사 통과를 대신하지 않는다.

## 작업 정책

| 항목 | 근거와 판정 |
|---|---|
| 계층 진행 조건 미충족 | 개발 정책 §1.1·§4.6·§5.1·§7.2는 Source Script 닫힘 판정 뒤 직접 번역하고, 확인된 pseudocode로 구현하도록 요구한다. `development-versions.json:11–18,32–34,66–68`에서 Source Script 57은 `open`이고 닫힘 검토는 `null`, pseudocode 34와 source code 163은 `stale`이다. `scripts/check-development-layer-versions.py:473–483,513–518`은 두 하위 계층이 바뀐 경우 이 상태를 거부한다. CI 설정 `.github/workflows/development-layer-version.yml`은 변경 기준이 있을 때 `--base`를 사용한다. 이 판정은 코드 조건을 대조한 결과이며 checker 실행 결과를 보고하는 것이 아니다. 선택 사항인 TLC 미실행과도 별개다. |
| 패치 설명 미흡 | Source Script 변경과 버전 정보가 같은 커밋의 `agent_space/patches/20261118-007.patch`에 있고, 세 단계 모두 같은 basename의 설명이 있다. 다만 `20261118-007.md:4–12`는 전체 복사·공용 저장소·새 위젯을 채택하지 않았다고만 적고 각 대안을 제외한 이유와 Source Script 닫힘 판정에 미친 영향을 명시하지 않았다. `20261118-008.md:4`는 전체 결과를 잘라 쓰는 대안의 비용을 기록했다. `20261118-009.md:3–12`는 구현 방향과 범위를 적었으나 기각한 대안과 이유가 없다. `AGENT.md:7–18,65–78`의 기록 요건에 미달한다. |
| 단일 소유권·변경 경계 | 검토한 경로에서 현재 Project의 조회·변경은 기존 Backend 책임에 남아 있다. `sourcescript/backend/project_state.py:322–337,404–410`의 참조 집계와 중첩 읽기 전용 처리는 호출 안에서 끝난다. `sourcescript/frontend/mantine_ui.py:245–252`는 같은 판정에서 얻은 식별자·동반 값만 기존 API에 전달하고 Backend 재검증을 명시한다. 이 경로에서 별도 Project 쓰기 원천이나 구독 결과를 명령 원본으로 돌려쓰는 위반은 확인하지 못했다. |
| 조회 범위·실행 근거 | `agent_space/plans/plan-045.md` §3.3·§7은 실제 표시 소비자에게 열·미리보기 계산을 제한하고 후속 측정을 요구한다. `sourcecode/frontend/mantine_ui.js:1652–1654,1694–1713`은 그래프 데이터 편집기가 표시되면 CSV와 선택 object에 대한 열 조회를 각각 수행한다. 열린 표를 별도로 판정하지 않고 CSV·열 존재만으로 표와 미리보기를 구성한다. 두 역할의 CSV가 같을 때도 같은 열을 다시 구한다. 이는 Source Script의 닫힌 미리보기 조건(`sourcescript/frontend/mantine_ui.py:784–788`)과 계획의 비용 제한을 구현에서 충분히 보존하지 못한 정적 근거다. 실제 호출 횟수와 지연 효과는 측정하지 않았다. |

## Source Script 양식과 절차

예시는 지역변수에는 값의 의미만 정의하고, `Args`·`Return`에서는 필요한 형태와 참조 원천을 설명한다. `변경`은 실제 변경 대상을 적고, `처리`는 입력에서 명시적 `return`까지 값이 어떻게 이어지는지 보여 준다. 이미 정의한 단순 인자를 반복 설명할 필요는 없다. 이 기준으로 수정된 절차에서 다음을 확인했다.

| 확인 사항 | 근거와 판정 |
|---|---|
| 반환값을 만들지 않는 절차 | `sourcescript/frontend/mantine_ui.py:175–198,200–223,278–301`에서 `commit`·`send`·`step`은 `outcome`을 설명 문자열로 정의한다. `send`는 처리에서 호출 결과를 직접 반환한다고 쓰고 끝에서는 `return outcome`을 사용한다. `commit`·`step`에는 `_sendCurrent` 결과를 `outcome`에 두는 단계가 없다. `sourcescript/application/public_api/__init__.py:70–91`의 `readGraphControls`도 `current`에 현재 상태를, `controls`에 공식 조회 결과를 두는 연결이 명시되지 않았다. `sourcescript/application/public_api/layout_annotations.py:228–247,348–428`의 `readLayoutApiControls` 및 grid/merge/split도 조회 결과를 만들거나 반환 변수에 넣는 단계가 빠졌다. 반환의 형태를 적는 것과 그 값을 만드는 절차는 구분해야 한다. §4.2·§4.5·§4.6의 문제다. |
| 같은 구독의 기준이 두 가지 | `sourcescript/frontend/mantine_ui.py:439–479`에서 `getAppStateSnapshot`과 `useAppState`는 전체 revision을 구독한다. 같은 파일 `:918–921`은 `FastFigureApp`이 구조 표시 키만 구독한다고 정한다. 담당 함수에 구성 필드와 반환 흐름을 연결하지 않아 동일한 화면 구독에 대한 두 서술이 남았다. pseudocode `pseudocode/frontend/mantine_ui.pcal:271–288`와 source code `sourcecode/frontend/mantine_ui.js:413–424`에서 구조 키를 구체화했어도 상위 절차의 불일치는 남는다. |
| 인수·반환 구조를 찾기 어려움 | `sourcescript/frontend/mantine_ui.py:115–143,225–240`의 `readCurrent` 결과에는 `target/value/companions/ready`가 필요하다. `_sendCurrent`의 `current` 설명은 그 함수의 반환이라고만 쓰며, `companions`는 예시가 있을 뿐 기능별 실제 형태를 가리키는 경로가 없다. `sourcescript/backend/project_state.py:262–285,379–410`의 신규 조회 역시 공용 `request`와 `projection`을 선언한 뒤 신규 operation의 입력·누락 조건·반환 필드를 한 처리 목록에 섞어 둔다. 특히 `graphs.readControls`의 `currentCsv` 형태는 `graphs.readData`의 필드 정의를 따르는지 명시해야 한다. 구조가 의미에 중요한 경우 기존 원형 또는 해당 계약을 명시적으로 연결하는 예시 및 §4.3·§4.5와 차이가 있다. |
| 판단과 자료 구성의 구분은 유지된 사례 | `sourcescript/frontend/mantine_ui.py:89–110`의 `readAssetRowDisplay`는 기존 지역변수 정의 안의 조건식을 없애고 의미만 남겼다. 참조 수를 읽고 CSV와 이미지에 따라 행 수를 정하는 일은 `처리`에서 서술한다. 변경된 이 절차의 형식은 예시와 맞는다. |

## 후속 확인 순서

1. Source Script의 공식 읽기 결과·반환 경로와 구독 기준을 먼저 하나로 명시한다. 원형·필드·원천은 실제 정의를 가리키고, 호출·판정·대입은 `처리`에 둔다.
2. 논리적 완결성·목적·중복 근거로 닫힘 여부를 다시 판정한다. 수정된 계약을 pseudocode와 source code에 순차 반영하고, 기준 커밋을 포함한 계층 버전 검사에서 실제 결과를 확인한다.
3. 열 조회와 표 미리보기의 표시 조건 및 반복 호출을 확인한다. 성능에 대한 판정에는 실제 측정 근거를 별도로 남긴다.

이번 검토에서는 Source Script, pseudocode, source code, 정책, 메타데이터 및 기존 기록을 수정하지 않았다. 앱·테스트·빌드·checker·Actions도 실행하지 않았다.

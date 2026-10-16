# Source r37 닫힘 판정 — PlusCal 번역 진입

## 기준·결론

- 사용자 요청: 현재 Source 논리 검토 후 pseudocode 번역 시작.
- 기준 HEAD `0e65d63d45d4974978b8467938b7e9b52a210c38`.
- Source r37 fingerprint `sha256:c94c310a8611c1f8994e5fe38ab5d0f8cd74ed0ecf4d902cada885d92278de5b`.
- 직접 근거: `agent_space/reviews/review-20261016-019-source-r37-logical-structure.md`. 이 문서의 전체 경로 표, 대표 경계 사례 및 실제 분리/통합 판단을 이번 닫힘 근거로 사용한다.

**Source r37을 closed로 판정한다.** 이전 검토 후 새로운 Source 의미 변경은 없다. 직전 검토가 metadata를 open으로 남긴 이유는 논리 문제가 발견되어서가 아니라 당시 변경이 검토 문서에 한정되었기 때문이다. 이번에는 사용자가 다음 계층 번역 진입을 요청했으므로 그 논리 판정을 정식 closure metadata에 연결한다.

## 정책 §4.6 세 축의 근거

1. **논리적 완결성**: create/startup→공식 public command/query→current resolve/candidate/whole validation/one commit→result/reconciliation→Frontend/render 경로를 대조했다. delete/trash cascade의 original-index map, invalid selection과 explicit none, zero-object graph/imported conversion, package-local CSV remap, failure unchanged/사후 failure, ordered-router 부분 완료가 각각 정의되어 있다. labels/captions 기본값은 settings.json에서 instance와 분리되고, caption exact-string group/append와 reference-width target height는 owner 알고리즘까지 연결된다. 새로 미정의된 고수준 의미나 차단 모순을 발견하지 못했다.
2. **프로젝트 목적 부합**: tabular/image 기반 slot figure 구성부터 graph/image/layout/annotation/export가 한 Project authority를 공유한다. copied bytes 기반 FFPX complete project, FFSX slot+CSV+caption, Plotly interchange 책임을 구별한다. selection/modal/zoom을 저장 데이터로 확장하지 않고 single-file/local 처리 목적을 보존한다.
3. **중복·통합·확장**: config와 Project는 기본값/현재 사용자 상태, 두 FSM은 persistent transaction/runtime, UI palette와 graph colors는 서로 다른 의미라 분리가 타당하다. 반대로 representation 판정·whole validation·command/reconciliation 경로는 공통 원천을 사용한다. 추가 registry/service/framework 또는 hierarchy 병합이 필요하다는 근거가 없다. 상세 검토 문서의 중복 후보별 결정 이유를 그대로 근거로 삼는다.

현재 Source/system.py의 과거 review 미완료 설명은 당시 작업 이력으로 읽으며, 현재 owner에 이미 정의된 규칙을 다시 미정의 문제로 만들지 않는다. 이번 판정은 새 알고리즘/Source 수정 없이 현재 명세 전체의 논리 검토 결과를 확정한다.

## 계층·한계

Source 의미 파일/revision/fingerprint를 바꾸지 않고 `closure=closed`, `closure_review=이 문서`만 기록한다. PlusCal r11은 아직 최신 Source 전체를 번역하지 않았으므로 stale 유지한다. verification/code stale 및 TLC pending도 유지한다.

이는 정책상 논리적 닫힘이다. 실제 구현·화면·파일 runtime round-trip의 성공 또는 PlusCal/Source Code 완료를 뜻하지 않는다. platform primitive/구체 타입/API 표현은 해당 단계에서 의미를 보존하며 구체화한다. 로컬 Source/application/PlusCal/checker/test/build/TLC를 실행하지 않았다.

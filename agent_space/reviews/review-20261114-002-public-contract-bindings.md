# Public contract binding 대응 — r149

`pseudocode/application/public_api/contract.pcal`의 `InvokePublicWrapper`에 맞춰 기존 binding을 갱신했다.

- graph add/editable/layout은 명시적 slotId/chartId, object move/edit/delete/palette는 명시적 chartId를 해당 기존 helper에 전달한다.
- image settings는 명시적 slotId를 전달한다. graph import는 `(slotId, file)`을 기존 file-first helper에 연결하고 기존 단일 importing lifecycle을 유지한다.
- print save/capture는 statusSink 인자를 기존 export helper의 onStatus에 전달한다.
- Mantine 호출자와 기존 회귀 호출을 같은 인자 순서로 갱신했다. 기존 사례170에 직접 helper binding 및 import 인자 전달을 확인하는 조건을 추가했다.

상위 명세·domain helper 의미·lifecycle 절차는 변경하지 않았다. assets tree/trash 등 sibling 절차의 대응은 해당 모듈 작업에서 처리한다. 이 기록은 이번 binding 변경의 정적 대조이며 전체 public API 모듈 또는 실행 검증 완료 판정이 아니다. code149/stale; 테스트·빌드·공식 checker 미실행.

# tests

패치 적용 전후의 테스트 절차, 회귀 검사, 재현 조건, 기대 결과와 실제 결과를 보관하는 경로입니다.

테스트 실행의 원시 출력은 필요하면 `logs`에 두고, 여기에는 검증 목적과 판정에 필요한 구조화된 결과를 기록합니다.

## Browser regression

현재 계층 revision/fingerprint/파생 관계의 단일 원천은 `development-versions.json`이다. 브라우저 probe의 복제된 구버전 표를 최신 계보 증거로 사용하지 않는다. 실제 실행 SHA의 development-layer 검사와 각 ownership unit의 `agent_space/reviews/` 요구사항별 검토를 함께 확인한다. 선택적 verification-model/TLC와 브라우저 회귀는 별개이며 실행하지 않은 TLC를 통과로 취급하지 않는다.

실행:

```bash
python agent_space/tests/run-browser-regression.py
```

이 목표에서는 위 명령을 로컬에서 실행하지 않는다. 허용된 GitHub Actions 기본 GitHub-hosted POSIX runner에서 Chrome/Chromium과 Python 표준 라이브러리만 사용해 다음 두 배포 형태를 모두 빌드·검사한다. CDP pipe로 실제 최종 결과 attribute를 기다리며 각 배포 형태의90초 wall deadline, 모든 기존 assertion/실패 판정을 유지한다. virtual-time DOM dump, 자동 재시도 또는 부분 결과의 성공 간주는 사용하지 않는다. 미완료 시 마지막 case/phase/completed 수/virtual elapsed와 stderr를 진단한다.

- inline `dist/inline/Fast-figure.html`
- split `dist/split/Fast-figure.zip`을 해제한 `Fast-figure.html`

기존 FFPX/FFSX, 자산 참조, 레이아웃, 폰트, export 회귀는 유지한다.

### 초기 r15 interaction regression (현재 전체 범위가 아닌 역사적 subset)

다음은 초기 테스트20–26의 검증 목적이다. 이후 ownership별 케이스와 실제 실행 결과/실패 이력은 각 review에서 추적한다. 예: review-20261018-047-code-package-import-open.md는 package import122–124 및 이전 케이스를 포함한124개 inline/split 회귀·반복의 실제 SHA/run을 기록한다. 이 목록이나 green suite만으로 전체 Plan023 정합화를 판정하지 않는다.

20. **content slot selection ownership**
   - graph/image 본문 click은 slot selection을 변경하지 않는다.
   - bookmark click만 content slot을 선택/해제한다.
   - dashboard 빈 배경 click은 선택을 해제하지 않는다.

21. **empty slot selection**
   - interactive content가 없는 empty slot surface click은 해당 slot을 선택한다.

22. **bookmark drag / post-drag click**
   - bookmark drag는 slot-local payload를 source/target 위치 사이에서 교환한다.
   - drag 자체는 slot selection을 발생시키지 않는다.
   - drop 직후의 bookmark click은 소비되어 `SELECT_SLOT`으로 해석되지 않는다.
   - 소비 후 다음 정상 bookmark click은 다시 선택 동작을 수행한다.

23. **image selection versus explicit linking**
   - project image asset 선택은 `assetSelection/assetPath`만 변경한다.
   - 선택만으로 현재 image slot의 `imageId`가 바뀌지 않는다.
   - 명시적 `assets.connectToSlot(path, "image", slotId)`에서만 연결된다.

24. **current CSV versus object CSV projection**
   - `graphs.readData().csv/columns`는 현재 단일 CSV 선택에서 나온다.
   - 선택 graph object의 `objectColumns`는 그 object의 persistent `csvId`에서 별도로 resolve한다.
   - object csvId 변경이 current CSV selection을 암묵적으로 덮지 않는다.

25. **non-editable imported graph**
   - imported Plotly chart가 `editable=false`인 동안 object add/edit/delete API가 chart를 변경하지 않는다.
   - 대응 Mantine add/delete control도 disabled 상태다.

26. **collision Modal cancel**
   - 동일 이름 asset import 중 Modal close/dismiss는 cancel이다.
   - 기존 asset replace, rename copy 생성, slot/chart mutation이 발생하지 않는다.
   - lifecycle은 다시 `ready`로 돌아온다.

DragEvent/DataTransfer가 없는 브라우저에서는 drag 기반 테스트만 `blocked`로 기록하며 전체 suite의 다른 검사는 계속한다. 필수 요구사항이 blocked/미검증이면 전체 목표 완료 증거로 사용할 수 없다.

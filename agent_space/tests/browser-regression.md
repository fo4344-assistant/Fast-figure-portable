# Browser regression 안내

이 문서는 브라우저 회귀 검사와 모듈 빌드 검사의 실행 방법·범위를 설명한다. 경로 안내는 `tests.md`, 개별 작업 이력과 결과는 `../reviews/` 및 `../logs/`에 둔다. 아래 절차는 기존 tests.md에서 옮긴 것이며 명령을 새로 실행했다는 뜻이 아니다. Actions 실행 허가는 AGENT.md와 해당 작업의 Plan023/사용자 지시를 따른다.

## Browser regression

현재 계층 revision/fingerprint/파생 관계의 단일 원천은 `development-versions.json`이다. 브라우저 probe의 복제된 구버전 표를 최신 계보 증거로 사용하지 않는다. 실제 실행 SHA의 development-layer 검사와 각 ownership unit의 `agent_space/reviews/` 요구사항별 검토를 함께 확인한다. 선택적 verification-model/TLC와 브라우저 회귀는 별개이며 실행하지 않은 TLC를 통과로 취급하지 않는다.

실행:

```bash
python agent_space/tests/run-browser-regression.py
```

이 목표에서는 위 명령을 로컬에서 실행하지 않는다. 허용된 GitHub Actions 기본 GitHub-hosted POSIX runner에서 Node22 및 `npm ci`로 모듈 빌드 의존성을 설치한 뒤, Chrome/Chromium과 Python 표준 라이브러리 기반 runner로 다음 두 배포 형태를 모두 빌드·검사한다. CDP pipe로 실제 최종 결과 attribute를 기다리며 각 배포 형태의90초 wall deadline, 모든 기존 assertion/실패 판정을 유지한다. virtual-time DOM dump, 자동 재시도 또는 부분 결과의 성공 간주는 사용하지 않는다. 미완료 시 마지막 case/phase/completed 수/virtual elapsed와 stderr를 진단한다.

- inline `dist/inline/Fast-figure.html`
- split `dist/split/Fast-figure.zip`을 해제한 `Fast-figure.html`

기존 FFPX/FFSX, 자산 참조, 레이아웃, 폰트, export 회귀는 유지한다.

## Module build checks

`python agent_space/tests/test-module-build.py`는 모듈 경로/상대 import/build-only 경계, version metadata의 입력 경로 포함 여부, 실제 linker 및 inline/split 오프라인 패키징을 검사한다. `fast-figure-regression.yml`에서 브라우저 회귀 전에 실행한다. `npm ci`가 선행되어야 한다. 이 구조 검사는 Source/PlusCal 의미 정합성을 판정하지 않는다.

DragEvent/DataTransfer가 없는 브라우저에서는 drag 기반 테스트만 `blocked`로 기록하며 전체 suite의 다른 검사는 계속한다. 필수 요구사항이 blocked/미검증이면 전체 목표 완료 증거로 사용할 수 없다.

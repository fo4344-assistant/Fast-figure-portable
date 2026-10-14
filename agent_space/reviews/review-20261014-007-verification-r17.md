# Verification validation review — r17

## 대상

- Source Script: r20
- pseudocode: r6
- verification-model: r17
- verification fingerprint: `sha256:c3be19be754757a5b3423f0e939cebf841f0aa9c7532ee2d231263d57aa6d75f`

## 변경 모델과 검증 증거

이번 revision에서 실제 내용이 바뀐 verification file은 `FastFigureInteractionCore.tla`의 abstraction 설명이다. 상태 transition 자체는 기존 entering-trash reference detach / leaving-trash non-restore / trash direct-slot connection 거부를 그대로 사용한다.

push-trigger TLA workflow run `38518601964`에서 변경된 Interaction Core job `verify-interaction-core`는 PlusCal translate, SANY parse, TLC model check를 모두 성공했다.

같은 run의 Slot Core job은 이 review 작성 시점에 중복 model check가 계속 실행 중이지만, 현재 `FastFigureSlotCore.tla`와 `FastFigureSlotCore.cfg`는 직전 성공 push workflow run `38394480809`의 입력과 Git blob SHA가 각각 완전히 동일하다.

- FastFigureSlotCore.tla: `198507ee7835d8ea5f13efe7f330e465faeea2ab`
- FastFigureSlotCore.cfg: `63d3955949b0ba85dd137f0a1ab2f3a67194113b`

run `38394480809`의 `verify-slot-core`는 translate, parse, TLC model check를 모두 성공했다. 따라서 변경되지 않은 동일 Slot Core 모델에 대해 새 상태 의미가 추가되지 않았으며, 이번 revision의 변경된 검증 대상은 현재 push에서 다시 model check되었다.

## abstraction 범위

- Layout local selection은 UI-local state이므로 ProjectObject verification state에 추가하지 않는다.
- dashboard projection invalidation은 renderer effect이며 project transition이 아니므로 verification state에 추가하지 않는다.
- removed graph-reference count와 reset image-slot count는 existing entering-trash transition의 pre/post state에서 결정적으로 파생되는 mutation result metadata다. 이를 별도 independent state로 추가하지 않는다.

## 판정

verification-model r17은 현재 Source Script r20 / pseudocode r6의 검증 대상 상태 의미를 충족한다.

- changed Interaction Core: current push TLC passed.
- unchanged Slot Core: exact same TLA/CFG blobs의 prior push TLC passed.
- verification-model r17: **passed**.

현재 run의 unchanged Slot Core 중복 job이 나중에 다른 결과를 내면 이 판정을 다시 열고 원인을 조사해야 한다.

"""
Fast Figure Source Script — portable single-file build

하위 build 구현 검증 원천:
- ../scripts/build-portable.py
- ../Fast-figure.html
- ../vendor/plotly.min.js
- ../vendor/fast-figure-ui-runtime.js
- ../fast-figure.js
- ../fast-figure-ui.js

이 Source Script의 import는 최종 Python module 배치를 확정하지 않는다.
"""

ROOT = "repository root containing split Fast Figure source"

DEFAULT_OUTPUT = "dist/Fast-figure.html"

SCRIPTS = [
    {
        "externalTag": "Fast-figure.html 안의 vendor/plotly.min.js script tag",
        "source": "vendor/plotly.min.js bytes",
        "inlineTag": "일반 inline script",
    },
    {
        "externalTag": "Fast-figure.html 안의 ff-mantine-runtime script tag",
        "source": "vendor/fast-figure-ui-runtime.js bytes",
        "inlineTag": "같은 ff-mantine-runtime id를 가진 inline script",
    },
    {
        "externalTag": "Fast-figure.html 안의 fast-figure.js script tag",
        "source": "fast-figure.js bytes",
        "inlineTag": "일반 inline script",
    },
    {
        "externalTag": "Fast-figure.html 안의 fast-figure-ui.js script tag",
        "source": "fast-figure-ui.js bytes",
        "inlineTag": "일반 inline script",
    },
]

BUILD_SEMANTICS = (
    "portable build는 split source의 application logic을 다시 작성하지 않는다. "
    "Fast-figure.html의 정확한 external script tag를 동일 source bytes의 inline script로 한 번씩 치환한다. "
    "결과 Fast-figure.html은 core workflow 실행을 위해 별도 script/runtime download를 요구하지 않는다."
)

PORTABLE_RUNTIME_RULE = (
    "ordinary Fast Figure workflow는 single-file artifact 안에서 local browser processing으로 완결되어야 한다. "
    "향후 optional external integration을 추가하더라도 project open/edit/export의 기본 기능을 network dependency로 바꾸지 않는다."
)


def build(output):
    """
    Args:
    - output:
      생성할 single-file HTML 경로.

    변경:
    - output file만 생성/교체한다.
    - split source를 변경하지 않는다.

    처리:
    1. Fast-figure.html bytes를 읽는다.
    2. SCRIPTS 순서대로 각 expected external tag가 정확히 한 번 존재하는지 확인한다.
    3. source file이 실제로 존재하는지 확인한다.
    4. tag를 source bytes가 포함된 inline script로 정확히 한 번 치환한다.
    5. 모든 외부 script tag가 최종 bytes에 남지 않았는지 검사한다.
    6. output parent directory를 만들고 bytes를 기록한다.

    실패:
    - expected tag가 0개 또는 2개 이상이면 build를 중단한다.
    - source file이 없으면 build를 중단한다.
    - 치환 뒤 external tag가 남으면 build를 중단한다.
    """
    return "생성된 portable Fast-figure.html"

"""
Fast Figure Source Script — portable single-file build

하위 build 구현 검증 원천:
- ../../scripts/build-portable.py
- ../../Fast-figure.html
- ../../vendor/plotly.min.js
- ../../vendor/fast-figure-ui-runtime.js
- ../../fast-figure.js
- ../../fast-figure-ui.js

구현 모듈 배치는 논리 책임과 현재 package 구성을 기준으로 정한다.
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






def build(output):
    artifact = "portable HTML 산출물 경로."
    """
    Args:
    - output:
      생성할 single-file HTML 경로.

    Return:
    - artifact:
      portable HTML 산출물 경로.
      생성된 portable Fast-figure.html

    변경:
    - output 위치의 portable 산출물.

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
           artifact를 반환한다.
    """
    return artifact

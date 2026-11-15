# /backend/layout_annotations

# dashboardGeometry 반환값의 원형
dashboardGeometryResult = {
    "referenceWidth": "기준 너비. 단위: px.",
    "width": "대시보드 전체 너비. 단위: px.",
    "height": "대시보드 전체 높이. 단위: px.",
    "scale": "기준 너비에 대한 배율.",
    "aspect": "대시보드의 너비 대 높이 비율.",
    "outerMargin": "상하좌우 각각의 바깥 여백. 단위: px.",
    "gap": "인접한 셀 사이의 간격. 단위: px.",
    "radius": "모서리 반경. 단위: px.",
}


def gridSlotGeometry(layout, geometry, slot):
    colWidth = "기본 셀 한 열의 너비. 단위: px."
    rowHeight = "기본 셀 한 행의 높이. 단위: px."
    colSpan = "대상 슬롯이 차지하는 열 수. 양의 정수."
    rowSpan = "대상 슬롯이 차지하는 행 수. 양의 정수."
    slotWidth = "대상 슬롯의 너비. 내부 열 간격을 포함한다. 단위: px."
    slotHeight = "대상 슬롯의 높이. 내부 행 간격을 포함한다. 단위: px."
    slotGeometry = {
        "colWidth": "기본 셀 너비. 단위: px.",
        "rowHeight": "기본 셀 높이. 단위: px.",
        "width": "대상 슬롯 너비. 단위: px.",
        "height": "대상 슬롯 높이. 단위: px.",
    }
    """
    Args:
    - layout:
      딕셔너리.
        원형: /backend/project_state/ProjectObject._state.layout
        Source of Truth: /backend/project_state/activeProject._state.layout

    - geometry:
      딕셔너리.
        원형: /backend/layout_annotations/dashboardGeometryResult

    - slot:
      슬롯 오브젝트 또는 None.
      슬롯 오브젝트:
        원형: /backend/project_state/Slot
        Source of Truth: /backend/project_state/activeProject._state["slots"]의 원소.

    Return:
    - slotGeometry:
      기본 셀과 대상 슬롯의 너비·높이(px)를 담은 딕셔너리.

    변경:
    - 없음.

    처리:
        1. 전체 너비에서 좌우 여백과 열 사이 간격을 빼고,
           전체 열 수로 나누어 colWidth에 대입한다.

           colWidth =
               (geometry["width"]
                - 2 × geometry["outerMargin"]
                - geometry["gap"] × (layout["gridCols"] - 1))
               ÷ layout["gridCols"]

        2. 전체 높이에서 상하 여백과 행 사이 간격을 빼고,
           전체 행 수로 나누어 rowHeight에 대입한다.

           rowHeight =
               (geometry["height"]
                - 2 × geometry["outerMargin"]
                - geometry["gap"] × (layout["gridRows"] - 1))
               ÷ layout["gridRows"]

        3. slot이 None이면 colSpan과 rowSpan에 각각 1을 대입한다.
           그 외에는 colSpan에 slot.colSpan을,
           rowSpan에 slot.rowSpan을 대입한다.

        4. 기본 셀들의 너비와 슬롯 내부의 열 간격을 합하여
           slotWidth에 대입한다.

           slotWidth =
               colWidth × colSpan + geometry["gap"] × (colSpan - 1)

        5. 기본 셀들의 높이와 슬롯 내부의 행 간격을 합하여
           slotHeight에 대입한다.

           slotHeight =
               rowHeight × rowSpan + geometry["gap"] × (rowSpan - 1)

        6. slotGeometry["colWidth"]에 colWidth를,
           slotGeometry["rowHeight"]에 rowHeight를,
           slotGeometry["width"]에 slotWidth를,
           slotGeometry["height"]에 slotHeight를 대입한다.

        7. slotGeometry를 반환한다.
    """
    return slotGeometry

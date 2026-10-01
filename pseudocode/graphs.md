# graphs

## Source identifiers

- `axisSettings`: one axis editor schema.
- `globalSettings`: chart-wide settings and four axes.
- `GRAPH_EMPTY_RULE`: zero-object chart rule.
- `PLOTLY_IMPORT_RULE`: original Plotly preservation vs conversion-view rule.
- `graphObject`: one editable graph-object schema.
- `chartModel`: chart editor + renderer projection schema.
- `AXIS_REFERENCE_RULE`: graph-object side -> actual axis reference rule.
- `GRAPH_PROJECTION_RULE`: editor/CSV authority -> Plotly projection rule.

## Graph model

axisSettings defines min/max/tick/tickMode/minorTicks/notation/scaleType/divide/title/font/line/grid/visibility/value display.

globalSettings owns legend/title/zero-line/font and four axes:
xBottom, xTop, yLeft, yRight.

graphObject references one project CSV and selected x/y columns plus axis sides and visual style.

chartModel owns:

- editor.objects
- editor.editable
- editor.globalSettings
- editor.title
- editor.plotlyExtensions
- graph.data/layout/config/frames/imported

Editable chart may contain zero objects.

For editable charts, editor + project CSV references are semantic authority.
graph.data/layout are renderer projections.

## dataTable

INPUT data

1. If rows are arrays, normalize them as table rows.
2. If rows are objects, compute union of keys as header and project each object to same column order.
3. Reject unsupported or empty input where table semantics are unavailable.
4. Return matrix.

## columnDefinitions

INPUT table, headerLines

1. Find maximum row width.
2. Create C1..Cn identifiers.
3. If headerLines >= 1, use last header row values as column names.
4. Return column definitions.

## graphDataSelection

INPUT matrix, headerLines, editor

1. Compute valid columns.
2. Keep existing editor x/y if still valid.
3. Otherwise choose first column containing numeric data as x when possible.
4. Choose a different numeric or otherwise valid column as y.
5. Return x/y ids.

## connectDataToSlotModel

INPUT slot, data, sourceName, projectCsv

1. Resolve slot and CSV.
2. If slot owns chart, copy chart candidate and append graph object.
3. Otherwise allocate chart id and create chart + slot.chart candidate.
4. Choose valid x/y columns.
5. Set graph object csvId to real project CSV id.
6. Rebuild candidate renderer projection.
7. Return candidate; do not commit here.

## graphEditorAdd

INPUT csvId

1. Resolve selected slot and CSV.
2. If no chart, use slot-data-connect mutation to create first chart/object.
3. Else append base graph object to current object list and commit through graph-object replacement.
4. Return chart.

## graphEditorCommit

INPUT objects, selected index

1. Normalize object list.
2. Validate every CSV/column/style reference.
3. Permit empty list.
4. Submit candidate object list through controlled mutation.
5. Reconcile selected graph object index.
6. Return chart.

## graphEditorObjectValues

INPUT index, values

1. Resolve selected chart/object.
2. Re-resolve referenced CSV/columns.
3. Copy object and apply only supported fields.
4. Normalize enums and numeric ranges.
5. Commit through graphEditorCommit.
6. Return chart.

## graphEditorSetEditable

INPUT editable

1. Resolve selected chart.
2. If requested state needs no conversion, candidate-change flag as allowed.
3. For imported non-editable -> editable:
   a. keep imported representation.
   b. if conversion objects are empty, create no CSV.
   c. otherwise create one project CSV candidate from conversion rows.
   d. remap conversion objects to that CSV.
   e. rebuild editable graph projection.
   f. validate whole project.
4. Commit candidate once.
5. Return final editable state.

## tracesSingle

INPUT objectView

1. Read referenced CSV values.
2. Apply x/y divide values.
3. For reciprocal axis, discard zero then use reciprocal.
4. For log axis, discard values <= 0.
5. Build bar/scatter/marker/line semantics from object type/style.
6. Return Plotly trace projection(s).

## traces

INPUT chart

1. For every editor object, re-resolve CSV from project authority.
2. Call tracesSingle.
3. Concatenate trace projections.
4. Return traces.

## normalizeAxisSettings

INPUT axis, key

1. Start with defaults; bottom x and left y visible, top x and right y hidden.
2. Normalize numeric/empty fields and enums.
3. Reject divide = 0.
4. If scaleType is log, do not keep increment tick mode.
5. Return normalized axis.

## normalizeGlobalSettings

INPUT settings

1. Fill missing global defaults.
2. Normalize all four axes.
3. Keep editor-owned settings separate from imported Plotly extension fields.
4. Return normalized settings.

## rebuildEditableGraph

INPUT chart

1. Resolve editor objects and referenced CSVs.
2. Recompute traces.
3. Recompute Plotly layout from title/global/axis settings.
4. If zero objects, data projection is empty but layout remains valid.
5. Update only chart.graph renderer projection.
6. Return chart.

## validateChartModel

INPUT chart, csvCollection

Reject unless:

1. chart id and editor/graph shapes are valid.
2. objects is an array and may be empty.
3. every object CSV ref resolves.
4. x/y identifiers, enum/style numeric fields are valid.
5. global settings and four axes normalize successfully.
6. graph data/layout/config/frames/imported extensions have valid shapes.

Return chart.

## parsePlotlyToEditor

INPUT Plotly figure, chartId

1. Deep-copy original data/layout/config/frames into imported representation.
2. For every trace, project x/y arrays into conversion columns in trace order.
3. For traces with data, create conversion graphObjects:
   - x2 -> top, otherwise bottom
   - y2 -> right, otherwise left
   - bar -> bar
   - visible=false -> hidden
   - otherwise normalize mode into supported scatter/markers/lines+markers
   - map supported line/marker/name/opacity style
   - preserve non-x/y trace extension fields
4. Convert title/legend/font/axes into globalSettings.
5. Preserve non-editor layout/config fields in plotlyExtensions.
6. If no convertible traces, leave conversion rows/objects empty.
7. Do not create fake rows/default CSV.
8. Set editable=false.
9. Return chart candidate.

## convertImportedChartToEditable

INPUT imported chart

1. Preserve original imported representation.
2. If conversion objects empty:
   set editable=true without CSV.
3. Else:
   create project CSV candidate from conversion rows;
   remap all conversion objects to that CSV id.
4. Keep converted global/axis settings.
5. Rebuild editable projection.
6. Return project candidate for validation/commit.

## importSelectedGraphFile

INPUT file

1. Resolve selected target slot.
2. If FFSX, read validated FFSX payload and build target-slot candidate.
3. If Plotly JSON, parse non-editable chart candidate.
4. Allocate chart ownership so target slot uniquely owns new chart.
5. Validate whole project.
6. Commit once.
7. Return imported chart.

## chartFigure

INPUT chart

1. If editable, calculate current figure from editor + CSV authority.
2. If imported non-editable, preserve imported Plotly semantics.
3. Return data/layout/config/frames export representation.

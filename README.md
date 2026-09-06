# Fast Figure

Fast Figure is a workspace for quickly assembling scientific figure drafts from tabular data and images.

It combines graph creation, image placement, slot-based figure layout, labels, captions, project packaging, and image and Plotly export.

The repository keeps application and vendored JavaScript separate so development work can inspect and patch Fast Figure source without traversing multi-megabyte inline bundles. The portable build combines the same source back into one self-contained HTML file.

Both forms process loaded data and images locally in the browser. Ordinary use does not require a server, account, or network connection.

## Download and use

### Portable build

The end-user portable application remains a single file:

```text
Fast-figure.html
```

Release packaging generates that file from the split repository source. It can be opened directly in a modern web browser without the development JavaScript files beside it.

### Repository development source

The checked-in development source is:

```text
Fast-figure.html
fast-figure.js
vendor/
  plotly.min.js
  fast-figure-ui-runtime.js
```

Open the repository `Fast-figure.html` with those sibling files present for local development.

To generate the single-file portable build:

```bash
python scripts/build-portable.py
```

The default output is `dist/Fast-figure.html`.

The current application version, detailed project-format documentation, and bundled third-party software information are available from the README built into the application.

### `agent_space`

The `agent_space` directory is reserved for AI agent development work.

It is not required to run or use Fast Figure, and end users should not download this directory.

## Project structure

A Fast Figure project contains the complete persistent state of one figure, including:

- project name
- dashboard dimensions
- slot arrangement
- merged and split slots
- graph and image contents
- labels and captions
- display settings
- UI palette
- export settings

Project CSV files and graph charts are stored separately inside the project model:

- `csvFiles`: project-level tabular data snapshots with their original names
- `csvId`: each graph object's direct reference to one project CSV object
- `editor`: Fast Figure graph objects and editable settings
- `graph`: Plotly figure state, including `data`, `layout`, `config`, `frames`, and an imported original Plotly figure where applicable

The CSV stored in a Fast Figure file is intended for sharing, storage, transport, and reopening.

Fast Figure does not edit the original CSV file. Edit source data in an external CSV editor and load the file again when the data changes.

## Basic workflow

1. Load CSV, TSV, supported JSON data, Plotly JSON, or an image.
2. Create and configure graph objects from the loaded columns.
3. Arrange graphs and images in the slot-based dashboard.
4. Merge or split slots as needed.
5. Add labels and captions.
6. Export one graph, one slot, or the entire project.

## Project and graph interchange formats

Fast Figure provides three project and graph interchange formats. They serve different purposes and are not interchangeable.

### Plotly JSON

Plotly JSON exports the selected graph as a Plotly figure.

It may include Plotly `data`, `layout`, `config`, and `frames`, but it does not contain:

- the Fast Figure dashboard
- packaged CSV assets
- other slots
- images
- project labels
- captions
- UI settings
- project export settings

### FFSX slot format

`.ffsx` means **Fast figure Slot XML**.

FFSX is a ZIP-based container for transferring one graph slot together with every CSV referenced by its graph objects, Plotly state, and Fast Figure editor settings.

Typical contents include:

- `slot.xml`: slot metadata, slot graph settings, graph-object CSV references, and packaged project CSV metadata
- `data/<csv-id>/<original-name>`: each referenced original CSV, TSV, or JSON file without reserialization

FFSX contains only one graph slot.

It does not contain the project name, dashboard grid, other slots, image assets, project labels, project-level captions, UI palette, or project export settings.

The exported slot caption is included. Importing an FFSX file places its graph, slot caption, and associated settings into the selected slot.

### FFPX project format

`.ffpx` means **Fast figure Project XML**.

FFPX is the complete Fast Figure project container and is intended for saving, reopening, transferring, or archiving an entire working figure.

Typical contents include:

- `project.xml`: project name, project metadata, dashboard dimensions, slot layout, chart metadata, labels, captions, display settings, UI palette, and export settings
- `data/<csv-id>/<original-name>`: one asset for each project CSV object, stored as original bytes and referenced directly by graph objects through `csvId`
- `media/`: packaged binary assets used by image slots

FFPX stores copied project assets rather than external file paths. A transferred FFPX file therefore does not depend on the original locations of CSV or image files.

Exporting an FFPX file copies the current project state for packaging. It does not edit the active project objects, original CSV files, or original image files.

## Format compatibility

FFSX and FFPX record a format identifier and one format version.

The application reads only its current format. Conversion from earlier development files is handled outside the application.

## Bundled third-party software

Development source keeps the vendored JavaScript separately, while the portable build embeds the same runtime bytes into its generated HTML. It incorporates:

- **Iconoir 7.11.1**
- **Plotly.js 2.35.2**

Selected Iconoir SVG definitions are stored in `fast-figure.js` during development and embedded in the portable HTML build. The Iconoir package, CDN, and external SVG files are not required at runtime.

The minified Plotly.js distribution is stored in `vendor/plotly.min.js` during development and embedded directly in the portable HTML build. No separate Plotly.js installation is required.

Third-party copyright and license notices are retained in the distributed HTML and reproduced in the repository `LICENSE` file.

## License

Fast Figure is provided under the MIT License.

See [`LICENSE`](LICENSE) for the Fast Figure license and the bundled third-party license notices.

# assets_files

## Source identifiers

- `PACKAGE_FORMAT_VERSION`: current FFPX/FFSX package version.
- `PROJECT_ASSET_DIRECTORIES`: default CSV/image directories.
- `PROJECT_TRASH_DIRECTORY`: project trash root.
- `FIXED_DIRECTORY_RULE`: fixed-directory immutability rule.
- `assetImportPlan`: resolved import path + optional replace id.
- `FFPX_STRUCTURE`: complete-project package document map.
- `FFSX_STRUCTURE`: one-graph-slot package document map.
- `PACKAGE_CONTAINER_RULES`: ZIP container/path/CRC/version constraints.
- `EXPORT_TRASH_RULE`: trash exclusion rule.
- `PACKAGE_ASSET_INDEPENDENCE_RULE`: copied-byte independence from original filesystem path.
- `VFS_RULES`: canonical/resolve/unique/descendant/fixed/trash semantics.
- `TABULAR_PARSE_RULES`: CSV/TSV/JSON parse semantics.
- `TYPED_XML_RULES`: recursive typed-value grammar.
- `FORMAT_EVOLUTION_RULE`: additive same-version vs incompatible-version change rule.

## Package and VFS rules

- FFPX/FFSX use current package format version 3.
- Container is non-split STORE ZIP.
- Reject absolute entry paths and parent traversal.
- Validate CRC.
- Fixed VFS directories are /assets, /assets/csv, /assets/images, /assets/trash.
- Fixed directories cannot be moved or deleted.
- Asset canonical path is derived from directory + name.
- FFPX excludes trash subtree.
- Package assets are copied bytes; reopening never requires original filesystem path.

FFPX document responsibility:

- project.xml: project metadata, fileSystem, appearance, export settings, document refs
- assets/assets.xml: asset metadata and binary refs
- layout/layout.xml: grid and placement
- caption/caption.xml: project-global caption only
- labels/labels.xml: label configuration
- slots/slot-<id>.xml: slot-local payload, slot caption, chart state or image settings
- assets/data: copied tabular bytes
- assets/media: copied image bytes

FFSX responsibility:

- one graph slot + chart state + graph objects + slot caption
- referenced CSV metadata/bytes
- blank zero-object chart may contain no CSV

## normalizeProjectPath

INPUT value, directory flag

1. Normalize separators into project absolute path form.
2. Reject "." and ".." segments.
3. Validate each segment with project filename rules.
4. Reject root itself when a file path is required.
5. Return canonical path.

## projectAssetPath

INPUT asset

1. Validate asset.directory and asset.name.
2. Join and normalize them.
3. Do not read a separately stored asset.path.
4. Return canonical path.

## projectAssetImportCollisionModel

INPUT file, directory, reservedPaths

1. Determine supported asset kind.
2. Build normalized candidate path.
3. Check current VFS and batch-reserved paths.
4. If no collision: mode available.
5. If same-kind existing asset: allow replace or rename.
6. If other-kind or batch reservation: allow rename only.
7. Return collision model without mutation.

## resolveProjectAssetImportPlan

INPUT collision model, user choice, reservedPaths

1. If available, use candidate path.
2. If replace was allowed and selected, preserve existing asset id.
3. Otherwise compute collision-free path through projectVfsUniquePath.
4. Return path + optional replaceId.

## importProjectFilesToDirectory

INPUT files, directory, planImport

1. Resolve target directory; reject trash target.
2. Read all file bytes.
3. Build data/image candidates outside authority.
4. Resolve all collision choices and reserve batch paths.
5. Starting from current project snapshot, build candidate collections, locations and nextIds.
6. If operation also targets a slot, include slot/chart candidate changes.
7. Validate VFS, references, and whole project.
8. If any read/parse/collision/validation fails, keep activeProject unchanged.
9. If all pass, commit the candidate in importing lifecycle once.
10. Return import result.

## createProjectCsv

INPUT data, name, id, bytesBase64, mime, headerLines, path

1. Normalize table and copied bytes representation.
2. Resolve VFS location.
3. Build CSV model.
4. Submit through controlled CSV create mutation.
5. Update next csv id through that mutation.
6. Return registered asset.

## createProjectImage

INPUT bytes, name, mime, id, path

1. Build copied-bytes image asset with VFS location.
2. Do not add display settings to asset.
3. Submit through controlled image create mutation.
4. Update next image id.
5. Return registered asset.

## collectAssetReferences

INPUT csvIds, imageIds, state

1. For each graph object whose csvId is selected, emit one CSV reference.
2. For each slot whose imageId is selected, emit one image reference.
3. Count repeated CSV use by different graph objects separately.
4. Return the exact reference set used by confirmation and mutation.

## deleteProjectAsset

INPUT target

1. Resolve target.
2. Collect references.
3. Build candidate removing target asset and its direct references.
4. For CSV, remove referencing graph objects; zero-object chart remains valid.
5. For image, clear the image reference from affected slot; do not invent unrelated slot reset.
6. Validate candidate.
7. Commit once or leave project unchanged.
8. Return completion.

## planProjectNodeMove

INPUT path, directory

1. Resolve source and target directory.
2. Compute destination, collision, optional unique name, trash-entry flag.
3. Collect current affected reference count.
4. Return read-only move plan.

## moveProjectNode

INPUT plan, useUniqueName

1. Re-resolve source and destination from current state.
2. Recompute final destination; do not trust stale UI plan.
3. If asset enters trash, collect/detach references in candidate.
4. If directory moves, move all descendants in same candidate.
5. Reject fixed directory, collision, recursive subtree cycle, invalid references.
6. Validate candidate.
7. Commit once.
8. Return final path.

## emptyProjectTrash

1. Resolve current trash subtree.
2. Collect remaining references.
3. Build candidate removing those references, assets and trash directories.
4. Validate.
5. Commit once.
6. Return deleted counts/reference result.

## parseProjectDataAsset

INPUT name, bytes

1. Decode text as UTF-8.
2. If JSON: accept top-level array or object.data array, then normalize to data table.
3. If TSV: delimiter = tab.
4. If CSV: delimiter = comma.
5. Parse quoted delimiter/newline and doubled quote.
6. Preserve row order and internal blank rows; ignore purely trailing physical empty line.
7. Reject unsupported extension or invalid table shape.
8. Return parsed rows; original bytes remain separate copied asset data.

## projectVfsResolve

INPUT path, state

1. Canonicalize path.
2. Resolve against fixed/project directories and CSV/image derived paths.
3. If none, return none.
4. If more than one object resolves to same path, fail invalid VFS.
5. Return resolved object.

## projectVfsUniquePath

INPUT path, state, reservedPaths

1. Keep parent and filename/extension meaning.
2. Generate name suffix until neither current VFS nor reservedPaths contains it.
3. Return path without mutation.

## projectVfsDescendants

INPUT directory, state

1. Canonicalize directory.
2. Compare path segments, not raw string prefix.
3. Return all descendant directories/assets.

## ffpxEncodeValue

INPUT value

1. Encode null, boolean, finite number, string, array or object.
2. Preserve array order and object property names.
3. Recursively encode children.
4. Escape XML text/attributes.
5. Reject unsupported runtime value.

## ffpxDecodeValue

INPUT element

1. Validate declared typed-value shape.
2. Decode recursively.
3. Require finite numbers.
4. Reject unknown type/invalid shape.
5. Return value.

## ffpxBuildProject

1. Validate activeProject.
2. Take one operation snapshot from projectObjects.
3. Exclude trash directories/assets.
4. Revalidate chart CSV refs, chart ownership and slot image refs.
5. Write project.xml metadata/filesystem/appearance/export settings/document refs.
6. Write layout, global caption, labels and each slot in their own responsibility documents.
7. Use ffpxEncodeValue as the typed-value writer.
8. Store CSV/image copied bytes by dataRef.
9. Return package entries.

## ffpxReadProject

INPUT file

1. Validate ZIP STORE structure, safe paths and CRC.
2. Read required XML/slot documents using typed-value decoder.
3. Reconstruct placement and chart/image refs.
4. Validate asset dataRef subtrees and entry existence.
5. Restore copied bytes and parse table assets.
6. If additive export settings are absent in same-version older package, use project defaults.
7. Do not clone/drop malformed shared/orphan charts.
8. Validate package schema/version.
9. Return payload for buildProjectObject.

## buildProjectObject

INPUT payload, fileName

1. Validate current schema/version and project identity/grid shape.
2. Normalize copied CSV/image assets, ids and canonical VFS locations.
3. Normalize charts/graph objects and resolve CSV refs; keep zero-object charts.
4. Normalize slots, geometry, chart/image refs, slot-local imageSettings and caption.
5. Require each chart to have exactly one owning slot.
6. Normalize labels, project-global captions, appearance and export settings.
7. Derive nextId values above collection maxima.
8. Run whole-project validation.
9. Return candidate or fail without changing activeProject.

## importProjectFile

INPUT file

1. Accept current FFPX project input.
2. ffpxReadProject -> buildProjectObject.
3. If candidate validation succeeds, submit PROJECT_LOADED.
4. Otherwise leave current project unchanged.
5. Legacy conversion, when needed, belongs to an explicit converter rather than guessed application import.

## ffsxBuildSlot

INPUT graph slot, owned chart

1. Collect only CSV assets referenced by chart objects.
2. Remap those CSV ids to package-local consecutive ids.
3. Rewrite chart-object csvIds in package copy.
4. If chart has zero objects, package no CSV.
5. Include slot-local caption.
6. Store copied CSV bytes.
7. Return package.

## ffsxReadSlot

INPUT file

1. Validate package schema/version.
2. Read chart, slot-local caption and package CSVs.
3. Validate graph-object -> package CSV refs and dataRefs.
4. Allow zero-object chart with no CSV.
5. Do not synthesize special id 0/default CSV.
6. Validate chart model.
7. Return slot payload.

## applyFfsxSlot

INPUT slotPayload, targetSlot

1. Re-resolve target slot.
2. Allocate new project CSV ids/paths for package CSVs.
3. Remap chart-object csvIds to new project ids.
4. Allocate independent new chart id.
5. Candidate-set target slot to own that chart and apply package slot caption.
6. Validate whole project.
7. Commit CSV/chart/slot/nextId changes once.
8. Return result.

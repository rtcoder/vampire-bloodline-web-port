#!/usr/bin/env python3
"""Read-only integrity verification for this specific handoff; Python 3.10+."""

from __future__ import annotations

import hashlib
import io
import json
import sys
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
JAR_NAME = "vampire-bloodline-176x208.jar"
EXPECTED_SHA256 = "ebe705c790f989af9b81c698b2f794fdac88266e75a6b704b9fbcbe94f631ab8"
EXPECTED_BYTES = 160575
EXPECTED_FILES = 60


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def project_path(relative: str) -> Path:
    """Reject malformed paths and links escaping the package."""
    if not isinstance(relative, str) or not relative:
        raise ValueError("expected a nonempty relative project path")
    path = Path(relative)
    if path.is_absolute() or ".." in path.parts:
        raise ValueError(f"unsafe project path: {relative!r}")
    resolved = (ROOT / path).resolve()
    if not resolved.is_relative_to(ROOT):
        raise ValueError(f"path escapes project: {relative!r}")
    return resolved


def read_object(relative: str) -> dict:
    value = json.loads(project_path(relative).read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{relative}: expected a JSON object")
    return value


def verify() -> dict:
    errors: list[str] = []
    counts = {"jar_members": 0, "verified_member_hashes": 0,
              "verified_exports": 0, "verified_manifest_copy": False,
              "verified_remaster_assets": 0}
    result = {
        "status": "failed",
        "mode": "read_only_static_verification; MIDlet not executed",
        "expected_jar": {"name": JAR_NAME, "bytes": EXPECTED_BYTES,
                         "sha256": EXPECTED_SHA256},
        "verified": counts,
        "errors": errors,
        "remaster_plan": {
            "status": "not_checked",
            "scope": "Source mapping, hashes, PNG dimensions and 4x targets; "
                     "AI workflow status and generated output quality are not certified.",
        },
    }

    def expect(condition: bool, message: str) -> None:
        if not condition:
            errors.append(message)

    try:
        provenance = read_object("source/provenance.json")
        inventory = read_object("reports/jar_inventory.json")
        jar_bytes = project_path(f"source/{JAR_NAME}").read_bytes()
        digest = sha256(jar_bytes)
        expect(provenance.get("local_filename") == JAR_NAME,
               "provenance.local_filename does not match the expected JAR")
        expect(provenance.get("sha256") == EXPECTED_SHA256 == digest,
               "JAR SHA-256 differs from provenance or the pinned source hash")
        expect(provenance.get("size_bytes") == EXPECTED_BYTES == len(jar_bytes),
               "JAR byte count differs from provenance or the pinned source size")
        expect(inventory.get("jar_name") == JAR_NAME,
               "inventory.jar_name differs from the source filename")
        expect(inventory.get("jar_sha256") == digest,
               "inventory.jar_sha256 differs from the JAR")
        expect(inventory.get("jar_bytes") == len(jar_bytes),
               "inventory.jar_bytes differs from the JAR")

        entries = inventory.get("files")
        if not isinstance(entries, list):
            raise ValueError("inventory.files must be a list")
        listed: dict[str, dict] = {}
        for entry in entries:
            if not isinstance(entry, dict) or not isinstance(entry.get("jar_path"), str):
                errors.append("inventory contains a malformed file entry")
                continue
            name = entry["jar_path"]
            expect(name not in listed, f"duplicate inventory member: {name}")
            listed[name] = entry

        with zipfile.ZipFile(io.BytesIO(jar_bytes)) as archive:
            all_infos = archive.infolist()
            infos = [info for info in all_infos if not info.is_dir()]
            counts["jar_members"] = len(infos)
            names = [info.filename for info in infos]
            expect(len(names) == len(set(names)), "JAR contains duplicate file names")
            expect(len(infos) == len(entries) == len(listed) == EXPECTED_FILES,
                   "JAR and inventory must each contain exactly 60 unique files")
            expect(provenance.get("file_count") == len(infos),
                   "provenance.file_count differs from the JAR")
            expect(provenance.get("archive_entry_count") == len(all_infos),
                   "provenance.archive_entry_count differs from the JAR")
            inventory_counts = inventory.get("counts", {})
            if not isinstance(inventory_counts, dict):
                raise ValueError("inventory.counts must be an object")
            expect(inventory_counts.get("files") == len(infos),
                   "inventory.counts.files differs from the JAR")
            missing = sorted(set(names) - set(listed))
            extra = sorted(set(listed) - set(names))
            expect(not missing, f"members absent from inventory: {missing}")
            expect(not extra, f"inventory members absent from JAR: {extra}")

            bad_crc = archive.testzip()
            expect(bad_crc is None, f"JAR ZIP CRC check failed: {bad_crc}")
            result["zip_crc"] = "passed" if bad_crc is None else "failed"

            exported_paths: set[str] = set()
            for info in infos:
                data = archive.read(info)
                entry = listed.get(info.filename)
                if entry is None:
                    continue
                error_count = len(errors)
                expect(entry.get("bytes") == info.file_size == len(data),
                       f"member size mismatch: {info.filename}")
                expect(entry.get("sha256") == sha256(data),
                       f"member SHA-256 mismatch: {info.filename}")
                expect(entry.get("zip_crc32") == f"{info.CRC:08x}",
                       f"inventory CRC-32 mismatch: {info.filename}")
                if info.filename.endswith(".png"):
                    valid_header = (len(data) >= 24
                                    and data[:8] == b"\x89PNG\r\n\x1a\n"
                                    and data[12:16] == b"IHDR")
                    expect(valid_header, f"invalid PNG header: {info.filename}")
                    if valid_header:
                        width = int.from_bytes(data[16:20], "big")
                        height = int.from_bytes(data[20:24], "big")
                        expect(entry.get("format") == "png"
                               and entry.get("width") == width
                               and entry.get("height") == height,
                               f"inventory PNG dimensions/format mismatch: {info.filename}")
                if len(errors) == error_count:
                    counts["verified_member_hashes"] += 1

                if "export_path" in entry:
                    export_name = entry["export_path"]
                    try:
                        path = project_path(export_name)
                        canonical = str(path)
                        expect(canonical not in exported_paths,
                               f"duplicate export destination: {export_name}")
                        exported_paths.add(canonical)
                        if path.read_bytes() == data:
                            counts["verified_exports"] += 1
                        else:
                            errors.append(f"export differs from JAR bytes: {export_name}")
                    except (OSError, ValueError, TypeError) as exc:
                        errors.append(f"cannot verify export {export_name!r}: {exc}")

            manifest = archive.read("META-INF/MANIFEST.MF")
            exact_manifest = project_path("source/MANIFEST.MF").read_bytes() == manifest
            expect(exact_manifest, "source/MANIFEST.MF differs from the JAR bytes")
            counts["verified_manifest_copy"] = exact_manifest

            for extension, provenance_key, inventory_key, expected in (
                (".class", "class_count", "classes", 6),
                (".png", "png_count", "standalone_images", 25),
                (".wav", "wav_count", "recognized_audio_files", 13),
            ):
                actual = sum(name.endswith(extension) for name in names)
                expect(actual == expected == provenance.get(provenance_key)
                       == inventory_counts.get(inventory_key),
                       f"{extension} count mismatch between JAR, provenance and inventory")

        plan_path = project_path("assets/remaster-plan.json")
        if not plan_path.exists():
            result["remaster_plan"]["status"] = "not_present"
            errors.append("assets/remaster-plan.json is missing from the handoff")
        else:
            plan_error_count = len(errors)
            plan = read_object("assets/remaster-plan.json")
            expect(plan.get("asset_scale") == 4, "remaster plan asset_scale must be 4")
            assets = plan.get("assets")
            if not isinstance(assets, list):
                raise ValueError("remaster plan assets must be a list")
            png_entries = {name: entry for name, entry in listed.items()
                           if name.endswith(".png")}
            expect(len(assets) == len(png_entries) == 25,
                   "remaster plan and inventory must each contain exactly 25 PNG assets")
            seen_names: set[str] = set()
            seen_ids: set[str] = set()
            for asset in assets:
                if not isinstance(asset, dict):
                    errors.append("remaster plan contains a malformed asset entry")
                    continue
                asset_error_count = len(errors)
                name = asset.get("jar_path")
                if not isinstance(name, str) or name not in png_entries:
                    errors.append(f"unknown PNG in remaster plan: {name!r}")
                    continue
                expect(name not in seen_names, f"duplicate remaster PNG: {name}")
                seen_names.add(name)
                asset_id = asset.get("id")
                if not isinstance(asset_id, str) or not asset_id:
                    errors.append(f"missing or invalid remaster asset id: {name}")
                else:
                    expect(asset_id not in seen_ids, f"duplicate remaster asset id: {asset_id}")
                    seen_ids.add(asset_id)
                entry = png_entries[name]
                expect(asset.get("source_path") == entry.get("export_path"),
                       f"remaster source_path differs from inventory: {name}")
                expect(asset.get("source_sha256") == entry.get("sha256"),
                       f"remaster source_sha256 differs from inventory: {name}")
                for axis in ("width", "height"):
                    source_size = entry.get(axis)
                    if not isinstance(source_size, int) or source_size <= 0:
                        errors.append(f"invalid inventory {axis} for remaster source: {name}")
                        continue
                    expect(asset.get(f"source_{axis}") == source_size,
                           f"remaster source_{axis} differs from inventory: {name}")
                    expect(asset.get(f"target_{axis}") == source_size * 4,
                           f"remaster target_{axis} is not exactly 4x the source: {name}")
                if len(errors) == asset_error_count:
                    counts["verified_remaster_assets"] += 1
            expect(seen_names == set(png_entries),
                   "remaster plan does not cover every original PNG exactly once")
            result["remaster_plan"]["status"] = (
                "passed" if len(errors) == plan_error_count else "failed"
            )
    except (OSError, ValueError, TypeError, KeyError, zipfile.BadZipFile,
            RuntimeError, NotImplementedError) as exc:
        errors.append(f"verification could not finish: {type(exc).__name__}: {exc}")

    result["status"] = "failed" if errors else "passed"
    return result


def main() -> int:
    if len(sys.argv) != 1:
        print(json.dumps({"status": "failed", "errors": [
            "This verifier takes no arguments; it finds the project from __file__."
        ]}, indent=2))
        return 1
    result = verify()
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["status"] == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())

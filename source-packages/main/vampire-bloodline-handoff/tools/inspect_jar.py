#!/usr/bin/env python3
"""Read a J2ME archive without executing its classes; export byte-exact resources.

Python 3.10+, standard library only. All output is local and deterministic.
This is an inventory tool, not a game-specific sprite/level decoder.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import stat
import struct
import zipfile


PNG = b"\x89PNG\r\n\x1a\n"
MAX_UNCOMPRESSED = 64 * 1024 * 1024


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def manifest_attributes(data: bytes) -> dict[str, str]:
    lines: list[str] = []
    for line in data.decode("utf-8", errors="replace").splitlines():
        if line.startswith(" ") and lines:
            lines[-1] += line[1:]
        else:
            lines.append(line)
    result = {}
    for line in lines:
        if ": " in line:
            key, value = line.split(": ", 1)
            result[key] = value
    return result


def class_strings(data: bytes) -> dict:
    if not data.startswith(b"\xca\xfe\xba\xbe") or len(data) < 10:
        raise ValueError("Invalid class file")
    minor, major, count = struct.unpack_from(">HHH", data, 4)
    position, index = 10, 1
    strings = []
    fixed = {3: 4, 4: 4, 5: 8, 6: 8, 7: 2, 8: 2, 9: 4, 10: 4,
             11: 4, 12: 4, 15: 3, 16: 2, 17: 4, 18: 4, 19: 2, 20: 2}
    while index < count:
        tag = data[position]
        position += 1
        if tag == 1:
            length = struct.unpack_from(">H", data, position)[0]
            position += 2
            raw = data[position:position + length]
            if len(raw) != length:
                raise ValueError("Truncated constant pool string")
            # JVM uses modified UTF-8. Replacement decoding is sufficient for
            # human inspection of ASCII API/resource names, not Java execution.
            strings.append(raw.replace(b"\xc0\x80", b"\0").decode("utf-8", "replace"))
            position += length
        elif tag in fixed:
            position += fixed[tag]
            if tag in (5, 6):
                index += 1
        else:
            raise ValueError(f"Unknown constant pool tag {tag}")
        if position > len(data):
            raise ValueError("Truncated constant pool")
        index += 1
    return {"class_version": f"{major}.{minor}", "utf8_constants": sorted(set(strings))}


def identify(data: bytes) -> dict:
    if data.startswith(PNG) and len(data) >= 33:
        width, height, depth, color_type = struct.unpack_from(">IIBB", data, 16)
        return {"format": "png", "width": width, "height": height,
                "bit_depth": depth, "color_type": color_type,
                "has_alpha_channel": color_type in (4, 6),
                "has_transparency_chunk": b"tRNS" in data}
    if data.startswith((b"GIF87a", b"GIF89a")) and len(data) >= 10:
        width, height = struct.unpack_from("<HH", data, 6)
        return {"format": "gif", "width": width, "height": height}
    if data.startswith(b"\xff\xd8\xff"):
        return {"format": "jpeg"}
    if data.startswith(b"BM"):
        return {"format": "bmp"}
    if data.startswith(b"MThd"):
        return {"format": "midi"}
    if data.startswith(b"RIFF") and data[8:12] == b"WAVE":
        return {"format": "wav"}
    if data.startswith(b"#!AMR"):
        return {"format": "amr"}
    if data.startswith(b"OggS"):
        return {"format": "ogg"}
    if data.startswith(b"\xca\xfe\xba\xbe"):
        return {"format": "java-class"}
    return {"format": "unknown", "first_16_bytes_hex": data[:16].hex()}


def safe_relative(name: str) -> Path:
    value = PurePosixPath(name)
    if value.is_absolute() or ".." in value.parts or "\\" in name or ":" in name:
        raise ValueError(f"Unsafe archive member: {name!r}")
    if not value.parts:
        raise ValueError("Empty archive member")
    return Path(*value.parts)


def write_exact(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_bytes() != data:
        raise ValueError(f"Refusing to overwrite different bytes: {path}")
    path.write_bytes(data)


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("jar", nargs="?", type=Path,
                        default=root / "source/vampire-bloodline-176x208.jar")
    parser.add_argument("--output", type=Path, default=root)
    parser.add_argument("--extract", action="store_true", help="Export resources byte for byte")
    args = parser.parse_args()
    jar, output = args.jar.resolve(), args.output.resolve()
    raw_jar = jar.read_bytes()
    records, constants = [], {}
    image_count = audio_count = class_count = 0
    manifest = {}
    with zipfile.ZipFile(jar) as archive:
        entries = archive.infolist()
        if sum(entry.file_size for entry in entries) > MAX_UNCOMPRESSED:
            raise ValueError("Archive exceeds 64 MiB uncompressed limit")
        if len({entry.filename for entry in entries}) != len(entries):
            raise ValueError("Archive contains duplicate member names")
        if archive.testzip() is not None:
            raise ValueError("Archive CRC validation failed")
        for entry in entries:
            relative = safe_relative(entry.filename)
            if stat.S_ISLNK(entry.external_attr >> 16):
                raise ValueError(f"Symlink archive entry: {entry.filename}")
            if entry.is_dir():
                continue
            data = archive.read(entry)
            info = identify(data)
            record = {"jar_path": entry.filename, "bytes": len(data),
                      "sha256": sha256(data), "zip_crc32": f"{entry.CRC:08x}", **info}
            destination = None
            if entry.filename.upper() == "META-INF/MANIFEST.MF":
                manifest = manifest_attributes(data)
                destination = Path("reports/MANIFEST.MF")
            elif info["format"] == "java-class":
                class_count += 1
                constants[entry.filename] = class_strings(data)
            elif info["format"] in ("png", "gif", "jpeg", "bmp"):
                image_count += 1
                destination = Path("assets/original") / relative
            elif info["format"] in ("midi", "wav", "amr", "ogg"):
                audio_count += 1
                destination = Path("assets/audio-original") / relative
            else:
                destination = Path("reference/resources") / relative
            if destination is not None:
                record["export_path"] = destination.as_posix()
                if args.extract:
                    write_exact(output / destination, data)
            records.append(record)
    all_strings = {item for entry in constants.values() for item in entry["utf8_constants"]}
    platform_names = ("javax/microedition", "com/nokia", "com/siemens", "com/sony",
                      "platformRequest", "Connector", "RecordStore", "getResourceAsStream",
                      "createImage", "createPlayer", "playTone", "sleep", "currentTimeMillis")
    inventory = {
        "schema_version": 1,
        "method": "Static ZIP and class-constant-pool inspection; MIDlet never executed",
        "jar_name": jar.name, "jar_bytes": len(raw_jar), "jar_sha256": sha256(raw_jar),
        "zip_crc_status": "passed", "manifest": manifest,
        "counts": {"files": len(records), "classes": class_count,
                   "standalone_images": image_count, "recognized_audio_files": audio_count},
        "limitations": [
            "Unknown binary resources may contain packed images, sound, maps or sprite metadata.",
            "Standalone image dimensions are not sprite-frame dimensions.",
            "Constant-pool references do not prove that a code path is used at runtime.",
            "No control scheme, game timestep, level count or combat timing inferred from names alone."
        ],
        "platform_api_and_loader_references": sorted(
            value for value in all_strings if any(token in value for token in platform_names)),
        "files": sorted(records, key=lambda record: record["jar_path"])
    }
    reports = output / "reports"
    reports.mkdir(parents=True, exist_ok=True)
    (reports / "jar_inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (reports / "class_strings.json").write_text(json.dumps(constants, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"jar": str(jar), "sha256": inventory["jar_sha256"],
                      "counts": inventory["counts"], "extracted": args.extract}, ensure_ascii=False))


if __name__ == "__main__":
    main()

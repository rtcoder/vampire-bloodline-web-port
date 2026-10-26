#!/usr/bin/env bash
# Static decompilation only. The supplied CFR JAR is executed, not the game MIDlet.
set -euo pipefail

if (( $# < 1 || $# > 2 )); then
    printf '%s\n' 'Usage: bash tools/decompile.sh /path/to/cfr.jar [OUTPUT_DIR]' >&2
    printf '%s\n' 'Relative OUTPUT_DIR is resolved from the current working directory.' >&2
    exit 1
fi

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
project_root=$(cd -- "$script_dir/.." && pwd -P)
cfr_jar=$1
output_dir=${2-"$project_root/reference/decompiled-local"}
source_jar="$project_root/source/vampire-bloodline-176x208.jar"

if [[ -z "$output_dir" ]]; then
    printf '%s\n' 'OUTPUT_DIR must not be empty.' >&2
    exit 1
fi
# Absolute paths also keep leading dashes in user filenames out of option parsing.
case "$cfr_jar" in
    /*) ;;
    *) cfr_jar="$PWD/$cfr_jar" ;;
esac
case "$output_dir" in
    /*) ;;
    *) output_dir="$PWD/$output_dir" ;;
esac

if [[ ! -f "$cfr_jar" || ! -r "$cfr_jar" ]]; then
    printf 'Cannot read CFR JAR: %s\n' "$cfr_jar" >&2
    exit 1
fi
if [[ ! -f "$source_jar" || ! -r "$source_jar" ]]; then
    printf 'Cannot read source JAR: %s\n' "$source_jar" >&2
    exit 1
fi
if [[ -e "$output_dir" && ! -d "$output_dir" ]]; then
    printf 'Output is not a directory: %s\n' "$output_dir" >&2
    exit 1
fi
if [[ -d "$output_dir" ]]; then
    first_entry=$(find "$output_dir" -mindepth 1 -maxdepth 1 -print -quit)
    if [[ -n "$first_entry" ]]; then
        printf 'Refusing to overwrite nonempty output directory: %s\n' "$output_dir" >&2
        exit 1
    fi
fi
if ! command -v java >/dev/null 2>&1; then
    printf '%s\n' 'Java is not available on PATH. Install a Java runtime first.' >&2
    exit 1
fi

mkdir -p -- "$output_dir"
exec java -jar "$cfr_jar" "$source_jar" \
    --outputdir "$output_dir" \
    --renamedupmembers true \
    --renameillegalidents true

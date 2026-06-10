#!/bin/bash
# parse_toml <section> <key> <config_file>
# Reads a quoted string value from a TOML section.
parse_toml() {
  local section="$1" key="$2" file="$3"
  grep -A10 "^\[$section\]" "$file" \
    | grep "^${key}" \
    | head -1 \
    | sed 's/.*= *"\(.*\)"/\1/'
}

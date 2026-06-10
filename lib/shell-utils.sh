#!/bin/bash
UTILS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# parse_toml <section> <key> <config_file>
parse_toml() {
  python3 "$UTILS_DIR/toml-get.py" "$3" "$1" "$2"
}

#!/usr/bin/env python3
import sys, tomllib

config, *keys = sys.argv[1:]
with open(config, "rb") as f:
    val = tomllib.load(f)
for k in keys:
    val = val[k]
if isinstance(val, list):
    print(",".join(str(v) for v in val))
else:
    print(val)

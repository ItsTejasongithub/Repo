"""
inspect_glb.py — read animation names, bone names, and mesh info from any .glb file.

Usage:
    python inspect_glb.py                        # inspects UltimateProCharacter.glb by default
    python inspect_glb.py MyModel.glb
    python inspect_glb.py "C:/full/path/to/model.glb"
"""

import struct, json, sys, os

path = sys.argv[1] if len(sys.argv) > 1 else "UltimateProCharacter.glb"

if not os.path.isabs(path):
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), path)

if not os.path.exists(path):
    print(f"File not found: {path}")
    sys.exit(1)

with open(path, 'rb') as f:
    magic = f.read(4)
    if magic != b'glTF':
        print("Not a valid .glb file.")
        sys.exit(1)
    f.seek(12)
    chunk_len = struct.unpack('<I', f.read(4))[0]
    f.read(4)
    data = json.loads(f.read(chunk_len))

print(f"\nFile : {os.path.basename(path)}")
print("=" * 50)

animations = data.get('animations', [])
print(f"\n=== ANIMATIONS ({len(animations)}) ===")
for i, a in enumerate(animations):
    print(f"  [{i+1:>2}]  {a.get('name', 'unnamed')}")

nodes = [n for n in data.get('nodes', []) if n.get('name')]
print(f"\n=== BONES / NODES ({len(nodes)}) ===")
idx_to_name = {i: n.get('name', f'node{i}') for i, n in enumerate(data.get('nodes', []))}

for i, n in enumerate(data.get('nodes', [])):
    name = n.get('name')
    if not name:
        continue
    line = f"  {name}"
    if name in {"Head", "NeckTwist01", "NeckTwist02"}:
        parents = [idx_to_name[j] for j, m in enumerate(data.get('nodes', [])) if i in m.get('children', [])]
        children = [idx_to_name[c] for c in n.get('children', [])]
        line += f"  parent={parents or ['<root>']} children={children}"
        if n.get('rotation') is not None:
            line += f" rot={n.get('rotation')}"
        if n.get('translation') is not None:
            line += f" pos={n.get('translation')}"
    print(line)

meshes = data.get('meshes', [])
print(f"\n=== MESHES ({len(meshes)}) ===")
for m in meshes:
    print(f"  {m.get('name', 'unnamed')}")

print()

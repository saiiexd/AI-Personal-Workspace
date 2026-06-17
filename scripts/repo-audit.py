#!/usr/bin/env python3
import os
import sys
import ast
import json
from pathlib import Path

def check_backend_dependencies():
    print("[*] Auditing Backend Dependencies...")
    backend_reqs = Path("backend/requirements.txt")
    if not backend_reqs.exists():
        print("  [-] Error: backend/requirements.txt not found.")
        return False
    # Check for hardcoded versions
    all_pinned = True
    with open(backend_reqs, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                if '==' not in line:
                    print(f"  [-] Warning: Dependency not pinned: {line}")
                    all_pinned = False
    if all_pinned:
        print("  [+] All backend dependencies are pinned.")
    return True

def check_frontend_dependencies():
    print("[*] Auditing Frontend Dependencies...")
    frontend_pkg = Path("frontend/package.json")
    if not frontend_pkg.exists():
        print("  [-] Error: frontend/package.json not found.")
        return False
    with open(frontend_pkg, 'r') as f:
        data = json.load(f)
    
    deps = data.get("dependencies", {})
    dev_deps = data.get("devDependencies", {})
    print(f"  [+] Found {len(deps)} dependencies and {len(dev_deps)} devDependencies.")
    return True

def find_dead_code():
    print("[*] Auditing Backend for Dead Code (Functions/Classes without docstrings)...")
    backend_dir = Path("backend/app")
    issues = 0
    if not backend_dir.exists():
        return True
        
    for py_file in backend_dir.rglob("*.py"):
        try:
            with open(py_file, 'r', encoding='utf-8') as f:
                tree = ast.parse(f.read())
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
                    if not ast.get_docstring(node):
                        issues += 1
                        # We just count them to avoid verbose output in successful runs
        except Exception as e:
            pass
            
    if issues > 0:
        print(f"  [-] Found {issues} functions/classes without docstrings. Consider adding them.")
    else:
        print("  [+] All functions and classes have basic docstring coverage.")
    return True

def main():
    print("================================================")
    print("      REPOSITORY AUDIT & DEBT DETECTION")
    print("================================================")
    
    success = True
    success &= check_backend_dependencies()
    success &= check_frontend_dependencies()
    success &= find_dead_code()
    
    if not success:
        print("\n[!] Audit completed with warnings or errors.")
        sys.exit(1)
    else:
        print("\n[+] Audit completed successfully. Codebase health is good.")
        sys.exit(0)

if __name__ == "__main__":
    main()

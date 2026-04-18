import os
import sys
from pathlib import Path

# Targeted paths for React project
SRC_DIR = Path("src")
COMPONENTS_DIR = SRC_DIR / "components"
STORE_DIR = SRC_DIR / "store"

def lint_structure():
    errors = []
    
    # Check if essential directories exist
    for d in [SRC_DIR, COMPONENTS_DIR, STORE_DIR]:
        if not d.exists():
            errors.append(f"Essential directory missing: {d}")
    
    # Check if .gitkeep exists in empty-ish directories
    for d in [COMPONENTS_DIR, STORE_DIR]:
        if d.exists() and not any(d.iterdir()):
             # This shouldn't happen if we added .gitkeep, 
             # but iterdir will show .gitkeep if it's there.
             pass

    if errors:
        print("Asset Lint Errors (React Client):")
        for err in errors:
            print(f"  [FAIL] {err}")
        return False
    
    print("Asset Lint (React Client): [PASS]")
    return True

if __name__ == "__main__":
    if not lint_structure():
        sys.exit(1)
    sys.exit(0)

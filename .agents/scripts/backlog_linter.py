import subprocess
import sys
from pathlib import Path

# Absolute path to the global linter
GLOBAL_LINTER = r"${GLOBAL_SCRIPTS}\backlog_linter.py"

def run_linter():
    if not Path(GLOBAL_LINTER).exists():
        print(f"Error: Global linter not found at {GLOBAL_LINTER}")
        sys.exit(1)
        
    result = subprocess.run([sys.executable, GLOBAL_LINTER] + sys.argv[1:])
    sys.exit(result.returncode)

if __name__ == "__main__":
    run_linter()

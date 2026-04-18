import sys
import re
from pathlib import Path

def has_japanese(text):
    """Checks if the text contains Hiragana, Katakana, or Kanji."""
    # Pattern covers Hiragana, Katakana, and common CJK Kanji
    return bool(re.search(r'[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]', text))

def lint_artifacts(brain_dir):
    path = Path(brain_dir)
    if not path.exists():
         print(f"Error: Target directory not found: {path}")
         # We return True here sometimes if it's just not initialized, but for a lint tool we should fail if targeted.
         return False

    errors = []
    # Files to check for Japanese content
    files_to_check = ["implementation_plan.md", "walkthrough.md", "task.md"]
    checked_count = 0
    
    for filename in files_to_check:
        file_path = path / filename
        if file_path.exists():
            checked_count += 1
            content = file_path.read_text(encoding="utf-8")
            if not has_japanese(content):
                errors.append(f"{filename}: Language check failed. Content must be in Japanese.")
            else:
                print(f"  [PASS] {filename}: Language check (Japanese detected)")

    if not checked_count:
        print(f"No relevant artifacts found in {brain_dir} to lint.")
        return True

    if errors:
        print("\nArtifact Lint Errors:")
        for err in errors:
            print(f"  [FAIL] {err}")
        return False
    
    print("\nArtifact Lint: ALL PASSED")
    return True

if __name__ == "__main__":
    # If no arg provided, look in . (current dir)
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    
    if not lint_artifacts(target):
        sys.exit(1)
    sys.exit(0)

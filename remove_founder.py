import os
import re
import glob

directory = '/Users/batuhanacar/.gemini/antigravity/brain/7d871894-640f-41a7-b96b-cb2df862f267/'
files = glob.glob(os.path.join(directory, '*.md'))

replacements = [
    (re.compile(r'Batuhan Acar', re.IGNORECASE), 'Kurucu'),
    (re.compile(r'Necmi Batuhan', re.IGNORECASE), 'Kurucu'),
]

for path in files:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for pattern, repl in replacements:
        new_content = pattern.sub(repl, new_content)
        
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {path}")

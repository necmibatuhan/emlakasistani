import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace all occurrences of import.meta.env.VITE_API_URL || 'http://localhost:5001'
    # with (import.meta.env.VITE_API_URL ?? 'http://localhost:5001')
    
    new_content = content.replace("import.meta.env.VITE_API_URL || 'http://localhost:5001'", "(import.meta.env.VITE_API_URL ?? 'http://localhost:5001')")
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk('client/src'):
    for file in files:
        if file.endswith(('.jsx', '.js')):
            process_file(os.path.join(root, file))

print("Done fixing URLs.")

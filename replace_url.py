import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace 'http://localhost:5001...' with `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}...`
    # Match single quote
    content = re.sub(r"'http://localhost:5001(.*?)'", r"`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}\1`", content)
    # Match double quote
    content = re.sub(r'"http://localhost:5001(.*?)"', r"`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}\1`", content)
    # Match backtick (already a template literal)
    content = re.sub(r"`http://localhost:5001(.*?)`", r"`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}\1`", content)

    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('client/src'):
    for file in files:
        if file.endswith(('.jsx', '.js')):
            process_file(os.path.join(root, file))

print("Done replacing URLs.")

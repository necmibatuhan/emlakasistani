import os
import re

directory = 'client/src'
replacements = [
    (re.compile(r'\bCRM(?=\sEntegrasyon)'), 'Sistem'),
    (re.compile(r'\bCRM(?=[\'’]e\b)', re.IGNORECASE), 'Sistem'),
    (re.compile(r'\bCRM(?=[\'’]i\b)', re.IGNORECASE), 'Sistem'),
    (re.compile(r'\bEmlak CRM programı\b', re.IGNORECASE), 'Emlak Asistanı'),
    (re.compile(r'\bEmlak CRM\b', re.IGNORECASE), 'Emlak Asistanı'),
    (re.compile(r'\bgayrimenkul crm\b', re.IGNORECASE), 'gayrimenkul asistanı'),
    (re.compile(r'\bCRM işlevlerini\b', re.IGNORECASE), 'sistem işlevlerini'),
    (re.compile(r'\bCRM kaydı\b', re.IGNORECASE), 'sistem kaydı'),
    (re.compile(r'\bCRM stratejileri\b', re.IGNORECASE), 'sistem stratejileri'),
    (re.compile(r'\bCRM\b', re.IGNORECASE), 'Sistem'),
]

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for pattern, repl in replacements:
                new_content = pattern.sub(repl, new_content)
                
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {path}")

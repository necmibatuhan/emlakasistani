import os
import re

path = 'client/index.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    (re.compile(r'CRM Programı', re.IGNORECASE), 'Sistem'),
    (re.compile(r'CRM yazılımını', re.IGNORECASE), 'Sistemini'),
    (re.compile(r'emlak crm', re.IGNORECASE), 'emlak asistanı'),
    (re.compile(r'destekli CRM', re.IGNORECASE), 'destekli Sistem'),
    (re.compile(r'Yeni Nesil Emlak CRM', re.IGNORECASE), 'Yeni Nesil Emlak Sistemi'),
    (re.compile(r'Müşteri İlişkileri \(CRM\) ve İş Takip', re.IGNORECASE), 'İş Takip'),
]

new_content = content
for pattern, repl in replacements:
    new_content = pattern.sub(repl, new_content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

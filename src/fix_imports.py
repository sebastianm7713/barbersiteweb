#!/usr/bin/env python3
import os
import re
from pathlib import Path

# Directorio raíz del proyecto
root_dir = Path(".")

# Patrones a reemplazar
patterns = [
    (r'"@radix-ui/react-([a-z-]+)@[\d.]+"', r'"@radix-ui/react-\1"'),
    (r"'@radix-ui/react-([a-z-]+)@[\d.]+\'", r"'@radix-ui/react-\1'"),
    (r'"class-variance-authority@[\d.]+"', r'"class-variance-authority"'),
    (r"'class-variance-authority@[\d.]+\'", r"'class-variance-authority'"),
    (r'"lucide-react@[\d.]+"', r'"lucide-react"'),
    (r"'lucide-react@[\d.]+\'", r"'lucide-react'"),
]

# Extensiones de archivo a procesar
extensions = ['.tsx', '.ts', '.jsx', '.js']

count = 0

# Buscar todos los archivos
for file_path in root_dir.rglob('*'):
    if file_path.suffix in extensions and 'node_modules' not in str(file_path):
        try:
            content = file_path.read_text(encoding='utf-8')
            original_content = content
            
            for pattern, replacement in patterns:
                content = re.sub(pattern, replacement, content)
            
            if content != original_content:
                file_path.write_text(content, encoding='utf-8')
                print(f"✓ Fixed: {file_path}")
                count += 1
        except Exception as e:
            print(f"✗ Error in {file_path}: {e}")

print(f"\nTotal files fixed: {count}")

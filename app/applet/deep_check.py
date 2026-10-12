import os
import re

for root, dirs, files in os.walk('/app/applet/src'):
    for f in files:
        if f.endswith('.tsx'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as fp:
                content = fp.read()
            
            lines = content.split('\n')
            comp_name = None
            hook_lines = []
            return_lines = []
            brace = 0
            comp_brace = 0
            
            for i, line in enumerate(lines):
                m = re.search(r'(?:export\s+)?(?:default\s+)?(?:function\s+([A-Z]\w*)|const\s+([A-Z]\w*)\s*[:=])', line)
                if m and '{' in line and comp_name is None:
                    comp_name = m.group(1) or m.group(2)
                    comp_brace = brace
                    hook_lines = []
                    return_lines = []
                
                s = re.sub(r'"[^"]*"', '', line)
                s = re.sub(r"'[^']*'", '', s)
                s = re.sub(r'//.*$', '', s)
                
                if comp_name is not None:
                    if re.search(r'\b(use[A-Z]\w*)\s*\(', s):
                        for r_num, r_txt in return_lines:
                            print(f'CRITICAL HOOK VIOLATION in {f} ({comp_name}):')
                            print(f'  Return on line {r_num}: {r_txt}')
                            print(f'  Hook on line {i+1}: {line.strip()}')
                    
                    if re.search(r'\breturn\b', s):
                        if not re.search(r'=>|\bfunction\b', s):
                            if brace <= comp_brace + 2:
                                return_lines.append((i + 1, line.strip()))
                
                brace += s.count('{') - s.count('}')
                if comp_name is not None and brace <= comp_brace:
                    comp_name = None

import os
import re

def analyze_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    
    comp_regex = re.compile(r'^(?:export\s+)?(?:default\s+)?(?:function\s+([A-Z]\w*)|const\s+([A-Z]\w*)\s*(?::\s*[^=]+)?=\s*(?:\([^)]*\)|[A-Za-z0-9_]+)\s*=>)')
    
    in_comp = False
    comp_name = ''
    brace_depth = 0
    comp_start_brace = 0
    returns = []
    hooks = []
    
    for idx, raw_line in enumerate(lines):
        line_num = idx + 1
        line = re.sub(r'//.*$', '', raw_line)
        line_no_strings = re.sub(r'([\'"]).*?\1', '', line)
        
        m = comp_regex.search(raw_line)
        if m and not in_comp:
            in_comp = True
            comp_name = m.group(1) or m.group(2)
            comp_start_brace = brace_depth
            returns = []
            hooks = []
        
        if in_comp:
            trimmed = line_no_strings.strip()
            if brace_depth == comp_start_brace + 1:
                if re.match(r'^(?:if\s*\(.*?\)\s*)?return\b', trimmed):
                    returns.append((line_num, raw_line.strip()))
                hook_match = re.search(r'\b(use[A-Z]\w*)\s*\(', line_no_strings)
                if hook_match:
                    hook_name = hook_match.group(1)
                    hooks.append((line_num, hook_name, raw_line.strip()))
                    if returns:
                        print(f"HOOK VIOLATION in {filepath} -> Component {comp_name}")
                        print(f"  Return at line {returns[0][0]}: {returns[0][1]}")
                        print(f"  Hook at line {line_num}: {hook_name} ({raw_line.strip()})")
            elif brace_depth == comp_start_brace + 2:
                if re.match(r'^return\b', trimmed):
                    returns.append((line_num, raw_line.strip()))

        open_c = line_no_strings.count('{')
        close_c = line_no_strings.count('}')
        brace_depth += open_c - close_c
        
        if in_comp and brace_depth <= comp_start_brace:
            in_comp = False
            comp_name = ''

for root, dirs, files in os.walk('/app/applet/src'):
    for f in files:
        if f.endswith('.tsx'):
            analyze_file(os.path.join(root, f))
print("Done scanning.")

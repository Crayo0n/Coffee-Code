import sys

with open(r'c:\CAFECODE09\Coffee-Code\API\app\routers\estadisticas.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(r'logo_path = r"c:\CAFECODE09\Coffee-Code\API\logo.png"', r'logo_path = r"/code/logo.png"')
content = content.replace(r'logo_path = r"c:\\CAFECODE09\\Coffee-Code\\API\\logo.png"', r'logo_path = r"/code/logo.png"')

with open(r'c:\CAFECODE09\Coffee-Code\API\app\routers\estadisticas.py', 'w', encoding='utf-8') as f:
    f.write(content)

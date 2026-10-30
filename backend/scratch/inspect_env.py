file_path = 'c:/healthcare/backend/.env'
with open(file_path, 'rb') as f:
    content = f.read()
    print(f"File bytes: {content!r}")

with open(file_path, 'r') as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        print(f"Line {i+1}: {repr(line)}")

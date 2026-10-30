import socket
import os

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

print(f"Checking port 8000: {'In use' if is_port_in_use(8000) else 'Free'}")
print(f"Current Process PID: {os.getpid()}")
print(f"Current File: {__file__}")

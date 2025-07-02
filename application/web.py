import subprocess
uuid = subprocess.check_output('wmic csproduct get uuid', shell=True).decode().split('\n')[1].strip()
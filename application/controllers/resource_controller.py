import psutil
import time
import wmi
import sys
from cpuinfo import get_cpu_info
import ctypes
import ctypes.wintypes

def get_disk_info() -> tuple:
    """Returns the total and free disk space in GB across all partitions."""
    total = 0
    free = 0
    for part in psutil.disk_partitions(all=False):
        if 'cdrom' in part.opts or part.fstype == '':
            continue
        usage = psutil.disk_usage(part.mountpoint)
        total += usage.total
        free += usage.free

    total_gb = round(total / (1024 ** 3), 1)
    free_gb = round(free / (1024 ** 3), 1)
    return total_gb, free_gb

def get_static_cpu_info() -> dict:
    """Returns static CPU information such as brand, base speed, number of sockets, cores, etc."""
    try:
        c = wmi.WMI()
        cpu = c.Win32_Processor()[0]
        cpu_info = get_cpu_info()

        brand = cpu_info['brand_raw']
        base_speed = str(round(psutil.cpu_freq().max/1000, 2)) + " GHz"
        sockets = len(c.Win32_Processor())
        cores = psutil.cpu_count(logical=False)
        logical_processors = psutil.cpu_count(logical=True)
        virtualization_enabled = "Enabled" if cpu.VirtualizationFirmwareEnabled else "Disabled"
        l1_cache = "not found"
        l2_cache = str(int(cpu.L2CacheSize) // 1024) + " MB"
        l3_cache = str(int(cpu.L3CacheSize) // 1024) + " MB"
        return {
        "brand": brand,
        "baseSpeed": base_speed,
        "sockets": sockets,
        "cores": cores,
        "logicalProcessors": logical_processors,
        "virtualizationEnabled": virtualization_enabled,
        "l1Cache": l1_cache,
        "l2Cache": l2_cache,
        "l3Cache": l3_cache
        }
    except Exception as e:
        print(f"An error occurred while collecting CPU info: {e}")
        return {
            "error": "Failed to collect CPU info",
            "details": str(e)
        }

def get_threads_and_handles() -> dict:
    """
    Returns the total number of threads and handles used by all processes.
    """
    threads = 0
    handles = 0

    for proc in psutil.process_iter(['num_threads', 'num_handles']):
        try:
            if proc.info['num_threads'] is not None:
                threads += proc.info['num_threads']

            if sys.platform == "win32" and proc.info['num_handles'] is not None:
                handles += proc.info['num_handles']

        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    return {
        "threads": threads,
        "handles": handles
    }

def get_dynamic_cpu_info() -> dict:
    """Returns dynamic CPU information such as utilization, current speed, number of processes, and uptime.
    """
    utilization = psutil.cpu_percent(interval=0)
    current_speed = str(round(psutil.cpu_freq().current/1000, 2)) + " GHz"
    processes = len(psutil.pids())
    uptime_seconds = int(time.time() - psutil.boot_time())
    days = uptime_seconds // (24 * 3600)
    hours = (uptime_seconds % (24 * 3600)) // 3600
    minutes = (uptime_seconds % 3600) // 60
    seconds = uptime_seconds % 60
    uptime = f"{days}d:{hours}h:{minutes}m:{seconds}s"

    return {
        "utilization": utilization,
        "currentSpeed": current_speed,
        "processes": processes,
        "upTime": uptime,
    }

def get_static_memory_info() -> dict:
    """Returns static memory information such as manufacturers, total size, speed, slots used, and form factor."""
    memory_info = {}
    try:
        c = wmi.WMI()
        manufacturers = [chip.Manufacturer.strip() for chip in c.Win32_PhysicalMemory()]
        if manufacturers:
            memory_info['manufacturers'] = manufacturers[0]
        memory = psutil.virtual_memory()
        memory_info['totalGB'] = f"{memory.total / (1024**3):.1f} GB"

        memory_modules = c.Win32_PhysicalMemory()
        memory_speed_sum = 0
        slots_used = 0
        form_factor = "Unknown"
        
        for module in memory_modules:
            if module.Capacity:
                memory_speed_sum += module.Speed
                slots_used += 1
                if module.FormFactor == 8:
                    form_factor = "DIMM"
                elif module.FormFactor == 12:
                    form_factor = "SODIMM"
        
        memory_info['speedMTs'] = f"{int(memory_speed_sum / slots_used)} MT/s" if slots_used > 0 else "N/A"
        
        total_slots_array = c.Win32_PhysicalMemoryArray()
        memory_info['slotsUsed'] = f"{slots_used} of {len(total_slots_array)}"
        memory_info['formFactor'] = form_factor
        
        disk_capacity, disk_free_sace = get_disk_info()
        memory_info['diskTotalGB'] = str(disk_capacity) + " GB"
        memory_info['diskFreeGB'] = str(disk_free_sace) + " GB"
    except wmi.WMIError as e:
        print(f"WMI Error: {e}. Ensure WMI service is running and you have necessary permissions.")
        return {"error": "WMI access failed", "details": str(e)}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"error": "Failed to collect memory info", "details": str(e)}

    return memory_info

def get_dynamic_memory_info() -> dict:
    """Returns dynamic memory information such as used GB, utilization percentage, available GB, paged pool, non-paged pool, and system cache."""
    memory_info = {}
    try:
        c = wmi.WMI()
        memory = psutil.virtual_memory()
        memory_info['usedGB'] = f"{memory.used / (1024**3):.1f} GB"
        memory_info['utilization'] = memory.percent
        memory_info['availableGB'] = f"{memory.available / (1024**3):.1f} GB"

        class PERFORMANCE_INFORMATION(ctypes.Structure):
            _fields_ = [
                ("cb", ctypes.wintypes.DWORD),
                ("CommitTotal", ctypes.c_size_t),
                ("CommitLimit", ctypes.c_size_t),
                ("CommitPeak", ctypes.c_size_t),
                ("PhysicalTotal", ctypes.c_size_t),
                ("PhysicalAvailable", ctypes.c_size_t),
                ("SystemCache", ctypes.c_size_t),
                ("KernelTotal", ctypes.c_size_t),
                ("KernelPaged", ctypes.c_size_t),
                ("KernelNonpaged", ctypes.c_size_t),
                ("PageSize", ctypes.c_size_t),
                ("HandleCount", ctypes.wintypes.DWORD),
                ("ProcessCount", ctypes.wintypes.DWORD),
                ("ThreadCount", ctypes.wintypes.DWORD),
            ]

        pi = PERFORMANCE_INFORMATION()
        pi.cb = ctypes.sizeof(pi)
        ctypes.windll.psapi.GetPerformanceInfo(ctypes.byref(pi), pi.cb)

        memory_info["pagedPool"] = str(round(pi.KernelPaged * pi.PageSize / (1024 ** 2), 1)) + " MB"
        memory_info["nonPagedPool"] = str(round(pi.KernelNonpaged * pi.PageSize / (1024 ** 2), 1)) + " MB"
        memory_info["systemCatch"] = str(round((pi.SystemCache * pi.PageSize / (1024 ** 2)) / 1024, 1)) + " GB"

    except wmi.WMIError as e:
        print(f"WMI Error: {e}. Ensure WMI service is running and you have necessary permissions.")
        return {"error": "WMI access failed", "details": str(e)}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"error": "Failed to collect memory info", "details": str(e)}

    return memory_info

def get_all_processes() -> list:
    """Returns a list of all processes with their PID, name, user, and status."""
    procs = []
    for p in psutil.process_iter(['pid', 'name', 'username', 'status']):
        try:
            procs.append({
                "pid": p.info['pid'],
                "name": p.info['name'],
                "user": p.info['username'].split("\\")[-1] or "System",
                "status": p.info['status']
            })
        except: pass
    return procs
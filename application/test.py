import psutil
import platform
import time
import sys # To check if running on Windows for handles

def get_system_metrics():
    """
    Fetches comprehensive system metrics including CPU, process counts, and uptime.
    Returns a dictionary of gathered metrics.
    """
    metrics = {
        "cpu": {
            "brand": "N/A",
            "speed": "N/A",       # Current speed in MHz
            "baseSpeed": "N/A",   # Min speed (often considered base) in MHz
            "maxSpeed": "N/A",    # Max speed in MHz
            "cores": "N/A",       # Logical processors
            "physicalCores": "N/A",
            "sockets": "N/A",     # psutil does not directly provide this
            "virtualization": "N/A", # psutil does not directly provide this
            "cache": {            # psutil does not directly provide this
                "l1d": "N/A",
                "l1i": "N/A",
                "l2": "N/A",
                "l3": "N/A"
            }
        },
        "currentLoad": {
            "utilization": "N/A", # Overall CPU utilization percentage
            "cpus": []            # Per-core utilization percentages
        },
        "processCounts": {
            "all": "N/A",         # Total number of processes
            "threads": "N/A",     # Total threads across all processes
            "handles": "N/A"      # Total handles across all processes (Windows-specific)
        },
        "uptime": "N/A"           # System uptime in seconds
    }

    try:
        # --- CPU Usage & Load ---
        # cpu_percent(interval=0.1) waits for 0.1 seconds to calculate the usage
        # since the last call or system boot. Use a small interval for a fresh sample.
        metrics["currentLoad"]["utilization"] = psutil.cpu_percent(interval=0.1)
        metrics["currentLoad"]["cpus"] = psutil.cpu_percent(interval=None, percpu=True)

        # --- CPU Info ---
        cpu_freq = psutil.cpu_freq()
        if cpu_freq:
            metrics["cpu"]["speed"] = cpu_freq.current  # in MHz
            metrics["cpu"]["baseSpeed"] = cpu_freq.min  # in MHz
            metrics["cpu"]["maxSpeed"] = cpu_freq.max  # in MHz

        metrics["cpu"]["brand"] = platform.processor() # Example: 'Intel64 Family 6 Model 158 Stepping 10'
        metrics["cpu"]["physicalCores"] = psutil.cpu_count(logical=False)
        metrics["cpu"]["cores"] = psutil.cpu_count(logical=True) # Logical processors (includes hyper-threading)

        # --- Processes, Threads, Handles ---
        total_threads = 0
        total_handles = 0
        metrics["processCounts"]["all"] = len(psutil.pids())

        # Iterate through processes to sum threads and handles
        # Request 'num_threads' and 'num_handles' as part of process info to optimize
        for proc in psutil.process_iter(['num_threads', 'num_handles']):
            try:
                # Get number of threads (available cross-platform)
                if proc.info['num_threads'] is not None:
                    total_threads += proc.info['num_threads']

                # Get number of handles (Windows-specific)
                # platform.system() == "Windows" ensures this only runs on Windows
                if sys.platform == "win32" and proc.info['num_handles'] is not None:
                    total_handles += proc.info['num_handles']

            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                # Ignore processes that might disappear, be inaccessible, or be defunct
                pass

        metrics["processCounts"]["threads"] = total_threads
        if sys.platform == "win32": # Check for Windows specifically
            metrics["processCounts"]["handles"] = total_handles
        else:
            metrics["processCounts"]["handles"] = "N/A (Windows Only)"

        # --- Uptime ---
        metrics["uptime"] = int(time.time() - psutil.boot_time())

    except Exception as e:
        print(f"Error gathering system metrics: {e}")
        # In a real application, you might want more robust error logging here.

    return metrics

# Example Usage (for testing the function directly):
if __name__ == "__main__":
    import json
    # Call the function to get the metrics
    system_data = get_system_metrics()
    # Print the data in a human-readable JSON format
    print(json.dumps(system_data, indent=4))
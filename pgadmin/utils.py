# pgadmin.utils module to fix pgAdmin 4 import error
import os
import sys

# Add the web directory to Python path
web_dir = r"C:\Program Files\PostgreSQL\17\pgAdmin 4\web"
if web_dir not in sys.path:
    sys.path.insert(0, web_dir)

# Basic utility functions that pgAdmin 4 expects
def env(key, default=None):
    """Get environment variable with default value"""
    return os.environ.get(key, default)

# Windows detection
IS_WIN = os.name == 'nt'

def fs_short_path(path):
    """Convert path to short path format on Windows"""
    if IS_WIN and path:
        try:
            import win32api
            return win32api.GetShortPathName(path)
        except:
            return path
    return path

# Export the functions
__all__ = ['env', 'IS_WIN', 'fs_short_path']

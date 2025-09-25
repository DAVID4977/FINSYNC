#!/usr/bin/env python3
import subprocess
import sys
import os
import time

def start_python_backend():
    """Start the Python FastAPI backend server"""
    try:
        # Change to python_backend directory
        backend_dir = os.path.join(os.getcwd(), 'python_backend')
        os.chdir(backend_dir)
        
        # Set PYTHONPATH to include the backend directory
        env = os.environ.copy()
        env['PYTHONPATH'] = backend_dir
        
        print("Starting Python backend server...")
        
        # Start uvicorn server
        cmd = [sys.executable, '-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000', '--reload']
        
        process = subprocess.Popen(
            cmd,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a bit and check if process is still running
        time.sleep(2)
        if process.poll() is None:
            print("✅ Python backend started successfully on port 8000")
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Backend failed to start:")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
        
        return process
        
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return None

if __name__ == "__main__":
    start_python_backend()
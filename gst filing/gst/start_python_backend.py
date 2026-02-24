#!/usr/bin/env python3
import subprocess
import sys
import os

# Change to python_backend directory
os.chdir('python_backend')

# Start the FastAPI server
subprocess.run([sys.executable, '-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'])
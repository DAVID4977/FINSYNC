#!/usr/bin/.env python3
import os
import sys
import json

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the new invoice processor
from invoice_processor import process_invoice_files

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python simple_server.py <file1> [file2] ...")
        sys.exit(1)
    
    file_paths = sys.argv[1:]
    result = process_invoice_files(file_paths)
    print(json.dumps(result, indent=2))
#!/usr/bin/env python3
import os
import sys
import tempfile
import json
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def process_invoice_files(file_paths):
    """Process invoice files and return GST data"""
    import traceback
    try:
        from graphs.gst_extraction_graph import build_gst_graph
        from agents.writer_agent import writer_agent
        
        print(f"[STATUS] Processing {len(file_paths)} files...", flush=True)
        
        # Generate Excel file path first
        output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, "Consolidated_Invoices_Output.xlsx")
        
        # Build the GST extraction graph
        graph = build_gst_graph()
        all_invoices = []
        
        # Process each file
        for file_path in file_paths:
            print(f"[STATUS] Processing: {file_path}", flush=True)
            try:
                result_state = graph.invoke({
                    "file_path": file_path,
                    "output_path": output_path
                })
                gst_data = result_state.get("gst_data", [])
                if gst_data:
                    all_invoices.extend(gst_data)
                    print(f"[STATUS] Extracted {len(gst_data)} invoices from {file_path}", flush=True)
                else:
                    print(f"[WARNING] No data extracted from {file_path}", flush=True)
            except Exception as e:
                print(f"[ERROR] Failed to process {file_path}: {str(e)}", flush=True)
                continue
        
        if all_invoices:
            writer_agent(all_invoices, output_path)
            result = {
                "success": True,
                "message": f"Successfully processed {len(file_paths)} files and extracted {len(all_invoices)} invoices",
                "output_file": output_path,
                "invoices_count": len(all_invoices)
            }
            print(f"[RESULT] {json.dumps(result)}", flush=True)
            return result
        else:
            result = {
                "success": False, 
                "message": "No GST data could be extracted from the files",
                "output_file": None,
                "invoices_count": 0
            }
            print(f"[RESULT] {json.dumps(result)}", flush=True)
            return result
            
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"[ERROR] {str(e)}", flush=True)
        print(f"[ERROR DETAILS] {error_details}", flush=True)
        result = {
            "success": False,
            "message": f"Error processing files: {str(e)}",
            "output_file": None,
            "invoices_count": 0
        }
        print(f"[RESULT] {json.dumps(result)}", flush=True)
        return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python simple_server.py <file1> [file2] ...")
        sys.exit(1)
    
    file_paths = sys.argv[1:]
    result = process_invoice_files(file_paths)
    print(json.dumps(result, indent=2))
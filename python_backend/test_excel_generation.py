#!/usr/bin/.env python3
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from agents.writer_agent import writer_agent

# Sample GST data that was extracted from your PDF file
sample_gst_data = [
    {
        "Shop Name": "WESTSIDE\nSjr Zion, Survey",
        "GSTIN": "29AAACL1838J1ZC",
        "Invoice Number": "W089 100169940",
        "Invoice Date": "2024-09-28",
        "Total Amount": "4045.01",
        "Tax Amount": "173.91",
        "CGST": "173.91",
        "SGST": "173.91",
        "IGST": "N/A",
        "HSN Code": ["996211", "62052000", "62052000", "62046200", "48194000", "33072000", "39264099"],
        "Items": [
            {"HSN Code": "996211"}, {"HSN Code": "62052000"}, {"HSN Code": "62052000"}, 
            {"HSN Code": "62046200"}, {"HSN Code": "48194000"}, {"HSN Code": "33072000"}, {"HSN Code": "39264099"}
        ]
    }
]

# Generate Excel file
output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "Sample_GST_Extract.xlsx")

print(f"Generating Excel file with extracted GST data...")
writer_agent(sample_gst_data, output_path)
print(f"✅ Excel file created: {output_path}")
print(f"📊 File contains: {len(sample_gst_data)} invoice(s)")
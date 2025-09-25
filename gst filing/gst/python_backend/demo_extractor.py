#!/usr/bin/env python3
import sys
import json
import os
import random
from datetime import datetime, timedelta

def generate_demo_invoice_data(file_path):
    """Generate demo GST invoice data for testing when API key is not available"""
    filename = os.path.basename(file_path)
    
    # Generate realistic demo data
    demo_invoices = []
    
    # Generate 1-3 random invoices per file
    num_invoices = random.randint(1, 3)
    
    companies = ["ABC Corp", "XYZ Ltd", "Tech Solutions", "Global Enterprises", "Smart Systems"]
    states = ["Karnataka", "Maharashtra", "Delhi", "Tamil Nadu", "Gujarat"]
    hsn_codes = ["9801", "5407", "8517", "7326", "3004"]
    
    for i in range(num_invoices):
        invoice_date = datetime.now() - timedelta(days=random.randint(1, 90))
        taxable_value = round(random.uniform(10000, 100000), 2)
        
        # Calculate GST amounts (18% GST rate for demo)
        igst_rate = 18.0
        igst_amount = round(taxable_value * igst_rate / 100, 2)
        invoice_value = taxable_value + igst_amount
        
        invoice = {
            "invoice_number": f"INV-{random.randint(1000, 9999)}-{i+1}",
            "invoice_date": invoice_date.strftime("%Y-%m-%d"),
            "buyer_name": random.choice(companies),
            "buyer_gstin": f"{random.randint(10,99)}{random.choice(['ABCDE', 'FGHIJ', 'KLMNO'])}{random.randint(1000,9999)}F1Z{random.randint(1,9)}",
            "buyer_state": random.choice(states),
            "place_of_supply": random.choice(states),
            "hsn_code": random.choice(hsn_codes),
            "item_description": f"Demo Product {i+1}",
            "quantity": random.randint(1, 100),
            "unit": "NOS",
            "taxable_value": taxable_value,
            "igst_rate": igst_rate,
            "igst_amount": igst_amount,
            "cgst_rate": 0.0,
            "cgst_amount": 0.0,
            "sgst_rate": 0.0,
            "sgst_amount": 0.0,
            "cess_rate": 0.0,
            "cess_amount": 0.0,
            "invoice_value": invoice_value,
            "invoice_type": "B2B",
            "reverse_charge": "No",
            "file_name": filename
        }
        demo_invoices.append(invoice)
    
    return demo_invoices

def main():
    if len(sys.argv) < 2:
        print("Usage: python demo_extractor.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    try:
        print(f"[STATUS] Processing demo extraction for: {file_path}", flush=True)
        
        # Generate demo invoice data
        invoices = generate_demo_invoice_data(file_path)
        
        # Create output directory
        output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, "Consolidated_Invoices_Output.xlsx")
        
        # Write to Excel (simple demo)
        try:
            import pandas as pd
            df = pd.DataFrame(invoices)
            df.to_excel(output_path, index=False, sheet_name="GST_Invoices")
            print(f"[STATUS] Demo Excel file created: {output_path}", flush=True)
        except ImportError:
            print("[WARNING] pandas not available, skipping Excel generation", flush=True)
        
        result = {
            "success": True,
            "message": f"Demo extraction completed for {os.path.basename(file_path)}",
            "output_file": output_path,
            "invoices_count": len(invoices),
            "demo_mode": True
        }
        
        print(f"[RESULT] {json.dumps(result)}", flush=True)
        return result
        
    except Exception as e:
        result = {
            "success": False,
            "message": f"Demo extraction failed: {str(e)}",
            "output_file": None,
            "invoices_count": 0,
            "demo_mode": True
        }
        print(f"[RESULT] {json.dumps(result)}", flush=True)
        return result

if __name__ == "__main__":
    main()
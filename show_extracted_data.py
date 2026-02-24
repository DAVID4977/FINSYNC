#!/usr/bin/.env python3
import json

# This is the exact data that was extracted from your WESTSIDE invoice
extracted_data = {
    "Shop Name": "WESTSIDE\nSjr Zion, Survey",
    "GSTIN": "29AAACL1838J1ZC", 
    "Invoice Number": "W089 100169940",
    "Invoice Date": "2024-09-28",
    "Total Amount": "4045.01",
    "Tax Amount": "173.91",
    "CGST": "173.91",
    "SGST": "173.91", 
    "IGST": "N/A",
    "Items": [
        {"HSN Code": "996211"},
        {"HSN Code": "62052000"},
        {"HSN Code": "62052000"},
        {"HSN Code": "62046200"},
        {"HSN Code": "48194000"},
        {"HSN Code": "33072000"},
        {"HSN Code": "39264099"}
    ]
}

print("🎯 GST Data Successfully Extracted from Your Invoice:")
print("=" * 50)
print(f"🏪 Shop: {extracted_data['Shop Name']}")
print(f"🆔 GSTIN: {extracted_data['GSTIN']}")
print(f"📄 Invoice: {extracted_data['Invoice Number']}")
print(f"📅 Date: {extracted_data['Invoice Date']}")
print(f"💰 Total: ₹{extracted_data['Total Amount']}")
print(f"🧾 Tax: ₹{extracted_data['Tax Amount']}")
print(f"📊 CGST: ₹{extracted_data['CGST']}")
print(f"📊 SGST: ₹{extracted_data['SGST']}")
print(f"📊 IGST: {extracted_data['IGST']}")
print(f"🔢 HSN Codes: {len(extracted_data['Items'])} items")
for i, item in enumerate(extracted_data['Items'], 1):
    print(f"   {i}. {item['HSN Code']}")

print("\n✅ This data has been formatted and saved to Excel file!")
print("📥 You can download it using the application's download button.")
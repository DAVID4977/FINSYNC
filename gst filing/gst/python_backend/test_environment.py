#!/usr/bin/env python3
"""
Test script to validate the Python environment and dependencies
"""

import os
import sys
import traceback

def test_environment():
    """Test if all required modules and API keys are available"""
    print("Testing Python Environment for GST Extraction...")
    print(f"Python version: {sys.version}")
    print(f"Python path: {sys.executable}")
    print("-" * 50)
    
    # Test 1: Check API Key
    print("1. Testing API Key Configuration...")
    from dotenv import load_dotenv
    from pathlib import Path
    
    # Load environment variables from multiple possible locations
    load_dotenv()  # Load from current directory
    load_dotenv(Path(__file__).parent / '.env')  # Load from python_backend/.env
    load_dotenv(Path(__file__).parent.parent / '.env')  # Load from project root/.env
    
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if api_key:
        print(f"API Key found: {api_key[:10]}...")
    else:
        print("No API Key found! Set GOOGLE_API_KEY or GEMINI_API_KEY environment variable")
        return False
    
    # Test 2: Import required modules
    print("\n2. Testing Required Dependencies...")
    required_modules = [
        "google.generativeai",
        "langgraph.graph", 
        "pandas",
        "openpyxl",
        "fitz",  # PyMuPDF
        "PIL",   # Pillow
        "dotenv"
    ]
    
    for module in required_modules:
        try:
            __import__(module)
            print(f"✓ {module}")
        except ImportError as e:
            print(f"✗ {module}: {e}")
            return False
    
    # Test 3: Test Gemini API connection
    print("\n3. Testing Gemini API Connection...")
    try:
        import google.generativeai as genai
        from dotenv import load_dotenv
        
        load_dotenv()
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        genai.configure(api_key=api_key)
        
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content("Hello, this is a test.")
        print(f"Gemini API working: {response.text[:50]}...")
        
    except Exception as e:
        print(f"Gemini API error: {e}")
        print("Make sure you have a valid Google API key with Gemini API enabled")
        return False
    
    # Test 4: Test custom modules
    print("\n4. Testing Custom Modules...")
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    try:
        from graphs.gst_extraction_graph import build_gst_graph
        print("✓ GST extraction graph")
        
        from agents.ocr_agent import ocr_agent
        print("✓ OCR agent")
        
        from agents.parser_agent import parser_agent
        print("✓ Parser agent")
        
        from agents.validator_agent import validator_agent
        print("✓ Validator agent")
        
        from agents.writer_agent import writer_agent
        print("✓ Writer agent")
        
        from utils.gemini_client import generate_response_with_file
        print("✓ Gemini client")
        
    except Exception as e:
        print(f"Custom module error: {e}")
        traceback.print_exc()
        return False
    
    print("\nAll tests passed! Environment is ready for GST extraction.")
    return True

if __name__ == "__main__":
    success = test_environment()
    sys.exit(0 if success else 1)
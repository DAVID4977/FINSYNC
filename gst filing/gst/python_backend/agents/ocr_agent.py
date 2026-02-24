from utils.gemini_client import generate_response_with_file

def ocr_agent(state):
    file_path = state.get("file_path")
    print("[OCR Agent] Extracting text using Gemini...")
    try:
        prompt = "Extract raw readable text from this GST invoice for further parsing."
        raw_text = generate_response_with_file(prompt, file_path)
        return {**state, "raw_text": raw_text}
    except Exception as e:
        print(f"[OCR Agent] Error: {e}")
        return {**state, "raw_text": ""}
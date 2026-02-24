from utils.gemini_client import generate_response_with_file

def validator_agent(state: dict):
    gst_data = state.get("gst_data", [])
    file_path = state.get("file_path", "")

    if not gst_data:
        print("[Validator Agent] No gst_data found for validation.")
        return {**state, "validated": False}

    print("[Validator Agent] Validating parsed GST data using Gemini...")
    prompt = (
        "Check if this GST data is valid JSON and contains all the necessary fields. "
        "Reply with only one word: 'Valid' or 'Invalid'.\n\n"
        f"{gst_data}"
    )
    try:
        response = generate_response_with_file(prompt, file_path)  # Pass file_path here
        print("Gemini response:", response)
        is_valid = "valid" in response.lower()
        print(f"[Validator Agent] Validation: {is_valid}")
        return {**state, "validated": is_valid}
    except Exception as e:
        print(f"[Validator Agent] Error during validation: {e}")
        return {**state, "validated": False}


print("Validator Agent loaded (confirmed fresh file)")
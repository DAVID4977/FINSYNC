from langgraph.graph import StateGraph
from typing import TypedDict, Optional

from agents.ocr_agent import ocr_agent
from agents.parser_agent import parser_agent
from agents.validator_agent import validator_agent
from agents.writer_agent import writer_agent

# Step 1: Define the shared state structure using TypedDict
class GSTState(TypedDict):
    file_path: Optional[str]
    output_path: Optional[str]
    raw_text: Optional[str]
    gst_data: Optional[list]
    validated: Optional[bool]

# Step 2: Build the LangGraph
def build_gst_graph():
    builder = StateGraph(GSTState)
    # Add agent nodes
    builder.add_node("OCR", lambda state: ocr_agent(state))  # ocr_agent returns {**state, ...}
    builder.add_node("Parser", lambda state: parser_agent(state))  # parser_agent returns {**state, ...}
    builder.add_node("Validator", lambda state: validator_agent(state))  # validator_agent returns {**state, ...}
    builder.add_node("Writer", lambda state: (
        print("Writer received keys:", list(state.keys())) or
        writer_agent(state["gst_data"], state["output_path"]) or
        state  # Return the state unchanged after writing file
    ))
    # Define the graph edges
    builder.set_entry_point("OCR")
    builder.add_edge("OCR", "Parser")
    builder.add_edge("Parser", "Validator")
    builder.add_edge("Validator", "Writer")
    builder.set_finish_point("Writer")
    return builder.compile()
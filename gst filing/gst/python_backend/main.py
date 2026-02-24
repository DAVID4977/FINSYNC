from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import tempfile
from pathlib import Path
from typing import List
import shutil
from graphs.gst_extraction_graph import build_gst_graph
from agents.writer_agent import writer_agent

app = FastAPI(title="FinSync GST Backend", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
os.makedirs("temp_uploads", exist_ok=True)
os.makedirs("output", exist_ok=True)

@app.post("/api/extract-gst")
async def extract_gst_data(files: List[UploadFile] = File(...)):
    """
    Extract GST data from uploaded invoice files and return Excel file
    """
    try:
        if not files:
            raise HTTPException(status_code=400, detail="No files uploaded")
        
        # Save uploaded files temporarily
        temp_files = []
        for file in files:
            # Validate file type
            if not file.content_type in ['application/pdf', 'image/png', 'image/jpeg']:
                raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")
            
            # Create temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix)
            content = await file.read()
            temp_file.write(content)
            temp_file.close()
            temp_files.append(temp_file.name)
        
        # Process files with GST extraction graph
        graph = build_gst_graph()
        all_invoices = []
        
        for temp_file_path in temp_files:
            print(f"Processing: {temp_file_path}")
            result_state = graph.invoke({
                "file_path": temp_file_path,
                "output_path": "output/Consolidated_Invoices_Output.xlsx"
            })
            gst_data = result_state.get("gst_data", [])
            all_invoices.extend(gst_data)
        
        # Generate Excel file
        output_path = "output/Consolidated_Invoices_Output.xlsx"
        if all_invoices:
            writer_agent(all_invoices, output_path)
        else:
            raise HTTPException(status_code=400, detail="No GST data could be extracted from the files")
        
        # Cleanup temporary files
        for temp_file in temp_files:
            try:
                os.unlink(temp_file)
            except:
                pass
        
        return {
            "success": True,
            "message": f"Successfully processed {len(files)} files and extracted {len(all_invoices)} invoices",
            "download_url": f"/api/download-excel",
            "invoices_count": len(all_invoices)
        }
        
    except Exception as e:
        print(f"Error processing files: {e}")
        # Cleanup temporary files on error
        for temp_file in temp_files:
            try:
                os.unlink(temp_file)
            except:
                pass
        raise HTTPException(status_code=500, detail=f"Error processing files: {str(e)}")

@app.get("/api/download-excel")
async def download_excel():
    """
    Download the generated Excel file
    """
    excel_path = "output/Consolidated_Invoices_Output.xlsx"
    if not os.path.exists(excel_path):
        raise HTTPException(status_code=404, detail="Excel file not found")
    
    return FileResponse(
        path=excel_path,
        filename="GST_Invoices_Extract.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "FinSync GST Backend"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
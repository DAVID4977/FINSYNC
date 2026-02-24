import fitz  # PyMuPDF
from PIL import Image
from pathlib import Path

def convert_to_images(file_path):
    images = []
    ext = Path(file_path).suffix.lower()

    if ext == ".pdf":
        with fitz.open(file_path) as doc:
            for page in doc:
                pix = page.get_pixmap(dpi=200)
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                images.append(img)
    else:
        images.append(Image.open(file_path))

    return images
# FinSync

FinSync is a modern web application designed to simplify Goods and Services Tax (GST) management. It provides a robust interface to upload formatting-heavy invoices, extract key data using AI, generate structured Excel reports, and easily upload them to the government portal.

## 🚀 Features

- **Automated Invoice Data Extraction:** Securely upload images or PDFs of invoices, and FinSync's AI will parse out the relevant tax figures, companies, and dates.
- **Excel Report Generation:** Consolidated download history for GSTR-1 preparation. 
- **Modern User Interface:** A responsive dashboard built with React and Tailwind CSS featuring micro-animations and intuitive workflows.
- **Secure Authentication:** User credential management and persistent sessions.
- **Dual-Backend Architecture:**
  - **Node.js/Express:** Handles frontend routing, static files, and lightweight proxying.
  - **Python/FastAPI:** Manages PostgreSQL database interactions, AI inferencing for data extraction, and Excel generation.

## 🛠️ Technology Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, shadcn/ui, Wouter
- **Backend (Node):** Express.js, Node.js
- **Backend (Python):** FastAPI, SQLAlchemy, Uvicorn, Pandas (for Excel)
- **Database:** PostgreSQL (with Drizzle ORM for schema definitions)

## 📦 Local Installation

To run this project locally, ensure you have Node.js, Python 3.11+, and PostgreSQL installed.

### 1. Database Setup
Create a PostgreSQL database named `FinSync` and update the connection URL in your `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/FinSync"
```

### 2. Node.js Frontend & Server setup
```bash
# Install dependencies
npm install

# Push the database schema
npm run db:push

# Start the Vite frontend and Express dev server
npm run dev
```

### 3. Python Backend Setup
Open a new terminal window:
```bash
# Navigate to python backend folder
cd python_backend

# Create virtual environment 
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows

# Install python requirements
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 🌐 Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Register a new user account or log in.
3. Go to the **Invoice Upload** page to submit documents.
4. Navigate to the **Reports** page to view and download your processed Excel files.
5. Use the "Upload to Portal" feature to simulate pushing your data to the GST Portal.

## 📜 License
This project is licensed under the MIT License.

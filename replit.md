# Overview

FinSync is a comprehensive GST (Goods and Services Tax) compliance and management platform designed to streamline tax filing processes for businesses. The application provides a complete solution for managing GST returns, processing invoices, tracking compliance metrics, and handling file uploads for tax documentation. Built as a full-stack web application, it combines modern frontend technologies with AI-powered Python backend for intelligent invoice processing and Excel generation.

## Recent Changes (August 2025)
- ✅ **Migration to Replit Complete** - Successfully migrated from Replit Agent to standard Replit environment with full compatibility
- ✅ Integrated Python FastAPI backend with AI-powered GST extraction agents
- ✅ Connected LangGraph workflow for OCR → Parser → Validator → Writer pipeline
- ✅ Implemented Ollama API integration for invoice text extraction using local models
- ✅ Added direct Python process execution from Node.js server
- ✅ Enhanced file upload to support PDF, PNG, JPG formats with automatic Excel generation
- ✅ Updated backend to use Ollama models for local AI processing (no API keys required)
- ✅ Redesigned for professional enterprise appearance (removed all gradients)
- ✅ Implemented full navigation system with separate pages for each feature
- ✅ Added Reports section for Excel download management with delete functionality
- ✅ Customized for Indian GST compliance and analytics
- ✅ Created professional corporate logo and branding
- ✅ Complete authentication system with login/signup pages
- ✅ User dropdown menu with logout functionality in header
- ✅ Professional enterprise styling throughout application
- ✅ PostgreSQL database integration for user management
- ✅ Session management with localStorage clearing on logout
- ✅ Complete Settings page with subscription management and Premium plan (₹1000/month)
- ✅ Fixed settings routing to dedicated page instead of redirecting to dashboard
- ✅ Enhanced Excel report formatting for professional auditor use with proper column sizing and structured layout
- ✅ Removed dark mode functionality completely per user request

# User Preferences

Preferred communication style: Simple, everyday language.
Design preferences: Professional, corporate appearance without gradients. Secure enterprise platform for private company delivery.
Navigation: Full-featured navigation with separate pages for each section (GST Returns, Analytics, Invoices, Reports, etc.)
Compliance: Indian GST guidelines and policies focus.
Branding: Professional, dynamic logo with better visual appeal.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript, leveraging Vite as the build tool for fast development and optimized production builds. The application follows a component-based architecture with:

- **UI Framework**: Custom component library based on Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS for utility-first styling with custom design tokens and CSS variables
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth transitions and interactive animations
- **Charts**: Chart.js integration for data visualization and analytics dashboards

## Backend Architecture
Hybrid architecture combining Node.js Express server with Python AI backend:

- **Node.js Server**: Express.js with TypeScript for API routing and file handling
- **Python Backend**: AI-powered GST extraction using Ollama local models
- **AI Workflow**: Ollama-based implementation with specialized agents:
  - OCR Agent: Text extraction from PDF/image files using Ollama vision models
  - Parser Agent: Structured GST data extraction with JSON formatting
  - Validator Agent: Data validation and quality checks
  - Writer Agent: Excel file generation with formatted output
- **File Processing**: Direct Python process execution for invoice processing
- **Storage Layer**: Abstracted storage interface with temp file handling for uploads
- **Session Management**: Express sessions with secure cookie storage

## Data Storage Solutions
The application uses a hybrid approach for data persistence:

- **Database**: PostgreSQL as the primary database with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle migrations for database schema versioning
- **Development Storage**: In-memory storage implementation for rapid development and testing
- **File Storage**: Server-side file handling with configurable storage backends

## Authentication and Authorization
Simple authentication system with:

- **Login/Registration**: Email and password-based authentication
- **Session Management**: Server-side session handling with secure cookie storage
- **Route Protection**: Client-side route guards based on authentication state
- **User Context**: React Context API for managing authentication state across components

## Data Models
The system manages several core entities:

- **Users**: Account management with company information and preferences
- **GST Returns**: Tax return filing with status tracking and period management
- **Invoices**: Invoice processing with GST validation and HSN code management
- **Uploaded Files**: File metadata tracking with processing status and type validation

# External Dependencies

## Core Libraries
- **@neondatabase/serverless**: Neon Database connection for PostgreSQL in serverless environments
- **drizzle-orm**: Type-safe ORM for database operations with automatic migration support
- **@radix-ui/***: Comprehensive set of accessible UI primitives for building the component library
- **@tanstack/react-query**: Powerful data synchronization library for server state management

## Development Tools
- **Vite**: Modern build tool with hot module replacement and optimized bundling
- **TypeScript**: Static type checking for both frontend and backend code
- **Tailwind CSS**: Utility-first CSS framework with custom design system integration

## File Processing
- **multer**: Middleware for handling multipart/form-data file uploads
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Validation and Security
- **zod**: Runtime type validation and schema definition
- **drizzle-zod**: Integration between Drizzle ORM and Zod for unified validation

The architecture prioritizes type safety, developer experience, and scalability while maintaining clean separation of concerns between data, business logic, and presentation layers.
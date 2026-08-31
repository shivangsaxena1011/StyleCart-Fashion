# StyleCart Fashion — Development Guide

## Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB (optional; falls back to in-memory mode if offline)

## Installation & Setup

1. **Clone & Install Dependencies**:
   ```bash
   cd stylecart-fashion
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Set your configuration parameters:
   ```env
   PORT=5001
   NODE_ENV=development
   JWT_SECRET=your_dev_secret_key
   GEMINI_API_KEY=your_google_gemini_api_key
   MONGODB_URI=mongodb://127.0.0.1:27017/stylecart
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Or start standard Node:
   ```bash
   npm start
   ```

4. **Access Application**:
   Open browser to `http://localhost:5001`

## API Testing

Run tests or check server health:
```bash
# Health Check
curl http://localhost:5001/api/health

# Product Catalog
curl http://localhost:5001/api/products
```

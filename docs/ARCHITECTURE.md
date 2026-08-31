# StyleCart Fashion — Architecture Documentation

## Overview
StyleCart Fashion is an AI-powered fashion commerce platform built on a modular Express backend architecture and a responsive vanilla HTML5/CSS3/JavaScript frontend.

```
                  ┌────────────────────────────────────────┐
                  │       Frontend (HTML/CSS/JS)           │
                  │  Pages: index, ai, product, cart, etc. │
                  └──────────────────┬─────────────────────┘
                                     │ HTTP REST API
                                     ▼
                  ┌────────────────────────────────────────┐
                  │       Express Backend API              │
                  │  (server.js - Modular Routers)         │
                  └──────┬───────────┬───────────┬─────────┘
                         │           │           │
         ┌───────────────┴┐    ┌─────┴──────┐ ┌──┴─────────────┐
         │ MongoDB Model  │    │ AIProvider │ │ In-Memory      │
         │ (Mongoose)     │    │ (Gemini)   │ │ Fallback Store │
         └────────────────┘    └────────────┘ └────────────────┘
```

## Backend Modular Structure

```
backend/
├── server.js               # Entry point (~85 lines), mounts routers & middleware
├── config/
│   ├── database.js         # MongoDB connection with serverSelectionTimeoutMS fallback
│   └── environment.js      # Centralized environment variable validation
├── models/                 # Mongoose Data Models
│   ├── User.js             # User accounts & style preferences
│   ├── Product.js          # Product catalog with fashion metadata
│   ├── Order.js            # Customer orders & transactions
│   ├── StyleProfile.js     # Style DNA archetypes & quiz responses
│   ├── WardrobeItem.js     # User digital wardrobe items
│   ├── Lookbook.js         # Curated fashion lookbooks
│   ├── Trend.js            # Fashion trend analytics
│   └── Review.js           # Product ratings & reviews
├── routes/                 # Express Routers
│   ├── auth.js             # Signup, login, password reset, /me
│   ├── products.js         # Product CRUD, intelligence, review summaries
│   ├── orders.js           # Order creation and user order history
│   ├── admin.js            # Admin metrics, user & order management
│   ├── ai.js               # Chat, search, stylist, score, fit, compare, etc.
│   ├── wardrobe.js         # Digital wardrobe CRUD
│   └── lookbooks.js        # Lookbooks and fashion trends
├── middleware/
│   ├── auth.js             # JWT verification (verifyToken, verifyAdmin, optionalAuth)
│   ├── rateLimiter.js      # In-memory IP rate limiting
│   └── errorHandler.js     # 404 handler and safe global error handler
├── services/
│   ├── aiProvider.js       # Abstract AIProvider interface
│   └── geminiProvider.js   # Google Gemini 1.5 Flash provider implementation
├── data/
│   ├── seedProducts.js     # Seed catalog data (33 products)
│   └── inMemoryStore.js    # In-memory fallback data store
└── utils/
    ├── apiResponse.js      # Standardized API response helpers (sendSuccess, sendError)
    └── validators.js       # Input validation & sanitization functions
```

## Data Access Strategy (Hybrid Fallback)
1. **Primary Database**: MongoDB / Mongoose connection specified by `MONGODB_URI`.
2. **Fallback Mode**: If MongoDB is unreachable (or offline during local dev), the system automatically falls back to `inMemoryStore.js` with zero runtime crashes.

## AI Provider Abstraction
The system decouples AI functionality from specific vendor APIs via the `AIProvider` interface.
- `GeminiProvider`: Implements `AIProvider` using Google Generative AI (`gemini-1.5-flash`).
- Fallback Heuristics: If `GEMINI_API_KEY` is omitted, the provider falls back to deterministic rule-based algorithms for styling, search parsing, and scoring.

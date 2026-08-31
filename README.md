# StyleCart Fashion — AI-Powered Fashion Shopping Platform

![StyleCart Fashion](https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80)

**StyleCart Fashion** is a modern, AI-first fashion e-commerce platform combining intelligent product search, personal AI styling, natural language query understanding, digital wardrobe management, product comparison, outfit scoring, and personalized recommendations.

---

## 🌟 Key Features

### 🛍️ E-Commerce Engine
- **Catalog Management**: Multi-category fashion catalog with detailed specs, brand filters, and stock counts.
- **Cart & Wishlist**: Real-time totals, tax (GST) calculations, quantity management, and instant wishlist toggles.
- **Order Processing**: Complete checkout flow with address validation, transaction tracking, and order history.
- **Admin Dashboard**: Business metrics, revenue analytics, user administration, and order management.

### 🤖 AI Capabilities
- **StyleCart AI Assistant**: Intelligent shopping assistant answering style queries and recommending items.
- **AI Smart Search**: Converts natural language prompts (e.g. *"black oversized hoodie under 1500"*) into matching products.
- **AI Personal Stylist 2.0**: Synthesizes complete looks considering occasion, weather, budget, style DNA, and user wardrobe.
- **AI Outfit Builder & Scoring**: Evaluates color harmony, occasion adaptability, body fit, and trend alignment (0-100 score).
- **AI Product Comparison**: Detailed spec breakdown, value analysis, and recommendations between multiple products.
- **AI Capsule Wardrobe Generator**: Builds minimal, versatile clothing collections maximizing outfit combinations per ₹ spent.
- **Steal This Look**: Photo outfit analysis recreating street style across Match, Budget, and Premium price tiers.
- **Size & Fit AI**: Height, weight, chest, and waist measurement analysis for precise sizing advice.
- **Digital Wardrobe**: Allows users to store owned garments and test styling compatibility with store products.
- **Trend Intelligence Engine**: Real-time fashion trend velocity tracking based on search lift and wishlist saves.

---

## 🏗️ Architecture

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

- **Backend**: Node.js, Express, Mongoose, JWT, bcryptjs, CORS, Dotenv, @google/generative-ai.
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+), Three.js.
- **Database**: Hybrid MongoDB + In-memory fallback.
- **AI Engine**: Google Gemini 1.5 Flash with rule-based fallback heuristics.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn

### 2. Installation
```bash
git clone https://github.com/techashutosh03/Avenor-AI-Powered-Fashion-E-Commerce-Platform.git stylecart-fashion
cd stylecart-fashion
npm install
```

### 3. Environment Setup
Create a `.env` file from `.env.example`:
```env
PORT=5001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb://127.0.0.1:27017/stylecart
```

### 4. Running the Application
```bash
# Start server (production)
npm start

# Start server (development with nodemon)
npm run dev
```

Open your browser to `http://localhost:5001`.

---

## 🔒 Security & Hardening
- **Authentication**: JWT authentication with expiration & role validation.
- **Role Control**: Signup endpoint strictly defaults to user role (no privilege escalation).
- **Rate Limiting**: Rate limiters applied on API endpoints to prevent abuse.
- **XSS Defense**: HTML escaping and input sanitization across frontend and backend.
- **Production Safety**: Secrets required in production; stack traces suppressed.

---

## 📚 Documentation
Detailed documentation is available in the `docs/` directory:
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Feature Guide](docs/FEATURES.md)
- [Development & Testing](docs/DEVELOPMENT.md)
- [Security Guidelines](docs/SECURITY.md)
- [Environment Variables](docs/ENVIRONMENT.md)
- [Product Roadmap](docs/ROADMAP.md)

---

## 📄 License
ISC License.

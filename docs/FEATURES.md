# StyleCart Fashion — Feature Guide

## Overview of Product Features

### 1. Modern E-Commerce Core
- **Product Catalog**: Multi-category fashion catalog with detailed specifications, brand filters, and stock counts.
- **Cart & Wishlist**: Real-time cart calculation, tax (GST) calculation, item quantities, and instant wishlist toggles.
- **Checkout & Orders**: Seamless checkout flow with address validation, transaction ID tracking, and order history.
- **Admin Control Center**: Metrics dashboard, sales analytics history, inventory management, user list inspection, and order status updates.

### 2. AI Fashion Capabilities
- **StyleCart AI Assistant (`POST /api/chat`)**: Intelligent shopping concierge that answers questions and recommends catalog products.
- **AI Smart Search (`POST /api/search`)**: Natural language query parser converting phrases like *"black oversized hoodie under 1500"* into catalog recommendations.
- **AI Personal Stylist 2.0 (`POST /api/ai/stylist`)**: Multi-constraint style solver taking occasion, budget, weather, style DNA, and wardrobe into account to construct outfits.
- **AI Outfit Builder & Scoring (`POST /api/ai-fashion/score`)**: Calculates color harmony, occasion adaptability, body fit compatibility, and trend alignment scores out of 100 with actionable styling tips.
- **AI Product Comparison (`POST /api/compare`)**: Side-by-side comparison of product specs, pricing, and overall value recommendations.
- **AI Capsule Wardrobe Generator (`POST /api/ai/capsule-wardrobe`)**: Generates interchangeable clothing sets maximizing outfit combinations per rupee spent.
- **Steal This Look (`POST /api/vision/steal-look`)**: Recreates uploaded street fashion photos across Match, Budget, and Premium pricing tiers.
- **Size & Fit AI (`POST /api/ai/fit`)**: Recommends optimal clothing size (S/M/L/XL) based on height, weight, chest, and waist measurements.
- **AI Digital Wardrobe (`GET/POST/DELETE /api/wardrobe`)**: Allows users to save owned clothing items and test combination possibilities with catalog pieces.
- **Trend Intelligence Engine (`GET /api/trends`)**: Analyzes search velocity and wishlist analytics to highlight rising fashion silhouettes and colors.

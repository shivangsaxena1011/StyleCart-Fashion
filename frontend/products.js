// ========== CENTRALIZED PRODUCT SERVICE ==========

const localFallbackProducts = [
    {
        "id": 1,
        "name": "Samsung Galaxy M35 5G (Moonlight Blue, 128GB)",
        "category": "electronics",
        "price": 16999,
        "originalPrice": 24499,
        "discount": "31% OFF",
        "rating": 4.4,
        "reviewsCount": 3812,
        "image": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80",
        "brand": "Samsung",
        "dealTag": "Best Seller",
        "description": "Samsung Galaxy M35 5G with monster 6000mAh battery, 120Hz sAMOLED display, and 50MP OIS camera.",
        "specs": {
            "Display": "6.6-inch Super AMOLED 120Hz",
            "Battery": "6000mAh",
            "Camera": "50MP OIS Triple"
        }
    },
    {
        "id": 2,
        "name": "Samsung Galaxy S23 FE 5G (Graphite, 128GB)",
        "category": "electronics",
        "price": 39999,
        "originalPrice": 59999,
        "discount": "33% OFF",
        "rating": 4.5,
        "reviewsCount": 2190,
        "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
        "brand": "Samsung",
        "dealTag": "Top Rated",
        "description": "Flagship grade Samsung smartphone featuring Nightography pro camera, IP68 water resistance, and Exynos 2200 chipset.",
        "specs": {
            "Display": "6.4-inch Dynamic AMOLED 2X",
            "Processor": "Exynos 2200",
            "Protection": "IP68 Gorilla Glass 5"
        }
    },
    {
        "id": 3,
        "name": "OnePlus Nord CE4 5G (Dark Chrome, 8GB RAM, 128GB)",
        "category": "electronics",
        "price": 22999,
        "originalPrice": 24999,
        "discount": "8% OFF",
        "rating": 4.4,
        "reviewsCount": 4120,
        "image": "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=80",
        "brand": "OnePlus",
        "dealTag": "Trending Now",
        "description": "Super-fast Snapdragon 7 Gen 3 performance with 100W SUPERVOOC flash charge and Sony LYT-600 camera.",
        "specs": {
            "Processor": "Snapdragon 7 Gen 3",
            "Charging": "100W SUPERVOOC",
            "Battery": "5500mAh"
        }
    },
    {
        "id": 4,
        "name": "OnePlus 12R 5G (Cool Blue, 16GB RAM, 256GB)",
        "category": "electronics",
        "price": 42999,
        "originalPrice": 45999,
        "discount": "7% OFF",
        "rating": 4.6,
        "reviewsCount": 1980,
        "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
        "brand": "OnePlus",
        "dealTag": "Top Rated",
        "description": "Flagship 4th Gen LTPO 120Hz display powered by Snapdragon 8 Gen 2 and huge 5500mAh battery with 100W charging.",
        "specs": {
            "Display": "6.78-inch 1.5K LTPO4 AMOLED",
            "Processor": "Snapdragon 8 Gen 2",
            "RAM": "16GB LPDDR5X"
        }
    },
    {
        "id": 5,
        "name": "Redmi Note 13 Pro 5G (Midnight Black, 128GB)",
        "category": "electronics",
        "price": 21999,
        "originalPrice": 28999,
        "discount": "24% OFF",
        "rating": 4.3,
        "reviewsCount": 3410,
        "image": "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&q=80",
        "brand": "Redmi",
        "dealTag": "Best Seller",
        "description": "Revolutionary 200MP ultra-clear camera with OIS, 1.5K AMOLED 120Hz curved display and 67W turbo charging.",
        "specs": {
            "Camera": "200MP OIS Ultra-Clear",
            "Display": "1.5K AMOLED 120Hz",
            "Charging": "67W Turbo Charge"
        }
    },
    {
        "id": 6,
        "name": "Redmi 13C 5G (Starlight Black, 4GB RAM, 128GB)",
        "category": "electronics",
        "price": 9999,
        "originalPrice": 13999,
        "discount": "29% OFF",
        "rating": 4.2,
        "reviewsCount": 5120,
        "image": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80",
        "brand": "Redmi",
        "dealTag": "Crazy Low Prices",
        "description": "Most accessible 5G smartphone powered by MediaTek Dimensity 6100+ and smooth 90Hz display.",
        "specs": {
            "Processor": "MediaTek Dimensity 6100+",
            "Display": "6.74-inch 90Hz",
            "Battery": "5000mAh"
        }
    },
    {
        "id": 7,
        "name": "Realme Narzo 70 Pro 5G (Glass Green, 128GB)",
        "category": "electronics",
        "price": 17999,
        "originalPrice": 24999,
        "discount": "28% OFF",
        "rating": 4.3,
        "reviewsCount": 2870,
        "image": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80",
        "brand": "Realme",
        "dealTag": "Trending Now",
        "description": "Flagship Sony IMX890 OIS camera with horizon glass design and creative Air Gestures control.",
        "specs": {
            "Sensor": "Sony IMX890 OIS",
            "Charging": "67W SUPERVOOC",
            "Gesture": "Air Gestures Support"
        }
    },
    {
        "id": 8,
        "name": "Realme 12x 5G (Twilight Purple, 128GB)",
        "category": "electronics",
        "price": 11999,
        "originalPrice": 16999,
        "discount": "29% OFF",
        "rating": 4.2,
        "reviewsCount": 1640,
        "image": "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&q=80",
        "brand": "Realme",
        "dealTag": "Deals of the Day",
        "description": "Ultra-slim 7.89mm profile 5G phone with vapor chamber cooling system and dual stereo speakers.",
        "specs": {
            "Display": "120Hz FHD+ Display",
            "Cooling": "Vapor Chamber Cooling",
            "Audio": "Dual Stereo Speakers"
        }
    },
    {
        "id": 9,
        "name": "boAt Airdopes 141 ANC Wireless Earbuds",
        "category": "electronics",
        "price": 899,
        "originalPrice": 4490,
        "discount": "80% OFF",
        "rating": 4.4,
        "reviewsCount": 12450,
        "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
        "brand": "boAt",
        "dealTag": "Crazy Low Prices",
        "description": "32dB Active Noise Cancellation, 42 hours massive playback, and ENx technology quad microphones.",
        "specs": {
            "ANC": "32dB Active Noise Cancellation",
            "Playtime": "Up to 42 Hours",
            "Drivers": "10mm Dynamic"
        }
    },
    {
        "id": 10,
        "name": "Boult Audio AirBass Z40 TWS Earbuds",
        "category": "electronics",
        "price": 699,
        "originalPrice": 2999,
        "discount": "77% OFF",
        "rating": 4.3,
        "reviewsCount": 9340,
        "image": "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&q=80",
        "brand": "Boult",
        "dealTag": "Crazy Low Prices",
        "description": "60 hours playtime, low latency 45ms gaming mode, and Zen quad mic environmental noise cancellation.",
        "specs": {
            "Playtime": "60 Hours Total",
            "Latency": "45ms Low Latency Gaming",
            "Bluetooth": "v5.3"
        }
    },
    {
        "id": 11,
        "name": "boAt Rockerz 255 Pro+ Bluetooth Neckband",
        "category": "electronics",
        "price": 799,
        "originalPrice": 3990,
        "discount": "80% OFF",
        "rating": 4.3,
        "reviewsCount": 8910,
        "image": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80",
        "brand": "boAt",
        "dealTag": "Best Seller",
        "description": "40 hours playback, ASAP fast charge (10 mins = 10 hours), IPX7 water and sweat resistance.",
        "specs": {
            "Charging": "ASAP Charge 10min=10hr",
            "Resistance": "IPX7 Water/Sweat",
            "Battery": "Up to 40 Hours"
        }
    },
    {
        "id": 12,
        "name": "Sony WH-CH520 Wireless Over-Ear Headphones",
        "category": "electronics",
        "price": 3499,
        "originalPrice": 4990,
        "discount": "30% OFF",
        "rating": 4.6,
        "reviewsCount": 4210,
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
        "brand": "Sony",
        "dealTag": "Top Rated",
        "description": "Up to 50 hours battery life with quick charging, DSEE digital sound enhancement, and multi-point pairing.",
        "specs": {
            "Battery": "50 Hours Playback",
            "Enhancement": "DSEE Sound Engine",
            "Connection": "Multi-Point Pairing"
        }
    },
    {
        "id": 13,
        "name": "JBL GO 3 Portable Waterproof Bluetooth Speaker",
        "category": "electronics",
        "price": 2499,
        "originalPrice": 3999,
        "discount": "38% OFF",
        "rating": 4.5,
        "reviewsCount": 6510,
        "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80",
        "brand": "JBL",
        "dealTag": "Trending Now",
        "description": "Punchy JBL Pro Sound in an ultra-compact rugged fabric design with IP67 dustproof and waterproof rating.",
        "specs": {
            "Rating": "IP67 Waterproof/Dustproof",
            "Battery": "5 Hours Continuous",
            "Audio": "JBL Pro Sound"
        }
    },
    {
        "id": 14,
        "name": "Noise ColorFit Pulse 3 AMOLED Smartwatch",
        "category": "electronics",
        "price": 1499,
        "originalPrice": 3999,
        "discount": "62% OFF",
        "rating": 4.5,
        "reviewsCount": 4102,
        "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
        "brand": "Noise",
        "dealTag": "Up to 70% Off",
        "description": "1.96-inch curved AMOLED display with always-on function, Bluetooth calling with Tru Sync, and 100+ sports modes.",
        "specs": {
            "Display": "1.96-inch AMOLED Always-On",
            "Calling": "Tru Sync Bluetooth Calling",
            "Health": "SpO2, Heart Rate, Sleep"
        }
    },
    {
        "id": 15,
        "name": "Mi 10,000mAh Power Bank 3i (22.5W Fast Charging)",
        "category": "electronics",
        "price": 1199,
        "originalPrice": 1999,
        "discount": "40% OFF",
        "rating": 4.4,
        "reviewsCount": 7100,
        "image": "https://images.unsplash.com/photo-1609592807664-885ec409d575?w=600&q=80",
        "brand": "Xiaomi",
        "dealTag": "Best Seller",
        "description": "Triple port output with 22.5W ultra-fast two-way charging and 12-layer advanced circuit protection.",
        "specs": {
            "Capacity": "10,000mAh Lithium Polymer",
            "Output": "22.5W Two-Way Fast Charge",
            "Ports": "Triple Output (Type-C + 2 USB-A)"
        }
    },
    {
        "id": 16,
        "name": "Cosmic Byte CB-GK-16 Firefly Mechanical Keyboard",
        "category": "electronics",
        "price": 1899,
        "originalPrice": 2999,
        "discount": "37% OFF",
        "rating": 4.5,
        "reviewsCount": 2310,
        "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
        "brand": "Cosmic Byte",
        "dealTag": "Recommended For You",
        "description": "Compact tenkeyless TKL design with Outemu Blue mechanical clicky switches and per-key RGB backlighting.",
        "specs": {
            "Switches": "Outemu Blue Clicky Switches",
            "Layout": "Tenkeyless 87 Keys",
            "Backlight": "Spectrum LED Backlight"
        }
    },
    {
        "id": 17,
        "name": "Logitech G102 Lightsync RGB Gaming Mouse",
        "category": "electronics",
        "price": 1295,
        "originalPrice": 1995,
        "discount": "35% OFF",
        "rating": 4.6,
        "reviewsCount": 6890,
        "image": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80",
        "brand": "Logitech",
        "dealTag": "Best Sellers",
        "description": "Gaming-grade 8,000 DPI optical sensor with customizable Lightsync RGB color wave lighting.",
        "specs": {
            "DPI": "8,000 Gaming Sensor",
            "Lighting": "Lightsync RGB",
            "Buttons": "6 Programmable Buttons"
        }
    },
    {
        "id": 18,
        "name": "Lenovo IdeaPad Slim 3 15.6\" FHD Laptop",
        "category": "electronics",
        "price": 44990,
        "originalPrice": 62890,
        "discount": "28% OFF",
        "rating": 4.4,
        "reviewsCount": 1420,
        "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
        "brand": "Lenovo",
        "dealTag": "Best Deals on Electronics",
        "description": "Intel Core i5 12th Gen processor, 16GB RAM, 512GB NVMe SSD, military grade durability with Windows 11 & Office.",
        "specs": {
            "Processor": "Intel Core i5-12450H",
            "Memory": "16GB DDR4, 512GB SSD",
            "Display": "15.6-inch FHD Anti-Glare"
        }
    },
    {
        "id": 19,
        "name": "OnePlus Pad Go 11.35\" 2.4K Eye-Care Tablet",
        "category": "electronics",
        "price": 17999,
        "originalPrice": 21999,
        "discount": "18% OFF",
        "rating": 4.5,
        "reviewsCount": 1890,
        "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80",
        "brand": "OnePlus",
        "dealTag": "Recommended For You",
        "description": "11.35-inch 2.4K eye-care display, Dolby Atmos quad speakers, 8000mAh battery with 33W SUPERVOOC.",
        "specs": {
            "Display": "11.35-inch 2.4K 90Hz ReadFit",
            "Audio": "Quad Speakers Dolby Atmos",
            "Battery": "8000mAh with 33W Charging"
        }
    },
    {
        "id": 20,
        "name": "TP-Link Archer C6 AC1200 Dual Band Wi-Fi Router",
        "category": "electronics",
        "price": 2199,
        "originalPrice": 3299,
        "discount": "33% OFF",
        "rating": 4.5,
        "reviewsCount": 9400,
        "image": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80",
        "brand": "TP-Link",
        "dealTag": "Top Rated",
        "description": "Simultaneous 2.4GHz 300Mbps and 5GHz 867Mbps connections, 4 high-gain antennas with MU-MIMO technology.",
        "specs": {
            "Speed": "AC1200 Dual Band Gigabit",
            "Antennas": "4 External High-Gain Antennas",
            "Coverage": "3-Bedroom Home"
        }
    },
    {
        "id": 21,
        "name": "Roadster Men Pure Cotton Crew Neck T-Shirt",
        "category": "fashion",
        "price": 349,
        "originalPrice": 799,
        "discount": "56% OFF",
        "rating": 4.2,
        "reviewsCount": 3840,
        "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
        "brand": "Roadster",
        "dealTag": "Starting ₹299",
        "description": "Breathable 100% bio-washed cotton T-shirt designed for everyday comfort and clean streetwear aesthetics.",
        "specs": {
            "Material": "100% Combed Cotton",
            "Fit": "Regular Fit",
            "Wash": "Machine Wash Safe"
        }
    },
    {
        "id": 22,
        "name": "Highlander Men Slim Fit Casual Denim Shirt",
        "category": "fashion",
        "price": 649,
        "originalPrice": 1499,
        "discount": "57% OFF",
        "rating": 4.3,
        "reviewsCount": 2190,
        "image": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
        "brand": "Highlander",
        "dealTag": "Fashion Under ₹999",
        "description": "Washed indigo denim shirt with spread collar, twin patch pockets, and curved hemline for smart layering.",
        "specs": {
            "Fabric": "Soft Indigo Denim",
            "Pattern": "Enzyme Washed Solid",
            "Collar": "Spread Collar"
        }
    },
    {
        "id": 23,
        "name": "Tokyo Talkies Floral Printed Peplum Top",
        "category": "fashion",
        "price": 449,
        "originalPrice": 1199,
        "discount": "62% OFF",
        "rating": 4.3,
        "reviewsCount": 1780,
        "image": "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80",
        "brand": "Tokyo Talkies",
        "dealTag": "Under ₹499",
        "description": "Charming floral print peplum top with sweet-heart neck and puff sleeves crafted in breathable georgette.",
        "specs": {
            "Fabric": "Poly Georgette",
            "Sleeve": "Short Puff Sleeves",
            "Neck": "Sweetheart Neck"
        }
    },
    {
        "id": 24,
        "name": "Berrylush V-Neck Flared Floral Maxi Dress",
        "category": "fashion",
        "price": 899,
        "originalPrice": 2299,
        "discount": "61% OFF",
        "rating": 4.4,
        "reviewsCount": 2950,
        "image": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
        "brand": "Berrylush",
        "dealTag": "Fashion Under ₹999",
        "description": "Graceful floral printed maxi dress with flattering high-slit flare and adjustable waist tie belt.",
        "specs": {
            "Length": "Maxi Ankle Length",
            "Print": "Botanical Floral",
            "Silhouette": "Fit & Flare"
        }
    },
    {
        "id": 25,
        "name": "Libas Women Embroidered Straight Kurta with Palazzo Set",
        "category": "fashion",
        "price": 899,
        "originalPrice": 2499,
        "discount": "64% OFF",
        "rating": 4.4,
        "reviewsCount": 4120,
        "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
        "brand": "Libas",
        "dealTag": "Customers Most-Loved",
        "description": "Festive pure rayon kurta adorned with delicate zari thread work, paired with matching flared palazzos.",
        "specs": {
            "Material": "Pure Rayon Slub",
            "Craft": "Zari Thread Embroidery",
            "Set Includes": "Kurta + Palazzo"
        }
    },
    {
        "id": 26,
        "name": "Spykar Men Slim Fit Stretchable Denim Jeans",
        "category": "fashion",
        "price": 1199,
        "originalPrice": 2799,
        "discount": "57% OFF",
        "rating": 4.3,
        "reviewsCount": 3100,
        "image": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
        "brand": "Spykar",
        "dealTag": "Best Sellers",
        "description": "Mid-rise dark wash skinny stretch denim jeans designed for maximum flexibility and clean daily styling.",
        "specs": {
            "Fit": "Slim Fit",
            "Fabric": "98% Cotton 2% Elastane Stretch",
            "Wash": "Dark Whisker Wash"
        }
    },
    {
        "id": 27,
        "name": "Puma Men's Smash V2 Classic Leather Sneakers",
        "category": "fashion",
        "price": 1299,
        "originalPrice": 2999,
        "discount": "57% OFF",
        "rating": 4.3,
        "reviewsCount": 1824,
        "image": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
        "brand": "Puma",
        "dealTag": "Top Rated",
        "description": "Timeless tennis-inspired court silhouette with durable soft suede upper and cushioned SoftFoam+ sockliner.",
        "specs": {
            "Upper": "Premium Leather & Suede",
            "Sole": "Rubber Grip Outsole",
            "Insole": "SoftFoam+ Comfort Cushioning"
        }
    },
    {
        "id": 28,
        "name": "Sparx Men Lightweight Canvas Slip-On Shoes",
        "category": "fashion",
        "price": 799,
        "originalPrice": 1499,
        "discount": "47% OFF",
        "rating": 4.2,
        "reviewsCount": 4190,
        "image": "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80",
        "brand": "Sparx",
        "dealTag": "Crazy Low Prices",
        "description": "Lightweight slip-on walking shoes with breathable canvas upper and flexible EVA shock absorption sole.",
        "specs": {
            "Closure": "Slip-On Elasticated",
            "Upper": "Breathable Canvas",
            "Weight": "Ultra-lightweight 220g"
        }
    },
    {
        "id": 29,
        "name": "Women's Casual Structured Handbag",
        "category": "fashion",
        "price": 699,
        "originalPrice": 1499,
        "discount": "53% OFF",
        "rating": 4.2,
        "reviewsCount": 986,
        "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80",
        "brand": "Lavie",
        "dealTag": "Fashion Under ₹999",
        "description": "Chic dual-tone saffiano textured faux leather tote with multiple organization compartments and detachable shoulder strap.",
        "specs": {
            "Material": "Premium Saffiano Vegan Leather",
            "Compartments": "3 Inner Compartments + Zip Pocket",
            "Closure": "Zipper"
        }
    },
    {
        "id": 30,
        "name": "WildHorn Genuine Leather Bi-Fold Wallet for Men",
        "category": "fashion",
        "price": 449,
        "originalPrice": 1299,
        "discount": "65% OFF",
        "rating": 4.4,
        "reviewsCount": 6810,
        "image": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80",
        "brand": "WildHorn",
        "dealTag": "Under ₹499",
        "description": "Handcrafted top-grain hunter leather wallet equipped with RFID blocking protection and 8 card slots.",
        "specs": {
            "Leather": "100% Genuine Full Grain Hunter Leather",
            "Security": "RFID Blocking Technology",
            "Slots": "8 Card Slots + Currency Slot"
        }
    },
    {
        "id": 31,
        "name": "Zaveri Pearls Rose Gold Austrian Diamond Necklace Set",
        "category": "fashion",
        "price": 349,
        "originalPrice": 1699,
        "discount": "79% OFF",
        "rating": 4.3,
        "reviewsCount": 3820,
        "image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80",
        "brand": "Zaveri Pearls",
        "dealTag": "Starting ₹299",
        "description": "Exquisite rose gold plated necklace with teardrop Austrian crystals, complete with matching stud earrings.",
        "specs": {
            "Plating": "18K Rose Gold Polish",
            "Stones": "Austrian Cut Diamonds & Crystals",
            "Set": "Necklace + Pair of Earrings"
        }
    },
    {
        "id": 32,
        "name": "Fastrack Casual Analog Watch for Men",
        "category": "fashion",
        "price": 995,
        "originalPrice": 1995,
        "discount": "50% OFF",
        "rating": 4.4,
        "reviewsCount": 5120,
        "image": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80",
        "brand": "Fastrack",
        "dealTag": "Top Rated",
        "description": "Bold sporty analog watch with mineral glass, brass case, and rugged silicone strap with 50m water resistance.",
        "specs": {
            "Movement": "High Precision Quartz",
            "Water Resistance": "50 Meters (5 ATM)",
            "Strap": "Flexible Textured Silicone"
        }
    },
    {
        "id": 33,
        "name": "HRX by Hrithik Roshan Rapid-Dry Active Track Pants",
        "category": "fashion",
        "price": 699,
        "originalPrice": 1799,
        "discount": "61% OFF",
        "rating": 4.4,
        "reviewsCount": 3990,
        "image": "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80",
        "brand": "HRX",
        "dealTag": "Fashion Under ₹999",
        "description": "Athletic jogger track pants powered by Rapid-Dry sweat-wicking tech and four-way stretch poly-spandex.",
        "specs": {
            "Technology": "Rapid-Dry Anti-Odor Technology",
            "Pockets": "Dual Zipper Deep Pockets",
            "Waist": "Elasticated Drawstring"
        }
    },
    {
        "id": 34,
        "name": "Solimo 12-inch Silent Quartz Decorative Wall Clock",
        "category": "home",
        "price": 399,
        "originalPrice": 899,
        "discount": "56% OFF",
        "rating": 4.3,
        "reviewsCount": 4210,
        "image": "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&q=80",
        "brand": "Solimo",
        "dealTag": "Under ₹499",
        "description": "Sleek 12-inch wall clock with non-ticking silent sweep quartz movement and clear bold digits for living room or bedroom.",
        "specs": {
            "Movement": "Silent Quartz Non-Ticking",
            "Diameter": "12 Inches (30 cm)",
            "Battery": "1 x AA Battery Powered"
        }
    },
    {
        "id": 35,
        "name": "Safire Framed Botanical Canvas Wall Art (Set of 3)",
        "category": "home",
        "price": 399,
        "originalPrice": 1299,
        "discount": "69% OFF",
        "rating": 4.4,
        "reviewsCount": 1840,
        "image": "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=600&q=80",
        "brand": "Safire",
        "dealTag": "Under ₹499",
        "description": "Modern minimalist sage green botanical leaf art prints framed on sturdy textured wood panels ready to hang.",
        "specs": {
            "Set": "3 Matching Framed Panels",
            "Dimensions": "9 x 12 Inches Each",
            "Print": "HD Giclée Waterproof Inks"
        }
    },
    {
        "id": 36,
        "name": "Philips Deco LED Table Lamp with Touch Dimmer",
        "category": "home",
        "price": 699,
        "originalPrice": 1499,
        "discount": "53% OFF",
        "rating": 4.5,
        "reviewsCount": 2900,
        "image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80",
        "brand": "Philips",
        "dealTag": "Recommended For You",
        "description": "Eye-friendly flexible neck LED desk lamp with 3 brightness color temperatures and USB rechargeable battery.",
        "specs": {
            "Lumens": "Warm / Natural / Cool White 3 Modes",
            "Neck": "360° Gooseneck Flexible",
            "Power": "Rechargeable USB-C"
        }
    },
    {
        "id": 37,
        "name": "Bombay Dyeing 100% Cotton Double Bedsheet + 2 Pillow Covers",
        "category": "home",
        "price": 699,
        "originalPrice": 1899,
        "discount": "63% OFF",
        "rating": 4.4,
        "reviewsCount": 3410,
        "image": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80",
        "brand": "Bombay Dyeing",
        "dealTag": "Home Essentials Under ₹499",
        "description": "Luxurious 144 TC breathable pure cotton double king bedsheet with color-lock technology and hypoallergenic fibers.",
        "specs": {
            "Fabric": "100% Pure Long-Staple Cotton",
            "Thread Count": "144 TC",
            "Size": "Queen/King 225 x 250 cm"
        }
    },
    {
        "id": 38,
        "name": "Wakefit Hollow Fiber Sleeping Pillows (Set of 2)",
        "category": "home",
        "price": 499,
        "originalPrice": 1199,
        "discount": "58% OFF",
        "rating": 4.5,
        "reviewsCount": 8900,
        "image": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80",
        "brand": "Wakefit",
        "dealTag": "Under ₹499",
        "description": "Fluffy virgin microfiber hollow fiber pillows designed for perfect spinal alignment and head support.",
        "specs": {
            "Filling": "100% Virgin Hollow Microfiber",
            "Shell": "Breathable Spun Poly Fabric",
            "Set": "Pack of 2 Standard Pillows"
        }
    },
    {
        "id": 39,
        "name": "Urban Space Semi-Blackout Grommet Window Curtains (2-Pack)",
        "category": "home",
        "price": 799,
        "originalPrice": 1999,
        "discount": "60% OFF",
        "rating": 4.4,
        "reviewsCount": 2780,
        "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80",
        "brand": "Urban Space",
        "dealTag": "Top Rated",
        "description": "Heavy textured linen-look thermal insulated curtains with anti-rust brass metal eyelet rings.",
        "specs": {
            "Fabric": "Triple Weave Poly-Linen",
            "Light Filtering": "80% Room Darkening",
            "Dimensions": "7 Feet (84 x 48 Inches)"
        }
    },
    {
        "id": 40,
        "name": "Non-Stick Cookware Set (3-Piece Granite)",
        "category": "home",
        "price": 999,
        "originalPrice": 1999,
        "discount": "50% OFF",
        "rating": 4.5,
        "reviewsCount": 1532,
        "image": "https://images.unsplash.com/photo-1584990347449-399c513e9a56?w=600&q=80",
        "brand": "Prestige",
        "dealTag": "Deals of the Day",
        "description": "5-layer durable granite spatter coating cookware includes Fry Pan 24cm, Omni Tawa 25cm, and Kadai with glass lid.",
        "specs": {
            "Coating": "5-Layer German Non-Stick Granite",
            "Base": "Gas & Induction Compatible Base",
            "Pieces": "Tawa + Fry Pan + Kadai"
        }
    },
    {
        "id": 41,
        "name": "Pigeon by Stovekraft 1.5L Stainless Steel Electric Kettle",
        "category": "home",
        "price": 599,
        "originalPrice": 1295,
        "discount": "54% OFF",
        "rating": 4.3,
        "reviewsCount": 14200,
        "image": "https://images.unsplash.com/photo-1594213114663-ddf4f240f084?w=600&q=80",
        "brand": "Pigeon",
        "dealTag": "Crazy Low Prices",
        "description": "1500W rapid boiling kettle with 360-degree swivel base, auto shut-off, and boil-dry safety protection.",
        "specs": {
            "Capacity": "1.5 Litres",
            "Power": "1500 Watts Rapid Boiling",
            "Material": "Food Grade Stainless Steel"
        }
    },
    {
        "id": 42,
        "name": "Milton Executive Stainless Steel 3-Tier Lunch Box with Bag",
        "category": "home",
        "price": 499,
        "originalPrice": 995,
        "discount": "50% OFF",
        "rating": 4.4,
        "reviewsCount": 5200,
        "image": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80",
        "brand": "Milton",
        "dealTag": "Under ₹499",
        "description": "Leak-proof airtight stainless steel food containers packed inside an insulated fabric carrier bag with spoon.",
        "specs": {
            "Material": "100% Rust-Proof Food Grade Steel",
            "Insulation": "Keeps Meals Warm for 4-5 Hours",
            "Containers": "3 Containers (290ml each)"
        }
    },
    {
        "id": 43,
        "name": "Cello Flip Style Stainless Steel Water Bottle 750ml",
        "category": "home",
        "price": 349,
        "originalPrice": 799,
        "discount": "56% OFF",
        "rating": 4.3,
        "reviewsCount": 3900,
        "image": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80",
        "brand": "Cello",
        "dealTag": "Under ₹499",
        "description": "Single-wall durable stainless steel lightweight water bottle with flip cap and convenient carrying loop.",
        "specs": {
            "Capacity": "750 ml",
            "Material": "BPA-Free 304 Stainless Steel",
            "Cap": "Leak-Proof Push Button Flip Cap"
        }
    },
    {
        "id": 44,
        "name": "SG Kashmir Willow Phoenix Full Size Cricket Bat",
        "category": "sports",
        "price": 1299,
        "originalPrice": 2499,
        "discount": "48% OFF",
        "rating": 4.4,
        "reviewsCount": 1840,
        "image": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80",
        "brand": "SG",
        "dealTag": "Recommended For You",
        "description": "Handcrafted traditionally shaped Kashmir willow bat with thick edges, curved blade, and Sarawak cane handle.",
        "specs": {
            "Willow": "Grade 1 Kashmir Willow",
            "Handle": "Singapore Sarawak Cane",
            "Weight": "1180 - 1240 grams"
        }
    },
    {
        "id": 45,
        "name": "Yonex ZR 100 Light Aluminum Badminton Racquet with Cover",
        "category": "sports",
        "price": 649,
        "originalPrice": 1290,
        "discount": "50% OFF",
        "rating": 4.4,
        "reviewsCount": 6890,
        "image": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80",
        "brand": "Yonex",
        "dealTag": "Best Sellers",
        "description": "Isometric head shape creates larger sweet spot for powerful smashes. Lightweight durable aluminum frame.",
        "specs": {
            "Frame": "Lightweight Aluminum Isometric",
            "Tension": "19-24 lbs Pre-strung",
            "Grip": "G4 Cushioned Grip"
        }
    },
    {
        "id": 46,
        "name": "Nivia Storm Rubber Molded Football Size 5",
        "category": "sports",
        "price": 499,
        "originalPrice": 999,
        "discount": "50% OFF",
        "rating": 4.3,
        "reviewsCount": 4890,
        "image": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80",
        "brand": "Nivia",
        "dealTag": "Under ₹499",
        "description": "32-panel high durability rubber molded outer suitable for rough gravel, grass, and synthetic turf pitches.",
        "specs": {
            "Size": "Official Size 5",
            "Construction": "32-Panel Molded Rubber",
            "Surface": "All-Weather All-Terrain"
        }
    },
    {
        "id": 47,
        "name": "Yoga Mat (Anti-Tear 6mm with Strap)",
        "category": "sports",
        "price": 399,
        "originalPrice": 799,
        "discount": "50% OFF",
        "rating": 4.4,
        "reviewsCount": 723,
        "image": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80",
        "brand": "Boldfit",
        "dealTag": "Customers Most-Loved",
        "description": "High-density anti-skid ribbed textured EVA material provides supreme joint cushioning and floor grip.",
        "specs": {
            "Thickness": "6mm High Density",
            "Material": "Sweat-Resistant Washable EVA",
            "Bonus": "Includes Free Carry Strap"
        }
    },
    {
        "id": 48,
        "name": "Kakss Solid Hex Rubber Coated Dumbbell Pair (5kg x 2)",
        "category": "sports",
        "price": 1199,
        "originalPrice": 2499,
        "discount": "52% OFF",
        "rating": 4.5,
        "reviewsCount": 3100,
        "image": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80",
        "brand": "Kakss",
        "dealTag": "Top Rated",
        "description": "Hexagonal anti-roll design cast iron dumbbells coated in premium odor-free virgin rubber with chrome knurled handles.",
        "specs": {
            "Weight": "5kg Each (10kg Total Pair)",
            "Coating": "Shock-Absorbing Virgin Rubber",
            "Grip": "Ergonomic Knurled Steel"
        }
    },
    {
        "id": 49,
        "name": "Slovic Resistance Loop Exercise Bands (Set of 5 Levels)",
        "category": "sports",
        "price": 399,
        "originalPrice": 999,
        "discount": "60% OFF",
        "rating": 4.4,
        "reviewsCount": 4210,
        "image": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&q=80",
        "brand": "Slovic",
        "dealTag": "Under ₹499",
        "description": "100% natural Malaysian latex fitness bands ranging from X-Light (5 lbs) to X-Heavy (30 lbs) for home workouts.",
        "specs": {
            "Material": "100% Natural Snap-Proof Latex",
            "Set": "5 Color Coded Resistance Levels",
            "Guide": "Includes Workout Booklet"
        }
    },
    {
        "id": 50,
        "name": "Philips Compact 1000W Gentle Hair Dryer HP8100/46",
        "category": "beauty",
        "price": 849,
        "originalPrice": 1295,
        "discount": "34% OFF",
        "rating": 4.4,
        "reviewsCount": 9100,
        "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
        "brand": "Philips",
        "dealTag": "Best Sellers",
        "description": "ThermoProtect temperature setting provides optimal drying temperature and protection from hair overheating.",
        "specs": {
            "Power": "1000 Watts Gentle Airflow",
            "Settings": "2 Flexible Speed & Heat Modes",
            "Warranty": "2 Years Brand Warranty"
        }
    },
    {
        "id": 51,
        "name": "Nova Ceramic Coating Professional Hair Straightener",
        "category": "beauty",
        "price": 999,
        "originalPrice": 1895,
        "discount": "47% OFF",
        "rating": 4.3,
        "reviewsCount": 3200,
        "image": "https://images.unsplash.com/photo-1562887189-e5d078343de4?w=600&q=80",
        "brand": "Nova",
        "dealTag": "Deals of the Day",
        "description": "Quick 30-second rapid heat up ceramic tourmaline plates with 210°C salon styling temperature and swivel cord.",
        "specs": {
            "Plates": "Ceramic Tourmaline Glaze",
            "Heat-Up": "Instant 30 Seconds",
            "Cord": "360° Anti-Tangle Swivel Cord"
        }
    },
    {
        "id": 52,
        "name": "Mamaearth Vitamin C Daily Glow Face Serum (30ml)",
        "category": "beauty",
        "price": 349,
        "originalPrice": 599,
        "discount": "42% OFF",
        "rating": 4.4,
        "reviewsCount": 6510,
        "image": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80",
        "brand": "Mamaearth",
        "dealTag": "Under ₹499",
        "description": "Enriched with 10% Vitamin C and 5% Niacinamide to fade dark spots, boost radiance, and even skin tone.",
        "specs": {
            "Active Ingredients": "Vitamin C + Niacinamide + Turmeric",
            "Skin Type": "All Skin Types Dermatologically Tested",
            "Volume": "30 ml"
        }
    },
    {
        "id": 53,
        "name": "Bella Vita Luxury CEO Man Eau De Parfum (100ml)",
        "category": "beauty",
        "price": 599,
        "originalPrice": 1099,
        "discount": "45% OFF",
        "rating": 4.3,
        "reviewsCount": 11200,
        "image": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80",
        "brand": "Bella Vita",
        "dealTag": "Trending Now",
        "description": "Sophisticated masculine woody aromatic fragrance blending citrusy lemon, aromatic lavender, and warm tonka bean.",
        "specs": {
            "Concentration": "Eau De Parfum (Long Lasting)",
            "Notes": "Lemon, Lavender, Vetiver, Tonka",
            "Volume": "100 ml Full Size"
        }
    },
    {
        "id": 54,
        "name": "WOW Skin Science 99% Pure Aloe Vera Gel (250ml)",
        "category": "beauty",
        "price": 249,
        "originalPrice": 499,
        "discount": "50% OFF",
        "rating": 4.5,
        "reviewsCount": 8400,
        "image": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80",
        "brand": "WOW Skin Science",
        "dealTag": "Starting ₹299",
        "description": "Multi-purpose soothing moisturizer for face, skin, and hair infused with 99% pure cold-pressed aloe vera.",
        "specs": {
            "Purity": "99% Pure Organic Aloe Vera",
            "Free From": "No Mineral Oil, Parabens, Silicones",
            "Uses": "Face, Hair & Sunburn Soothing"
        }
    },
    {
        "id": 55,
        "name": "Atomic Habits by James Clear (Paperback Best Seller)",
        "category": "books",
        "price": 349,
        "originalPrice": 799,
        "discount": "56% OFF",
        "rating": 4.7,
        "reviewsCount": 18400,
        "image": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
        "brand": "Penguin Random House",
        "dealTag": "Best Sellers",
        "description": "The revolutionary guide on how tiny changes can lead to remarkable results in life, work, and discipline.",
        "specs": {
            "Format": "Paperback Edition",
            "Language": "English",
            "Pages": "320 Pages"
        }
    },
    {
        "id": 56,
        "name": "The Alchemist by Paulo Coelho (Special Edition)",
        "category": "books",
        "price": 199,
        "originalPrice": 399,
        "discount": "50% OFF",
        "rating": 4.6,
        "reviewsCount": 14200,
        "image": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
        "brand": "HarperCollins",
        "dealTag": "Under ₹199",
        "description": "An inspirational international bestseller about Santiago, an Andalusian shepherd boy who yearns to travel in search of treasure.",
        "specs": {
            "Author": "Paulo Coelho",
            "Genre": "Philosophical Fiction",
            "Binding": "Mass Market Paperback"
        }
    },
    {
        "id": 57,
        "name": "Classmate Pulse Spiral Ruled Notebooks (Pack of 3)",
        "category": "books",
        "price": 199,
        "originalPrice": 360,
        "discount": "45% OFF",
        "rating": 4.5,
        "reviewsCount": 3900,
        "image": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&q=80",
        "brand": "Classmate",
        "dealTag": "Under ₹199",
        "description": "Single subject spiral-bound notebooks with ozone-treated elemental chlorine-free bright white paper.",
        "specs": {
            "Paper": "70 GSM Bright White Paper",
            "Binding": "Durable Rust-Free Wiro Bound",
            "Pages": "300 Pages Each"
        }
    },
    {
        "id": 58,
        "name": "Casio FX-82MS 2nd Gen Scientific Calculator",
        "category": "books",
        "price": 549,
        "originalPrice": 750,
        "discount": "27% OFF",
        "rating": 4.6,
        "reviewsCount": 7800,
        "image": "https://images.unsplash.com/photo-1611365892117-00ac5ef43759?w=600&q=80",
        "brand": "Casio",
        "dealTag": "Top Rated",
        "description": "240 functions 2-line dot matrix display scientific calculator approved for engineering and academic curricula.",
        "specs": {
            "Functions": "240 Built-in Scientific Functions",
            "Display": "2-Line High Contrast Display",
            "Keys": "Color-Coded Plastic Keys"
        }
    },
    {
        "id": 59,
        "name": "Webby High Speed 1:18 RC Racing Monster Truck",
        "category": "toys",
        "price": 899,
        "originalPrice": 1999,
        "discount": "55% OFF",
        "rating": 4.3,
        "reviewsCount": 2190,
        "image": "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&q=80",
        "brand": "Webby",
        "dealTag": "Recommended For You",
        "description": "High-speed remote control off-road rock crawler monster buggy with shock absorbers and rechargeable battery pack.",
        "specs": {
            "Scale": "1:18 Off-Road Monster Truck",
            "Control": "2.4GHz Wireless Pistol Grip",
            "Battery": "Rechargeable Battery Included"
        }
    },
    {
        "id": 60,
        "name": "Funskool Mega Construction Building Bricks Set (80 Pieces)",
        "category": "toys",
        "price": 499,
        "originalPrice": 999,
        "discount": "50% OFF",
        "rating": 4.5,
        "reviewsCount": 3820,
        "image": "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600&q=80",
        "brand": "Funskool",
        "dealTag": "Under ₹499",
        "description": "Brightly colored non-toxic interlocking plastic building blocks encouraging spatial imagination and hand-eye coordination.",
        "specs": {
            "Pieces": "80 Multi-Colored Bricks",
            "Material": "100% Non-Toxic BPA Free Plastic",
            "Age": "3 Years and Above"
        }
    },
    {
        "id": 61,
        "name": "Hasbro Monopoly India Edition Classic Family Board Game",
        "category": "toys",
        "price": 799,
        "originalPrice": 1499,
        "discount": "47% OFF",
        "rating": 4.6,
        "reviewsCount": 4910,
        "image": "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600&q=80",
        "brand": "Hasbro",
        "dealTag": "Best Sellers",
        "description": "The fast-dealing property trading board game featuring iconic Indian cities, railway stations, and utilities.",
        "specs": {
            "Edition": "Official India Edition",
            "Players": "2 to 6 Players",
            "Includes": "Gameboard, 8 Tokens, 28 Title Deeds"
        }
    },
    {
        "id": 62,
        "name": "Happilo Premium California Whole Almonds 500g",
        "category": "grocery",
        "price": 399,
        "originalPrice": 699,
        "discount": "43% OFF",
        "rating": 4.5,
        "reviewsCount": 15400,
        "image": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&q=80",
        "brand": "Happilo",
        "dealTag": "Best Sellers",
        "description": "100% real California raw whole almonds high in dietary fiber, protein, and natural antioxidant Vitamin E.",
        "specs": {
            "Weight": "500 Grams Resealable Pouch",
            "Origin": "California Grade A",
            "Nutrition": "Zero Cholesterol, High Fiber"
        }
    },
    {
        "id": 63,
        "name": "Tata Sampann 100% Pure Whole Cashews W320 200g",
        "category": "grocery",
        "price": 299,
        "originalPrice": 499,
        "discount": "40% OFF",
        "rating": 4.4,
        "reviewsCount": 6800,
        "image": "https://images.unsplash.com/photo-1536591375315-1b836835a2b7?w=600&q=80",
        "brand": "Tata Sampann",
        "dealTag": "Crazy Low Prices",
        "description": "Flavourful whole jumbo cashews meeting stringent quality criteria with zero trans-fats and rich creamy texture.",
        "specs": {
            "Grade": "Whole White Cashews W320",
            "Weight": "200 Grams",
            "Quality": "100% Pure Natural Kernels"
        }
    },
    {
        "id": 64,
        "name": "True Elements Certified Organic Raw Chia Seeds 250g",
        "category": "grocery",
        "price": 189,
        "originalPrice": 350,
        "discount": "46% OFF",
        "rating": 4.6,
        "reviewsCount": 8900,
        "image": "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600&q=80",
        "brand": "True Elements",
        "dealTag": "Under ₹199",
        "description": "Superfood chia seeds loaded with plant-based Omega-3 fatty acids, calcium, and soluble dietary fiber for weight management.",
        "specs": {
            "Certification": "Certified Organic & Non-GMO",
            "Weight": "250 Grams Pouch",
            "Benefits": "High Omega-3 & Gut Fiber"
        }
    },
    {
        "id": 65,
        "name": "Fortune Sunlite Refined Sunflower Cooking Oil 1 Litre Pouch",
        "category": "grocery",
        "price": 159,
        "originalPrice": 199,
        "discount": "20% OFF",
        "rating": 4.5,
        "reviewsCount": 11200,
        "image": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80",
        "brand": "Fortune",
        "dealTag": "Under ₹199",
        "description": "Light, healthy refined sunflower oil enriched with Vitamins A and D. Retains natural flavor of home cooking.",
        "specs": {
            "Volume": "1 Litre Food-Grade Pouch",
            "Enrichment": "Fortified with Vitamin A & D",
            "Smoke Point": "High Smoke Point for Frying"
        }
    },
    {
        "id": 66,
        "name": "Pedigree Adult Dry Dog Food Meat & Rice 1.2kg Pack",
        "category": "pets",
        "price": 399,
        "originalPrice": 550,
        "discount": "27% OFF",
        "rating": 4.5,
        "reviewsCount": 8410,
        "image": "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&q=80",
        "brand": "Pedigree",
        "dealTag": "Best Sellers",
        "description": "Complete and balanced nutrition for adult dogs with 20% crude protein, healthy omega-6 for shiny coat, and strong teeth.",
        "specs": {
            "Weight": "1.2 kg Dry Kibble",
            "Flavor": "Real Chicken & Vegetable Rice",
            "Lifestage": "Adult Dogs (All Breeds)"
        }
    },
    {
        "id": 67,
        "name": "Whiskas Adult Wet Cat Food (Tuna in Jelly, 12 x 85g Pouches)",
        "category": "pets",
        "price": 449,
        "originalPrice": 600,
        "discount": "25% OFF",
        "rating": 4.6,
        "reviewsCount": 5600,
        "image": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80",
        "brand": "Whiskas",
        "dealTag": "Under ₹499",
        "description": "Appetizing real tuna fish morsels in delicious jelly tailored for adult cats with essential taurine and hydration.",
        "specs": {
            "Pack Size": "12 Pouches x 85g (1020g Total)",
            "Flavor": "Tuna in Savoury Jelly",
            "Benefit": "Urinary Tract Health & Hydration"
        }
    },
    {
        "id": 68,
        "name": "Meat Up Real Chicken Dog Biscuits Jar (500g)",
        "category": "pets",
        "price": 179,
        "originalPrice": 299,
        "discount": "40% OFF",
        "rating": 4.4,
        "reviewsCount": 3900,
        "image": "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=600&q=80",
        "brand": "Meat Up",
        "dealTag": "Under ₹199",
        "description": "Crunchy oven-baked bone shaped chicken biscuits fortified with calcium and essential vitamins for daily reward treats.",
        "specs": {
            "Weight": "500 Grams Resealable Pet Jar",
            "Ingredients": "Real Chicken, Wheat, Calcium",
            "Feature": "Cleans Plaque & Freshens Breath"
        }
    }
];

class ProductService {
    constructor() {
        this.products = [...localFallbackProducts];
        this.baseUrl = (window.API_BASE || '/api') + '/products';
    }

    async init() {
        try {
            const data = await apiFetch('/products');
            if (data.success && data.products && data.products.length > 0) {
                this.products = data.products;
                console.log("ProductService initialized with backend catalog.");
            }
        } catch (err) {
            console.log("ProductService failed to contact backend, utilizing fallback catalog.", err.message);
        }
        window.allProducts = this.products;
        window.products = this.products;
        return this.products;
    }

    getAllProducts() {
        return this.products;
    }

    getProductById(id) {
        return this.products.find(p => p.id === parseInt(id));
    }

    getProductsByCategory(category) {
        if (!category || category.toLowerCase() === 'all') return this.products;
        return this.products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    searchProducts(query, category = 'all') {
        let list = this.products;
        if (category && category.toLowerCase() !== 'all') {
            const catLower = category.toLowerCase();
            if (catLower === 'mobiles') {
                list = list.filter(p => p.category === 'electronics' && (p.name.toLowerCase().includes('galaxy') || p.name.toLowerCase().includes('phone') || p.name.toLowerCase().includes('oneplus') || p.name.toLowerCase().includes('redmi') || p.name.toLowerCase().includes('realme')));
            } else if (catLower === 'laptops') {
                list = list.filter(p => p.category === 'electronics' && (p.name.toLowerCase().includes('macbook') || p.name.toLowerCase().includes('laptop') || p.name.toLowerCase().includes('vivobook') || p.name.toLowerCase().includes('thinkpad')));
            } else if (catLower === 'gaming') {
                list = list.filter(p => p.category === 'electronics' || p.category === 'toys' || p.name.toLowerCase().includes('game') || p.name.toLowerCase().includes('gaming') || p.name.toLowerCase().includes('keyboard') || p.name.toLowerCase().includes('mouse'));
            } else if (catLower === 'luxury') {
                list = list.filter(p => p.category === 'luxury' || p.price >= 5000 || p.dealTag === 'Luxury' || (p.brand && ['fossil', 'titan', 'calvin klein', 'tommy hilfiger', 'sony', 'apple'].includes(p.brand.toLowerCase())));
            } else {
                list = list.filter(p => p.category.toLowerCase() === catLower);
            }
        }

        if (!query || !query.trim()) return list;

        let q = query.toLowerCase().trim();

        // 1. Extract Price Range Constraints
        let maxPrice = null;
        let minPrice = null;

        const underMatch = q.match(/(?:under|below|less than|<=|<|upto|up to)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(k|lakh)?/i);
        if (underMatch) {
            let num = parseFloat(underMatch[1]);
            if (underMatch[2] && underMatch[2].toLowerCase() === 'k') num *= 1000;
            if (underMatch[2] && underMatch[2].toLowerCase() === 'lakh') num *= 100000;
            maxPrice = num;
            q = q.replace(underMatch[0], ' ').trim();
        }

        const aboveMatch = q.match(/(?:above|over|more than|>=|>)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(k|lakh)?/i);
        if (aboveMatch) {
            let num = parseFloat(aboveMatch[1]);
            if (aboveMatch[2] && aboveMatch[2].toLowerCase() === 'k') num *= 1000;
            if (aboveMatch[2] && aboveMatch[2].toLowerCase() === 'lakh') num *= 100000;
            minPrice = num;
            q = q.replace(aboveMatch[0], ' ').trim();
        }

        // 2. Tokenize remaining query
        const tokens = q.split(/\s+/).filter(t => t.length > 0 && !['a', 'an', 'the', 'for', 'in', 'of', 'and', 'with', 'to', 'show', 'me', 'best', 'good', 'top', 'buy', 'item', 'items', 'find'].includes(t));

        // 3. Common E-Commerce Synonym Map
        const synonyms = {
            'phone': ['galaxy', 'oneplus', 'redmi', 'realme', 'smartphone', 'mobile', 'android', '5g', 'apple', 'iphone'],
            'phones': ['galaxy', 'oneplus', 'redmi', 'realme', 'smartphone', 'mobile', 'android', '5g'],
            'mobile': ['galaxy', 'oneplus', 'redmi', 'realme', 'smartphone', 'phone', '5g'],
            'smartphone': ['galaxy', 'oneplus', 'redmi', 'realme', 'phone', 'mobile', '5g'],
            'earbuds': ['earphone', 'earphones', 'headphones', 'headphone', 'airpods', 'tws', 'neckband', 'boat', 'noise', 'boult', 'audio'],
            'earphone': ['earbuds', 'headphones', 'neckband', 'audio', 'boat', 'noise', 'boult'],
            'earphones': ['earbuds', 'headphones', 'neckband', 'audio', 'boat', 'noise', 'boult'],
            'headphone': ['earbuds', 'headphones', 'neckband', 'audio', 'boat', 'sony', 'over-ear'],
            'headphones': ['earbuds', 'headphone', 'neckband', 'audio', 'boat', 'sony', 'over-ear'],
            'airpods': ['earbuds', 'tws', 'wireless', 'bluetooth', 'audio'],
            'speaker': ['speakers', 'bluetooth', 'soundbar', 'boat', 'jbl', 'audio'],
            'speakers': ['speaker', 'bluetooth', 'soundbar', 'boat', 'jbl', 'audio'],
            'watch': ['smartwatch', 'chronograph', 'leather', 'titan', 'fossil', 'noise', 'boat', 'fire-boltt'],
            'watches': ['smartwatch', 'chronograph', 'leather', 'titan', 'fossil', 'noise', 'boat'],
            'smartwatch': ['watch', 'noise', 'boat', 'fire-boltt', 'fitness', 'tracker', 'amoled'],
            'laptop': ['macbook', 'asus', 'vivobook', 'hp', 'lenovo', 'dell', 'computer', 'notebook'],
            'laptops': ['macbook', 'asus', 'vivobook', 'hp', 'lenovo', 'dell', 'computer', 'notebook'],
            'macbook': ['apple', 'laptop', 'm2', 'm3', 'notebook'],
            'keyboard': ['mechanical', 'rgb', 'gaming', 'wireless', 'keyboards'],
            'powerbank': ['power bank', 'battery', 'fast charging', 'type-c', 'charger'],
            'shoe': ['shoes', 'sneakers', 'sneaker', 'running', 'boots', 'nike', 'puma', 'footwear', 'trainers'],
            'shoes': ['shoe', 'sneakers', 'sneaker', 'running', 'boots', 'nike', 'puma', 'footwear', 'trainers'],
            'sneaker': ['shoes', 'sneakers', 'running', 'nike', 'puma', 'streetwear'],
            'sneakers': ['shoes', 'sneaker', 'running', 'nike', 'puma', 'streetwear'],
            'jacket': ['bomber', 'hoodie', 'leather', 'windbreaker', 'coat', 'winter'],
            'jackets': ['bomber', 'hoodie', 'leather', 'windbreaker', 'coat', 'winter'],
            'shirt': ['t-shirt', 'tee', 'cotton', 'formal', 'casual', 'polo'],
            'shirts': ['t-shirt', 'tee', 'cotton', 'formal', 'casual', 'polo'],
            'tshirt': ['t-shirt', 'tee', 'shirt', 'cotton', 'oversized'],
            't-shirt': ['tshirt', 'tee', 'shirt', 'cotton', 'oversized'],
            'hoodie': ['oversized', 'fleece', 'sweatshirt', 'streetwear', 'jacket'],
            'cargo': ['pants', 'trousers', 'streetwear', 'joggers'],
            'dress': ['midi', 'maxi', 'floral', 'gown', 'women', 'kurti', 'saree'],
            'dresses': ['midi', 'maxi', 'floral', 'gown', 'women', 'kurti', 'saree'],
            'perfume': ['fragrance', 'scent', 'cologne', 'eau de parfum', 'bella vita', 'skinn'],
            'fragrance': ['perfume', 'scent', 'cologne', 'eau de parfum'],
            'makeup': ['lipstick', 'matte', 'foundation', 'eyeliner', 'mascara', 'beauty', 'maybelline', 'lakme'],
            'skincare': ['serum', 'sunscreen', 'cleanser', 'face wash', 'moisturizer', 'ordinary', 'minimalist', 'derma'],
            'serum': ['skincare', 'glow', 'ordinary', 'minimalist', 'niacinamide', 'vitamin c'],
            'cricket': ['bat', 'ball', 'kit', 'sports', 'mrf', 'sg'],
            'badminton': ['racket', 'shuttlecock', 'yonex', 'sports'],
            'gym': ['dumbbells', 'protein', 'whey', 'mat', 'yoga', 'fitness', 'resistance'],
            'fitness': ['dumbbells', 'protein', 'whey', 'yoga', 'smartwatch', 'gym'],
            'snack': ['snacks', 'dry fruits', 'almonds', 'cashews', 'tea', 'coffee', 'cookies'],
            'snacks': ['snack', 'dry fruits', 'almonds', 'cashews', 'tea', 'coffee', 'cookies'],
            'grocery': ['oil', 'tea', 'coffee', 'almonds', 'dry fruits', 'snack'],
            'tea': ['green tea', 'chai', 'taj mahal', 'tata tea', 'organic'],
            'coffee': ['nescafe', 'davidoff', 'espresso', 'roast', 'instant'],
            'cookware': ['pan', 'kadhai', 'prestige', 'pigeon', 'non-stick', 'fry pan'],
            'kitchen': ['blender', 'mixer', 'air fryer', 'kettle', 'cookware', 'pan'],
            'toy': ['toys', 'lego', 'board game', 'monopoly', 'uno', 'puzzle', 'car'],
            'toys': ['toy', 'lego', 'board game', 'monopoly', 'uno', 'puzzle', 'car'],
            'dog': ['puppy', 'pet', 'pedigree', 'dog food', 'leash', 'chew'],
            'cat': ['kitten', 'pet', 'whiskas', 'cat food', 'litter'],
            'pet': ['dog', 'cat', 'pedigree', 'whiskas', 'pet food']
        };

        let expandedTokens = [...tokens];
        tokens.forEach(t => {
            if (synonyms[t]) {
                expandedTokens.push(...synonyms[t]);
            }
        });

        // 4. Scoring and Filtering
        function matchWord(text, word) {
            if (!text || !word) return false;
            const lower = text.toLowerCase();
            const w = word.toLowerCase();
            if (w === 'phone' || w === 'phones') {
                return /(?:^|[^a-z0-9])(phone|phones|smartphone|smartphones|mobile|mobiles|5g)(?:$|[^a-z0-9])/i.test(lower);
            }
            if (w === 'air') {
                return /(?:^|[^a-z0-9])air(?:$|[^a-z0-9])/i.test(lower);
            }
            if (w.length <= 3) {
                return new RegExp('(?:^|[^a-z0-9])' + w + '(?:$|[^a-z0-9])', 'i').test(lower);
            }
            return lower.includes(w);
        }

        const scoredProducts = [];

        for (const p of list) {
            if (maxPrice !== null && p.price > maxPrice) continue;
            if (minPrice !== null && p.price < minPrice) continue;

            if (tokens.length === 0) {
                scoredProducts.push({ product: p, score: 100 - (p.price / 1000) });
                continue;
            }

            const pName = (p.name || '').toLowerCase();
            const pBrand = (p.brand || '').toLowerCase();
            const pCat = (p.category || '').toLowerCase();
            const pDesc = (p.description || '').toLowerCase();
            const pDeal = (p.dealTag || '').toLowerCase();
            const pSpecs = Object.values(p.specs || {}).join(' ').toLowerCase();

            let score = 0;

            if (pName.includes(q)) score += 80;
            if (pBrand.includes(q)) score += 50;
            if (pCat.includes(q)) score += 30;

            let matchedTokenCount = 0;
            tokens.forEach(t => {
                let tokenMatched = false;
                if (matchWord(pName, t)) { score += 35; tokenMatched = true; }
                if (matchWord(pBrand, t)) { score += 25; tokenMatched = true; }
                if (matchWord(pCat, t)) { score += 20; tokenMatched = true; }
                if (matchWord(pDeal, t)) { score += 15; tokenMatched = true; }
                if (matchWord(pSpecs, t)) { score += 12; tokenMatched = true; }
                if (matchWord(pDesc, t)) { score += 10; tokenMatched = true; }

                if (tokenMatched) matchedTokenCount++;
            });

            expandedTokens.forEach(st => {
                if (matchWord(pName, st)) score += 18;
                if (matchWord(pBrand, st)) score += 15;
                if (matchWord(pCat, st)) score += 10;
                if (matchWord(pDesc, st)) score += 6;
            });

            if (matchedTokenCount === tokens.length && tokens.length > 1) {
                score += 50;
            }

            // Quality threshold: multi-token queries must match at least 1 keyword in name/brand/category/specs OR match >= 2 tokens
            if (tokens.length > 1) {
                const hasStrongAnchor = tokens.some(t => matchWord(pName, t) || matchWord(pBrand, t) || matchWord(pCat, t) || matchWord(pSpecs, t)) || expandedTokens.some(st => matchWord(pName, st) || matchWord(pCat, st));
                if (!hasStrongAnchor && matchedTokenCount < 2) {
                    continue;
                }
            }

            if (score >= 25) {
                score += (p.rating || 4.0) * 2;
                scoredProducts.push({ product: p, score });
            }
        }

        scoredProducts.sort((a, b) => b.score - a.score);
        return scoredProducts.map(sp => sp.product);
    }

    getTrendingProducts() {
        return [...this.products].sort((a, b) => b.rating - a.rating).slice(0, 6);
    }

    getFlashDeals() {
        return this.products.filter(p => p.discount && p.discount.includes('%')).slice(0, 4);
    }

    getLuxuryProducts() {
        return this.getProductsByCategory("luxury").slice(0, 4);
    }

    getRecommendedProducts() {
        return this.products.filter(p => p.rating >= 4.7).slice(4, 8);
    }

    getRelatedProducts(product) {
        if (!product) return [];
        return this.products.filter(p => p.id !== product.id && p.category.toLowerCase() === product.category.toLowerCase()).slice(0, 4);
    }
}

// Instantiate and expose globally
const productServiceInstance = new ProductService();
window.ProductService = productServiceInstance;
window.allProducts = productServiceInstance.getAllProducts();
window.products = productServiceInstance.getAllProducts();

// Fast-initialize so data is available on script load
productServiceInstance.init();
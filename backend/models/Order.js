const mongoose = require('mongoose');

/**
 * Order Model
 */
const OrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    address: {
        fullName: { type: String },
        addressLine: { type: String },
        city: { type: String },
        postalCode: { type: String },
        phone: { type: String }
    },
    products: [{
        id: Number,
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: "UPI" },
    paymentStatus: { type: String, default: "Paid" },
    orderStatus: { type: String, default: "Processing" },
    transactionId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);

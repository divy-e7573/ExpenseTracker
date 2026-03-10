const mongoose = require('mongoose');

const expenseSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        amount: {
            type: Number,
            required: [true, 'Please add an amount'],
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
            enum: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other'],
            default: 'Other'
        },
        description: {
            type: String,
            required: [true, 'Please add a description'],
            maxlength: 100
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Expense', expenseSchema);

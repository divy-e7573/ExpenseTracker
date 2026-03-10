const Expense = require('../models/Expense');

// @desc    Get all expenses for the user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: expenses.length,
            data: expenses
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Add expense
// @route   POST /api/expenses
// @access  Private
exports.addExpense = async (req, res) => {
    try {
        const { amount, category, description, date } = req.body;

        const expense = await Expense.create({
            amount,
            category,
            description,
            date: date ? new Date(date) : Date.now(),
            user: req.user.id
        });

        res.status(201).json({
            success: true,
            data: expense
        });
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
             const messages = Object.values(error.errors).map(val => val.message);
             return res.status(400).json({
                 success: false,
                 error: messages
             });
        } else {
             return res.status(500).json({ success: false, error: 'Server Error' });
        }
    }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ success: false, error: 'No expense found' });
        }

        // Make sure user owns expense
        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'User not authorized' });
        }

        await expense.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
    try {
        let expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ success: false, error: 'No expense found' });
        }

        // Make sure user owns expense
        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'User not authorized' });
        }

        expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: expense
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get analytics/summary
// @route   GET /api/expenses/analytics/summary
// @access  Private
exports.getAnalytics = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id });
        
        const totalAmount = expenses.reduce((acc, current) => acc + current.amount, 0);
        
        const byCategory = expenses.reduce((acc, curr) => {
            if(!acc[curr.category]) acc[curr.category] = 0;
            acc[curr.category] += curr.amount;
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                totalAmount,
                byCategory,
                totalTransactions: expenses.length
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
}

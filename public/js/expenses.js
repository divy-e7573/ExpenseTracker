// public/js/expenses.js
document.addEventListener('DOMContentLoaded', () => {
    // Protect routes
    requireAuth();

    const user = getUser();
    if (user) {
        const nameElements = document.querySelectorAll('.flex.items-center.space-x-3 span'); // Target John Doe span
        nameElements.forEach(el => {
            if (el.textContent === 'John Doe') {
                el.textContent = user.name;
            }
        });
    }

    loadExpenses();

    // Hook up settings to logout
    const settingsLinks = document.querySelectorAll('nav a');
    settingsLinks.forEach(link => {
        if (link.textContent.includes('Settings')) {
            link.textContent = 'Logout';
            link.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    });
});

async function loadExpenses() {
    try {
        const data = await fetchAPI('/expenses');

        if (data && data.success) {
            renderExpenses(data.data);
        }
    } catch (error) {
        console.error('Failed to load expenses', error);
    }
}

function renderExpenses(expenses) {
    const tbody = document.querySelector('tbody');
    const footerCount = document.querySelector('footer span');

    if (!tbody) return;

    if (footerCount) {
        footerCount.textContent = `Showing ${expenses.length} of ${expenses.length} expenses`;
    }

    tbody.innerHTML = ''; // clear hardcoded items

    if (expenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center">No expenses found</td></tr>';
        return;
    }

    expenses.forEach(exp => {
        const dateStr = new Date(exp.date).toLocaleDateString();
        
        let colorClass = 'bg-slate-100 text-slate-700'; // Default
        if (exp.category === 'Food') colorClass = 'bg-green-100 text-green-700';
        else if (exp.category === 'Transport') colorClass = 'bg-blue-100 text-blue-700';
        else if (exp.category === 'Entertainment') colorClass = 'bg-purple-100 text-purple-700';
        else if (exp.category === 'Shopping') colorClass = 'bg-amber-100 text-amber-700';

        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';
        row.innerHTML = `
            <td class="px-6 py-4 text-sm text-gray-600">${dateStr}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">${exp.description}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-medium ${colorClass} rounded-full">${exp.category}</span>
            </td>
            <td class="px-6 py-4 text-sm font-bold text-gray-900 text-right">$${exp.amount.toFixed(2)}</td>
            <td class="px-6 py-4 text-center">
                <button 
                  onclick="deleteExpense('${exp._id}')"
                  class="text-red-500 hover:text-red-700 font-medium text-sm transition-colors" 
                  data-purpose="delete-action"
                >Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Attach to window since we are calling it inline
window.deleteExpense = async function(id) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }

    try {
        const data = await fetchAPI(`/expenses/${id}`, {
            method: 'DELETE'
        });

        if (data && data.success) {
            showToast('Expense deleted!');
            loadExpenses(); // refresh list
        }
    } catch (error) {
        // Utils handles toast
        console.error('Failed to delete', error);
    }
};

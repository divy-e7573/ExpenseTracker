// public/js/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    // Protect dashboard
    requireAuth();

    const user = getUser();
    if (user) {
        const nameElements = document.querySelectorAll('p.truncate, span.truncate'); // Best guess for name places
        nameElements.forEach(el => {
            if (el.textContent === 'Alex Johnson' || el.textContent === 'John Doe') {
                el.textContent = user.name;
            }
        });
    }

    // Load initial data
    loadDashboardData();

    // Handle Add Expense Form
    const expenseForm = document.querySelector('form');
    if (expenseForm) {
        expenseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = expenseForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            const amount = document.getElementById('amount').value;
            const category = document.getElementById('category').value;
            const date = document.getElementById('date').value;
            const description = document.getElementById('description').value;

            // Map frontend category values to backend Enum if needed. It usually handles lowercase strings well in JS.
            // Our backend enum is: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other']
            const categoryMap = {
                'housing': 'Bills',
                'food': 'Food',
                'transport': 'Transport',
                'entertainment': 'Entertainment',
                'shopping': 'Shopping',
                'healthcare': 'Other',
                'other': 'Other'
            };

            const backendCategory = categoryMap[category] || 'Other';

            try {
                const data = await fetchAPI('/expenses', {
                    method: 'POST',
                    body: JSON.stringify({
                        amount: parseFloat(amount),
                        category: backendCategory,
                        date,
                        description
                    })
                });

                if (data && data.success) {
                    showToast('Expense added successfully!');
                    expenseForm.reset();
                    // Reload dashboard data
                    loadDashboardData();
                }
            } catch (error) {
                // error handled in utils
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Logout handling
    const settingsLinks = document.querySelectorAll('nav a');
    settingsLinks.forEach(link => {
        if (link.textContent.includes('Settings')) {
            // Repurpose Settings as Logout for now
            link.textContent = 'Logout';
            link.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    });
});

async function loadDashboardData() {
    try {
        // Fetch Analytics
        const analyticsData = await fetchAPI('/expenses/analytics/summary');
        
        if (analyticsData && analyticsData.success) {
            updateSummaryCards(analyticsData.data);
            updateChart(analyticsData.data);
        }

        // Fetch Recent Transactions
        const expensesData = await fetchAPI('/expenses');
        if (expensesData && expensesData.success) {
            updateRecentTransactions(expensesData.data);
        }

    } catch (error) {
        console.error('Error loading dashboard data', error);
    }
}

function updateSummaryCards(data) {
    // Basic logic to find the summary cards based on their hardcoded values and update them
    const totalEl = document.evaluate("//h2[contains(., '$4,250.00')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (totalEl) totalEl.textContent = `$${data.totalAmount.toFixed(2)}`;

    // Calculate weekly average (roughly)
    const weeklyAvgEl = document.evaluate("//h2[contains(., '$1,062.50')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (weeklyAvgEl) weeklyAvgEl.textContent = `$${(data.totalAmount / 4).toFixed(2)}`;

    // Find top category
    let topCategory = 'None';
    let topCategoryAmount = 0;
    
    if (data.byCategory) {
        for (const [cat, amt] of Object.entries(data.byCategory)) {
            if (amt > topCategoryAmount) {
                topCategoryAmount = amt;
                topCategory = cat;
            }
        }
    }

    const topCatEl = document.evaluate("//h2[contains(., '$1,800.00')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (topCatEl) topCatEl.textContent = `$${topCategoryAmount.toFixed(2)}`;
    
    const topCatBadge = document.evaluate("//span[contains(., 'Housing')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (topCatBadge) topCatBadge.textContent = topCategory;

    // Remaining Budget (Assuming $5000 budget for now)
    const remainingEl = document.evaluate("//h2[contains(., '$750.00')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (remainingEl) remainingEl.textContent = `$${Math.max(0, 5000 - data.totalAmount).toFixed(2)}`;
}

function updateRecentTransactions(expenses) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = ''; // clear exiting hardcoded

    const recent = expenses.slice(0, 5); // Take top 5

    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center">No recent expenses</td></tr>';
        return;
    }

    recent.forEach(exp => {
        const dateStr = new Date(exp.date).toLocaleDateString();
        
        let colorClass = 'bg-slate-100 text-slate-700'; // Default
        if (exp.category === 'Food') colorClass = 'bg-green-100 text-green-700';
        else if (exp.category === 'Transport') colorClass = 'bg-blue-100 text-blue-700';
        else if (exp.category === 'Entertainment') colorClass = 'bg-purple-100 text-purple-700';
        else if (exp.category === 'Shopping') colorClass = 'bg-amber-100 text-amber-700';

        const row = document.createElement('tr');
        row.className = 'hover:bg-slate-50/50 transition-colors';
        row.innerHTML = `
            <td class="px-6 py-4 text-sm text-slate-600">${dateStr}</td>
            <td class="px-6 py-4 font-medium">${exp.description}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-medium ${colorClass} rounded-full">${exp.category}</span>
            </td>
            <td class="px-6 py-4 text-sm text-right font-bold text-slate-900">$${exp.amount.toFixed(2)}</td>
            <td class="px-6 py-4 text-center">
                <span class="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Global chart instance
let expenseChartInstance = null;

function updateChart(data) {
    if (!window.Chart) return;
    
    // Simplistic breakdown for the chart, using categories instead of months 
    // since we only have aggregate data right now
    
    const labels = Object.keys(data.byCategory || {});
    const values = Object.values(data.byCategory || {});

    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    if (expenseChartInstance) {
        expenseChartInstance.destroy(); // destroy old chart
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 1)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0.2)');

    expenseChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels.length ? labels : ['No Data'],
          datasets: [{
            label: 'Expenses ($)',
            data: values.length ? values : [0],
            backgroundColor: gradient,
            borderRadius: 8,
            borderSkipped: false,
            barThickness: 32,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true }
          }
        }
    });
}

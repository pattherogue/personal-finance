class BudgetService {
    static analyzeSpendingAndSavings(transactions, budgets) {
      const analysis = {
        recommendations: [],
        savingsGoalProgress: 0,
        debtRepaymentPlan: [],
        budgetStatus: {}
      };
  
      // Calculate total income and expenses
      const totals = transactions.reduce((acc, t) => {
        if (t.type === 'income') acc.income += t.amount;
        else acc.expenses += t.amount;
        return acc;
      }, { income: 0, expenses: 0 });
  
      // Calculate disposable income
      const disposableIncome = totals.income - totals.expenses;
  
      // Analyze each budget category
      budgets.forEach(budget => {
        const categoryTransactions = transactions.filter(t => 
          t.category === budget.category && t.type === 'expense'
        );
        
        const totalSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
        const remainingBudget = budget.amount - totalSpent;
        
        analysis.budgetStatus[budget.category] = {
          budgeted: budget.amount,
          spent: totalSpent,
          remaining: remainingBudget,
          percentageUsed: (totalSpent / budget.amount) * 100
        };
  
        // Generate category-specific recommendations
        if (totalSpent > budget.amount) {
          analysis.recommendations.push({
            type: 'warning',
            category: budget.category,
            message: `Over budget in ${budget.category} by $${(totalSpent - budget.amount).toFixed(2)}`,
            action: 'Reduce spending in this category'
          });
        }
      });
  
      // Savings recommendations
      if (disposableIncome > 0) {
        const recommendedSavings = this.calculateRecommendedSavings(disposableIncome, totals.income);
        analysis.recommendations.push({
          type: 'savings',
          message: `Consider saving $${recommendedSavings.toFixed(2)} this month`,
          detail: 'Based on your disposable income',
          priority: 'high'
        });
      }
  
      // Debt repayment strategy
      const debtRepaymentPlan = this.createDebtRepaymentPlan(budgets, disposableIncome);
      analysis.debtRepaymentPlan = debtRepaymentPlan;
  
      return analysis;
    }
  
    static calculateRecommendedSavings(disposableIncome, totalIncome) {
      // Recommended savings based on 50/30/20 rule
      const idealSavingsRate = 0.2; // 20% of income
      const minimumSavingsRate = 0.1; // 10% of income
      
      const idealSavings = totalIncome * idealSavingsRate;
      const minimumSavings = totalIncome * minimumSavingsRate;
      
      // If can save ideal amount
      if (disposableIncome >= idealSavings) {
        return idealSavings;
      }
      // If can save minimum amount
      else if (disposableIncome >= minimumSavings) {
        return minimumSavings;
      }
      // If can't save minimum, save what's possible
      else {
        return Math.max(0, disposableIncome * 0.5); // Save 50% of disposable income
      }
    }
  
    static createDebtRepaymentPlan(budgets, disposableIncome) {
      const debtCategories = budgets
        .filter(b => b.debtRepayment.minimumPayment > 0)
        .sort((a, b) => {
          // Sort by priority and minimum payment
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.debtRepayment.priority] - priorityOrder[a.debtRepayment.priority];
        });
  
      let remainingIncome = disposableIncome;
      const plan = [];
  
      // First, allocate minimum payments
      debtCategories.forEach(debt => {
        const minimumPayment = debt.debtRepayment.minimumPayment;
        remainingIncome -= minimumPayment;
        
        plan.push({
          category: debt.category,
          minimumPayment,
          additionalPayment: 0,
          priority: debt.debtRepayment.priority
        });
      });
  
      // Then, allocate additional payments based on priority
      if (remainingIncome > 0) {
        for (let debt of plan) {
          if (debt.priority === 'high') {
            const additional = Math.min(remainingIncome, debt.minimumPayment);
            debt.additionalPayment = additional;
            remainingIncome -= additional;
          }
        }
      }
  
      return plan;
    }
  }
  
  module.exports = BudgetService;
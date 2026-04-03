import Category from '../models/Category';

const defaultCategories = [
  // Expense categories
  { name: 'Food & Dining', type: 'expense' as const, icon: '🍔', color: '#ef4444', isDefault: true },
  { name: 'Transportation', type: 'expense' as const, icon: '🚗', color: '#f97316', isDefault: true },
  { name: 'Shopping', type: 'expense' as const, icon: '🛍️', color: '#eab308', isDefault: true },
  { name: 'Bills & Utilities', type: 'expense' as const, icon: '💡', color: '#22c55e', isDefault: true },
  { name: 'Entertainment', type: 'expense' as const, icon: '🎬', color: '#3b82f6', isDefault: true },
  { name: 'Healthcare', type: 'expense' as const, icon: '🏥', color: '#ec4899', isDefault: true },
  { name: 'Education', type: 'expense' as const, icon: '📚', color: '#8b5cf6', isDefault: true },
  { name: 'Travel', type: 'expense' as const, icon: '✈️', color: '#06b6d4', isDefault: true },
  { name: 'Groceries', type: 'expense' as const, icon: '🛒', color: '#84cc16', isDefault: true },
  { name: 'Rent', type: 'expense' as const, icon: '🏠', color: '#f59e0b', isDefault: true },
  { name: 'Insurance', type: 'expense' as const, icon: '🛡️', color: '#6366f1', isDefault: true },
  { name: 'Other', type: 'expense' as const, icon: '📦', color: '#78716c', isDefault: true },
  // Income categories
  { name: 'Salary', type: 'income' as const, icon: '💰', color: '#22c55e', isDefault: true },
  { name: 'Freelance', type: 'income' as const, icon: '💻', color: '#3b82f6', isDefault: true },
  { name: 'Investment', type: 'income' as const, icon: '📈', color: '#8b5cf6', isDefault: true },
  { name: 'Business', type: 'income' as const, icon: '🏢', color: '#f97316', isDefault: true },
  { name: 'Rental Income', type: 'income' as const, icon: '🏘️', color: '#06b6d4', isDefault: true },
  { name: 'Other Income', type: 'income' as const, icon: '💵', color: '#78716c', isDefault: true },
];

export const seedDefaultCategories = async (): Promise<void> => {
  try {
    const existingDefaults = await Category.countDocuments({ isDefault: true });
    if (existingDefaults === 0) {
      await Category.insertMany(defaultCategories);
      console.log('✅ Default categories seeded');
    }
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  }
};

import { Response } from 'express';
import mongoose from 'mongoose';
import Expense from '../models/Expense';
import Income from '../models/Income';
import { AuthRequest } from '../types';

export const getDashboard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);

    // Get current month range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Total income and expenses (all time)
    const [totalIncomeResult, totalExpenseResult] = await Promise.all([
      Income.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalIncome = totalIncomeResult[0]?.total || 0;
    const totalExpenses = totalExpenseResult[0]?.total || 0;

    // Current month income and expenses
    const [monthlyIncomeResult, monthlyExpenseResult] = await Promise.all([
      Income.aggregate([
        {
          $match: {
            userId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        {
          $match: {
            userId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const monthlyIncome = monthlyIncomeResult[0]?.total || 0;
    const monthlyExpenses = monthlyExpenseResult[0]?.total || 0;

    // Monthly expenses trend (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyTrend = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Monthly income trend (last 6 months)
    const monthlyIncomeTrend = await Income.aggregate([
      {
        $match: {
          userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Category-wise expense breakdown
    const categoryBreakdown = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Recent transactions (last 5 expenses + 5 incomes)
    const [recentExpenses, recentIncomes] = await Promise.all([
      Expense.find({ userId: req.userId })
        .sort({ date: -1 })
        .limit(5)
        .lean(),
      Income.find({ userId: req.userId })
        .sort({ date: -1 })
        .limit(5)
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses,
          monthlyIncome,
          monthlyExpenses,
          monthlySavings: monthlyIncome - monthlyExpenses,
        },
        monthlyTrend: monthlyTrend.map((item) => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          expenses: item.total,
          count: item.count,
        })),
        monthlyIncomeTrend: monthlyIncomeTrend.map((item) => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          income: item.total,
          count: item.count,
        })),
        categoryBreakdown: categoryBreakdown.map((item) => ({
          category: item._id,
          total: item.total,
          count: item.count,
        })),
        recentExpenses,
        recentIncomes,
      },
    });
  } catch (error) {
    throw error;
  }
};

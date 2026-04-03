import { Response } from 'express';
import Expense from '../models/Expense';
import { expenseSchema } from '../validators';
import { AuthRequest, PaginationQuery } from '../types';

export const getExpenses = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      search,
      category,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query as PaginationQuery;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const filter: Record<string, unknown> = { userId: req.userId };

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (category) {
      filter.category = category;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) (filter.date as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) (filter.date as Record<string, unknown>).$lte = new Date(endDate);
    }

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Expense.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!expense) {
      res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
      return;
    }

    res.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    throw error;
  }
};

export const createExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validated = expenseSchema.parse(req.body);

    const expense = await Expense.create({
      ...validated,
      userId: req.userId,
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense,
    });
  } catch (error) {
    throw error;
  }
};

export const updateExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validated = expenseSchema.parse(req.body);

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      validated,
      { new: true, runValidators: true }
    );

    if (!expense) {
      res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteExpense = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!expense) {
      res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};

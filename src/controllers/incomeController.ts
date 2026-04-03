import { Response } from 'express';
import Income from '../models/Income';
import { incomeSchema } from '../validators';
import { AuthRequest, PaginationQuery } from '../types';

export const getIncomes = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      search,
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

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) (filter.date as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) (filter.date as Record<string, unknown>).$lte = new Date(endDate);
    }

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [incomes, total] = await Promise.all([
      Income.find(filter)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Income.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        incomes,
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

export const getIncome = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const income = await Income.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!income) {
      res.status(404).json({
        success: false,
        message: 'Income not found',
      });
      return;
    }

    res.json({
      success: true,
      data: income,
    });
  } catch (error) {
    throw error;
  }
};

export const createIncome = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validated = incomeSchema.parse(req.body);

    const income = await Income.create({
      ...validated,
      userId: req.userId,
    });

    res.status(201).json({
      success: true,
      message: 'Income created successfully',
      data: income,
    });
  } catch (error) {
    throw error;
  }
};

export const updateIncome = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validated = incomeSchema.parse(req.body);

    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      validated,
      { new: true, runValidators: true }
    );

    if (!income) {
      res.status(404).json({
        success: false,
        message: 'Income not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Income updated successfully',
      data: income,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteIncome = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!income) {
      res.status(404).json({
        success: false,
        message: 'Income not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Income deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};

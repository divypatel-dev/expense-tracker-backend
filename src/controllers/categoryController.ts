import { Response } from 'express';
import Category from '../models/Category';
import { categorySchema } from '../validators';
import { AuthRequest } from '../types';

export const getCategories = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { type } = req.query;

    const filter: Record<string, unknown> = {
      $or: [{ isDefault: true }, { userId: req.userId }],
    };

    if (type) {
      filter.type = type;
    }

    const categories = await Category.find(filter).sort({ name: 1 }).lean();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    throw error;
  }
};

export const createCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const validated = categorySchema.parse(req.body);

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${validated.name}$`, 'i') },
      $or: [{ isDefault: true }, { userId: req.userId }],
    });

    if (existingCategory) {
      res.status(409).json({
        success: false,
        message: 'A category with this name already exists',
      });
      return;
    }

    const category = await Category.create({
      ...validated,
      userId: req.userId,
      isDefault: false,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.userId,
      isDefault: false,
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found or cannot be deleted',
      });
      return;
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};

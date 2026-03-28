const Category = require("../models/Category");

exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await Category.create({
      name,
      createdBy: req.user.id
    });

    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().populate("createdBy", "name email");
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Update Category Error:", error);
    next(error);
  }
};
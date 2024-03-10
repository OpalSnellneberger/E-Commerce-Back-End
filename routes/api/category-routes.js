const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  try{
  // find all categories
  // be sure to include its associated Products
  const categories = await Category.findAll({
    attributes: 
      ["id", "category_name"],
      include: [{
      model: Product, 
  }],
    });
    res.json(categories);
  }
  catch (err) {
      res.json(err)
    }
    });

router.get('/:id', async(req, res) => {
  try {
  // find one category by its `id` value
  // be sure to include its associated Products
  const category_name = await Category.findByPk(req.params.id);
  res.json(category_name);
  } catch (err) {
    res.json(err)
  }
});

router.post('/', async(req, res) => {
  try{
  // create a new category
  const newCategory = await Category.create(req.body);
  res.status(200).json(newCategory);
  }
  catch (err) {
    if (err.name === 'SequelizeValidationError') {
      // Handle validation errors
      const validationErrors = err.errors.map(error => ({
        field: error.path,
        message: error.message,
      }));
      return res.status(400).json({ error: 'Validation error', details: validationErrors });
    }
    res.status(500).json({ error: err.message });
  }
});


router.put('/:id', async(req, res) => {
  try{
     // Find the current category by its `id` value
    const currentCategory = await Category.findByPk(req.params.id);
    //check if category exists
    if (!currentCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    // Check if the requested changes are different from the current values
    const areChanges = Object.keys(req.body).some((key) => {
      return req.body[key] !== currentCategory[key];
    });

    if (!areChanges) {
      return res.json({ message: 'No changes applied' });
    }

  // update a category by its `id` value
    const updatedCategory = await Category.update(req.body, {
    where: {
      id: req.params.id,
    },
  });
  if (updatedCategory[0] === 1) {
    res.json({ message: 'Category updated successfully' });
  } else {
    res.json({ message: 'No changes applied' });
  }
} catch (err) {
  res.status(500).json({ error: err.message });
}
});

router.delete('/:id', async(req, res) => {
  try{
    // Find products associated with the category
    const associatedProducts = await Product.findAll({
      where: {
        category_id: req.params.id,
      },
    });
  // delete a category by its `id` value
    const rmCategory = await Category.destroy({
    where: {
      id: req.params.id,
    },
  });
  if (rmCategory === 1) {
    res.json({ message: 'The Category has been removed' });
  } else {
    res.json({ message: 'Tag not found' });
  }
  } catch (err) {
  res.status(500).json({ error: err.message });
  }
  }); 

module.exports = router;
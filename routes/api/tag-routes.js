const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');
const { tableName } = require('../../models/Category');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    // find all tags
    // be sure to include its associated Product data
    const parsedTagData = await Tag.findAll({
      attributes: ["id", "tag_name"],
      include: [{
        model: Product,
        attributes: ["id", "product_name", "price", "category_id"],
        through: "ProductTag",
      }],
    });
  res.json(parsedTagData);
}
    catch (err) {
  res.json(err)
}
});

router.get('/:id', async (req, res) => {
  try {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  const tag_name = await Tag.findByPk(req.params.id);
    res.json(tag_name);
  }
    catch (err) {
      res.json(err)
    }
  });

router.post('/', async (req, res) => {
  try{
  // create a new tag
  const tag = await Tag.create({ tag_name: req.body.tag_name });
      res.json(tag);
    }
    catch(err) {
      res.json(err);
    }
  });

router.put('/:id', async (req, res) => {
  try{
  // update a tag's name by its `id` value
  const updatedTag = await Tag.update({ tag_name: req.body.tag_name },
    {
      where: {
        id: req.params.id,
      }
    });
    if (updatedTag[0] === 1) {
      res.json({ message: 'Tag updated successfully' });
    } else {
      res.json({ message: 'No changes applied' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async(req, res) => {
  try{
  // delete on tag by its `id` value
  const rmTag = await Tag.destroy({
    where: {
      id: req.params.id,
    }
  });
  if (rmTag === 1) {
    res.json({ message: 'The tag has been removed' });
  } else {
    res.json({ message: 'Tag not found' });
  }
  } catch (err) {
  res.status(500).json({ error: err.message });
  }
  }); 

module.exports = router;
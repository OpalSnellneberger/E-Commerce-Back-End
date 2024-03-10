const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint 

// get all products
router.get('/', async(req, res) => {
  try{
  // find all products
  // be sure to include its associated Category and Tag data
  const productData = await Product.findAll({
    attributes: [
      "id", "product_name", "price", "stock","category_id"
    ],
    include:[
      {
        model: Tag,
        attributes: ["id", "tag_name"],
        through: "ProductTag",
      },
      {
        model: Category,
        attributes: ["id", "category_name"]
      },
    ],
  });
  res.json(productData);
}
    catch (err) {
  res.json(err)
}
});

// get one product
router.get('/:id', async(req, res) => {
  try{
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
 const productId =  await Product.findByPk(req.params.id, {
    include: [{
      model: Tag,
      attributes: ["id", "tag_name"],
      through: "ProductTag",
    },
    {
      model: Category,
      attributes: ["id", "category_name"]
    },
    ],
  });
  res.json(productId);
  }
    catch (err) {
      res.json(err)
    }
  });

// create new product
router.post('/', async(req, res) => {
  try{
    const product = await Product.create({ 
      product_name: "Basketball",
      price: 50.00,
      stock: 3,
      tagIds: req.body.tagIds || [],
     });
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
    if (req.body.tagIds && req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
         return{
            product_id: product.id,
            tag_id,
          };
        });
        await ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    }
    catch(err){
      console.log(err);
      res.status(400).json(err);
    }});


// update product
router.put('/:id', async(req, res) => {
  try{
      // Check if the category with the given id exists
    const existingCategory = await Category.findByPk(req.body.tagIds);

      if (!existingCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }
  // update product data
    const [updatedProduct] = await Product.update(req.body, {
    where: {
      // tagIds: req.body.tagIds || [],
      id: req.params.id,
    },
  })
  if (updatedProduct[0] === 1) {
    const productTags = await ProductTag.findAll({
          where: { product_id: req.params.id },
        });
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => ({
              product_id: req.params.id,
              tag_id,
            }));

            // figure out which ones to remove
          const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
                  // run both actions
          await Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
          const updatedProduct = await Product.findByPk(req.params.id);
          return res.json(updatedProduct);
    }}
    catch(err) {
      // console.log(err);
      res.status(400).json(err);
    };
  });


router.delete('/:id', async(req, res) => {
  try{
  // delete one product by its `id` value
  const deleteProduct = await Product.findByPk(req.params.id);

  if (!deleteProduct) {
    return res.status(404).json({ message: 'The product is not found' });
  }

  const numRowsDeleted = await Product.destroy({
    where: {
      id: req.params.id,
    },
  });
  
  if (numRowsDeleted === 1) {
    res.json({message:' The product was deleted.'});
  } else{
    res.json({ message: 'Product Not removed,'});
  }
  } catch (err) {
  res.error(500).json({ error: err.message });
  }
  }); 

module.exports = router;
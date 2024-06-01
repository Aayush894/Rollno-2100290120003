const categoryController = async (req, res) => {
  const { categoryname } = req.params;
  const { top = 10, page = 1, sort, order, minPrice, maxPrice } = req.query;
  const limit = Math.min(parseInt(top, 10), 10);
  const offset = (page - 1) * limit;

  try {
    const companyNames = ['AMZ', 'EBY', 'WMT', 'TGT', 'BBY'];
    const productPromises = companyNames.map(company =>
      axios.get(`${PRODUCT_API_URL}/products/companies/${company}/categories/${categoryname}/products`, {
        params: { top, minPrice, maxPrice },
        timeout: TIMEOUT,
        headers: {
            Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
          }
      })
    );

    const productResponses = await Promise.all(productPromises);
    let products = productResponses.flatMap(response => response.data.products);

    if (minPrice) {
      products = products.filter(product => product.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      products = products.filter(product => product.price <= parseFloat(maxPrice));
    }

    if (sort) {
      products.sort((a, b) => {
        if (order === 'desc') {
          return b[sort] - a[sort];
        }
        return a[sort] - b[sort];
      });
    }
  
    const paginatedProducts = products.slice(offset, offset + limit);

   
    const response = paginatedProducts.map(product => {
      const uniqueId = uuidv4();
      productDetailsCache.set(uniqueId, product);
      return { ...product, id: uniqueId };
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

const productController = (req, res) => {
    const productId = req.params.productid;
    if (productDetailsCache.has(productId)) {
      res.json(productDetailsCache.get(productId));
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
};

export {
    categoryController,
    productController
}
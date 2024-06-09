import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const productDetailsCache = new Map();

const acceptedCompanies = ["AMZ", "FLP", "SNP", "MYN", "AZO"];
const acceptedCategories = ["Phone", "Computer", "TV", "Earphone", "Tablet", "Charger", "Mouse", "Keypad", "Bluetooth", "Pendrive", "Remote", "Speaker", "Headset", "Laptop", "PC"];

const categoryController = async (req, res) => {
  const { categoryname } = req.params;
  const { top = 10, page = 1, sort, order = 'asc', minPrice, maxPrice } = req.query;
  const limit = Math.min(parseInt(top, 10), 10);
  const offset = (page - 1) * limit;

  if (!acceptedCategories.includes(categoryname)) {
    return res.status(400).json({ error: "Invalid category name" });
  }

  if (sort && !['rating', 'price', 'company', 'discount'].includes(sort)) {
    return res.status(400).json({ error: "Invalid sort parameter" });
  }

  if (order && !['asc', 'desc'].includes(order)) {
    return res.status(400).json({ error: "Invalid order parameter" });
  }

  try {
    const companyNames = acceptedCompanies;
    const productPromises = companyNames.map(company =>
      axios.get(`${PRODUCT_API_URL}/test/companies/${company}/categories/${categoryname}/products`, {
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
          if (typeof a[sort] === 'string') {
            return b[sort].localeCompare(a[sort]);
          }
          return b[sort] - a[sort];
        } else {
          if (typeof a[sort] === 'string') {
            return a[sort].localeCompare(b[sort]);
          }
          return a[sort] - b[sort];
        }
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
};

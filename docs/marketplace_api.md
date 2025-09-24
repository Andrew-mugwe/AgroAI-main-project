// Flow14.1.1

# Marketplace Public API

## List products
GET `/api/marketplace/products`
Query params: `page, limit, category, q, min_price, max_price, seller_id, sort`
Response: `{ items: Product[], meta: { page, limit, total } }`

## Get product
GET `/api/marketplace/products/:id`

## Categories
GET `/api/marketplace/categories`

## Orders (alias of existing orders)
POST `/api/marketplace/orders`
GET `/api/marketplace/orders`
GET `/api/marketplace/orders/:id`



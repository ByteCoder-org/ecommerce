
import { ShoppingCart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  inventoryCount: number;
  imageUrl?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
  isAuthenticated: boolean;
}

export const ProductCard = ({ product, onAddToCart, isAuthenticated }: ProductCardProps) => {
  const isOutOfStock = product.inventoryCount === 0;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Package className="h-16 w-16 text-gray-400" />
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="mb-2">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <span className={`text-sm ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
            {isOutOfStock ? 'Out of Stock' : `${product.inventoryCount} in stock`}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={() => onAddToCart(product.id)}
          disabled={isOutOfStock || !isAuthenticated}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {!isAuthenticated ? 'Login to Add' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
};

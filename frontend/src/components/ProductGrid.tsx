
import { ProductCard } from './ProductCard';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  inventoryCount: number;
  imageUrl?: string;
}

interface ProductGridProps {
  products: Product[];
  onAddToCart: (productId: number) => void;
  isAuthenticated: boolean;
}

export const ProductGrid = ({ products, onAddToCart, isAuthenticated }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No products available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
};

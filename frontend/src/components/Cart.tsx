import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CartItem {
  productId: string;
  quantity: number;
  addedAt?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
}

interface CartProps {
  items: Record<string, CartItem>;
  products: Product[];
  onClose: () => void;
  onUpdateCart: () => void;
  onRemoveFromCart: (productId: string) => Promise<void>;
  onUpdateQuantity: (productId: string, quantity: number) => Promise<void>;
  authToken: string;
}

export const Cart = ({ items, products, onClose, onUpdateCart, onRemoveFromCart, onUpdateQuantity, authToken }: CartProps) => {
  const cartItems = Object.entries(items).map(([productId, item]) => {
    const product = products.find(p => p.id.toString() === productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean);

  const total = cartItems.reduce((sum, item) => {
    return sum + (item?.product.price || 0) * item.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle>Shopping Cart</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-96">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-600 py-8">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover rounded" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded"></div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product.name}</h4>
                    <p className="text-gray-600 text-sm">${item.product.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={async () => {
                        try {
                          const newQuantity = item.quantity - 1;
                          if (newQuantity <= 0) {
                            await onRemoveFromCart(item.productId);
                          } else {
                            await onUpdateQuantity(item.productId, newQuantity);
                          }
                          await onUpdateCart();
                        } catch (error) {
                          console.error('Error decreasing item quantity:', error);
                        }
                      }}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={async () => {
                        try {
                          await onUpdateQuantity(item.productId, item.quantity + 1);
                          await onUpdateCart();
                        } catch (error) {
                          console.error('Error increasing item quantity:', error);
                        }
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600"
                      onClick={async () => {
                        try {
                          await onRemoveFromCart(item.productId);
                          await onUpdateCart();
                        } catch (error) {
                          console.error('Error removing item from cart:', error);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        
        {cartItems.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Total: ${total.toFixed(2)}</span>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Proceed to Checkout
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

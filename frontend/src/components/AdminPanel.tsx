import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProductService } from '@/services/ProductService';

interface AdminPanelProps {
  onClose: () => void;
  onProductCreated: () => void;
  authToken: string;
}

export const AdminPanel = ({ onClose, onProductCreated, authToken: initialAuthToken }: AdminPanelProps) => {
  const [authToken, setAuthToken] = useState(initialAuthToken);

  useEffect(() => {
    if (!authToken) {
      console.warn('AdminPanel: authToken is missing, attempting to fetch a valid token');
      const storedToken = document.cookie.split('; ').find(row => row.startsWith('access_token='))?.split('=')[1];
      if (storedToken) {
        console.log('AdminPanel: Retrieved token from cookies');
        setAuthToken(storedToken);
      } else {
        console.error('AdminPanel: No valid token found, cannot proceed');
      }
    } else {
      console.log('AdminPanel: authToken received', authToken);
    }
  }, [authToken]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    inventoryCount: ''
  });
  const [loading, setLoading] = useState(false);
  const productService = new ProductService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await productService.createProduct({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        inventoryCount: parseInt(formData.inventoryCount)
      }, authToken);

      console.log('✅ Product created successfully');
      onProductCreated();
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        inventoryCount: ''
      });
    } catch (error) {
      console.error('❌ Error creating product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="inventoryCount">Inventory Count</Label>
              <Input
                id="inventoryCount"
                type="number"
                value={formData.inventoryCount}
                onChange={(e) => setFormData({ ...formData, inventoryCount: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={loading}>Create</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

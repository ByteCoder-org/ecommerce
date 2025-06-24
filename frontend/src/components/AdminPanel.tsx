import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProductService } from '@/services/ProductService';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
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

      toast({
        title: "Success",
        description: "Product created successfully",
      });

      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        inventoryCount: ''
      });

      onProductCreated();
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Add New Product
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="inventory">Inventory Count</Label>
              <Input
                id="inventory"
                type="number"
                value={formData.inventoryCount}
                onChange={(e) => handleChange('inventoryCount', e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

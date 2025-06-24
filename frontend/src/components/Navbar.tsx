
import { ShoppingCart, User, Settings, LogOut, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  cartItemCount: number;
  onLogin: () => void;
  onLogout: () => void;
  onShowCart: () => void;
  onShowAdmin: () => void;
}

export const Navbar = ({
  isAuthenticated,
  isAdmin,
  cartItemCount,
  onLogin,
  onLogout,
  onShowCart,
  onShowAdmin
}: NavbarProps) => {
  console.log('🧭 Navbar rendering with props:');
  console.log('  - isAuthenticated:', isAuthenticated);
  console.log('  - isAdmin:', isAdmin);
  console.log('  - cartItemCount:', cartItemCount);

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">ShopHub</h1>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('🛒 Navbar: Cart button clicked');
                    onShowCart();
                  }}
                  className="relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => {
                        console.log('🛡️ Navbar: Admin panel menu item clicked');
                        console.log('🛡️ Navbar: Current isAdmin state:', isAdmin);
                        onShowAdmin();
                      }}>
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => {
                      console.log('🚪 Navbar: Logout menu item clicked');
                      onLogout();
                    }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => {
                console.log('🔑 Navbar: Login button clicked');
                onLogin();
              }} size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

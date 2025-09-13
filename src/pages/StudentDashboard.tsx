import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { menuApi, ordersApi } from '../services/mockApi';
import { MenuItem, CartItem, Order } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Coffee, Plus, Minus, ShoppingCart, LogOut, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    mobile: ''
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [menuData, ordersData] = await Promise.all([
        menuApi.getAll(),
        ordersApi.getByStudentId(user?.id || '')
      ]);
      setMenuItems(menuData.filter(item => item.available));
      setOrders(ordersData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.menuItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.menuItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.menuItem.id !== itemId));
    } else {
      setCart(prev => prev.map(item =>
        item.menuItem.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (!customerDetails.name.trim() || !customerDetails.mobile.trim()) {
      toast({
        title: "Missing Details",
        description: "Please enter your name and mobile number",
        variant: "destructive"
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart first",
        variant: "destructive"
      });
      return;
    }

    try {
      const orderItems = cart.map(item => ({
        menuItem: item.menuItem,
        quantity: item.quantity,
        subtotal: item.menuItem.price * item.quantity
      }));

      await ordersApi.create({
        studentId: user?.id || '',
        studentName: customerDetails.name,
        studentMobile: customerDetails.mobile,
        items: orderItems,
        total: getCartTotal()
      });

      setCart([]);
      setCustomerDetails({ name: '', mobile: '' });
      setIsCartOpen(false);
      loadData();

      toast({
        title: "Order Placed!",
        description: "Your order has been placed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive"
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      coffee: 'bg-cafe-dark',
      tea: 'bg-cafe-medium',
      snacks: 'bg-cafe-orange',
      meals: 'bg-cafe-espresso'
    };
    return colors[category as keyof typeof colors] || 'bg-cafe-dark';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-500',
      preparing: 'bg-blue-500',
      ready: 'bg-green-500',
      completed: 'bg-gray-500',
      cancelled: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cafe-cream flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-12 h-12 animate-spin text-cafe-dark mx-auto mb-4" />
          <p className="text-cafe-medium">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cafe-cream">
      {/* Header */}
      <header className="bg-gradient-hero shadow-medium">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coffee className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white">Cafe Menu</h1>
              <p className="text-white/80 text-sm">Welcome, {user?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <ShoppingCart className="w-5 h-5" />
                  {getCartItemCount() > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-cafe-orange text-white text-xs">
                      {getCartItemCount()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Your Cart</SheetTitle>
                  <SheetDescription>Review your order before checkout</SheetDescription>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
                  ) : (
                    <>
                      {cart.map((item) => (
                        <div key={item.menuItem.id} className="flex items-center gap-3 p-3 bg-cafe-latte rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.menuItem.name}</h4>
                            <p className="text-sm text-muted-foreground">₹{item.menuItem.price}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(item.menuItem.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(item.menuItem.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="customer-name">Your Name</Label>
                          <Input
                            id="customer-name"
                            value={customerDetails.name}
                            onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter your full name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="customer-mobile">Mobile Number</Label>
                          <Input
                            id="customer-mobile"
                            value={customerDetails.mobile}
                            onChange={(e) => setCustomerDetails(prev => ({ ...prev, mobile: e.target.value }))}
                            placeholder="Enter your mobile number"
                            type="tel"
                          />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span>₹{getCartTotal()}</span>
                      </div>
                      
                      <Button 
                        onClick={handlePlaceOrder}
                        className="w-full bg-gradient-hero text-white"
                        size="lg"
                      >
                        Place Order
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            
            <Button 
              onClick={logout}
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {menuItems.map((item) => (
            <Card key={item.id} className="overflow-hidden shadow-soft hover:shadow-medium transition-smooth">
              <div className="aspect-video bg-cafe-latte relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23D2B48C"/><text x="100" y="75" text-anchor="middle" fill="%238B4513" font-size="16">🍽️</text></svg>';
                  }}
                />
                <Badge className={`absolute top-2 right-2 ${getCategoryColor(item.category)} text-white`}>
                  {item.category}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-cafe-espresso">{item.name}</h3>
                  <p className="text-sm text-cafe-medium">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-cafe-dark">₹{item.price}</span>
                    <Button 
                      onClick={() => addToCart(item)}
                      size="sm"
                      className="bg-gradient-coffee text-white hover:opacity-90"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order History */}
        {orders.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-cafe-espresso">Your Orders</h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="shadow-soft">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {order.status === 'ready' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {order.status === 'preparing' && <Clock className="w-3 h-3 mr-1" />}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription>{new Date(order.createdAt).toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.menuItem.name} x{item.quantity}</span>
                          <span>₹{item.subtotal}</span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>₹{order.total}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
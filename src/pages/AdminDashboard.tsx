import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { menuApi, ordersApi } from '../services/mockApi';
import { MenuItem, Order } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Coffee, LogOut, Plus, Edit, Trash2, Users, ShoppingBag, Clock, CheckCircle2, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'coffee' as MenuItem['category'],
    available: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, menuData] = await Promise.all([
        ordersApi.getAll(),
        menuApi.getAll()
      ]);
      setOrders(ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setMenuItems(menuData);
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

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await ordersApi.updateStatus(orderId, status);
      loadData();
      toast({
        title: "Status Updated",
        description: `Order ${status === 'completed' ? 'completed' : 'status changed'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const handleAddItem = async () => {
    try {
      if (!newItem.name || !newItem.price) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      await menuApi.create({
        ...newItem,
        price: parseFloat(newItem.price),
        image: '/api/placeholder/200/150'
      });
      
      setNewItem({
        name: '',
        description: '',
        price: '',
        category: 'coffee',
        available: true
      });
      setIsAddingItem(false);
      loadData();
      
      toast({
        title: "Item Added",
        description: "Menu item has been added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add menu item",
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await menuApi.delete(itemId);
      loadData();
      toast({
        title: "Item Deleted",
        description: "Menu item has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive"
      });
    }
  };

  const toggleItemAvailability = async (item: MenuItem) => {
    try {
      await menuApi.update(item.id, { available: !item.available });
      loadData();
      toast({
        title: "Availability Updated",
        description: `${item.name} is now ${item.available ? 'unavailable' : 'available'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item availability",
        variant: "destructive"
      });
    }
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

  const getCategoryColor = (category: string) => {
    const colors = {
      coffee: 'bg-cafe-dark',
      tea: 'bg-cafe-medium',
      snacks: 'bg-cafe-orange',
      meals: 'bg-cafe-espresso'
    };
    return colors[category as keyof typeof colors] || 'bg-cafe-dark';
  };

  const getOrderStats = () => {
    const pending = orders.filter(o => o.status === 'pending').length;
    const preparing = orders.filter(o => o.status === 'preparing').length;
    const ready = orders.filter(o => o.status === 'ready').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    
    return { pending, preparing, ready, completed };
  };

  const stats = getOrderStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cafe-cream flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-12 h-12 animate-spin text-cafe-dark mx-auto mb-4" />
          <p className="text-cafe-medium">Loading dashboard...</p>
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
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-white/80 text-sm">Welcome back, {user?.name}</p>
            </div>
          </div>
          
          <Button 
            onClick={logout}
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Preparing</p>
                  <p className="text-2xl font-bold">{stats.preparing}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ready</p>
                  <p className="text-2xl font-bold">{stats.ready}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="space-y-4">
            <div className="space-y-4">
              {orders.length === 0 ? (
                <Card className="shadow-soft">
                  <CardContent className="p-8 text-center">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders yet</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="shadow-soft">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                          <CardDescription>
                            {order.studentName} • {order.studentMobile} • {new Date(order.createdAt).toLocaleString()}
                          </CardDescription>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.menuItem.name} x{item.quantity}</span>
                            <span>₹{item.subtotal}</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-medium text-base border-t pt-2">
                          <span>Total</span>
                          <span>₹{order.total}</span>
                        </div>
                      </div>
                      
                      {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <div className="flex gap-2 pt-2">
                          {order.status === 'pending' && (
                            <Button 
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              Start Preparing
                            </Button>
                          )}
                          {order.status === 'preparing' && (
                            <Button 
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              Mark Ready
                            </Button>
                          )}
                          {order.status === 'ready' && (
                            <Button 
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              size="sm"
                              className="bg-gray-500 hover:bg-gray-600 text-white"
                            >
                              Mark Completed
                            </Button>
                          )}
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            size="sm"
                            variant="destructive"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="menu" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-cafe-espresso">Menu Items</h2>
              <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-hero text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Menu Item</DialogTitle>
                    <DialogDescription>Fill in the details for the new menu item</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="item-name">Name</Label>
                      <Input
                        id="item-name"
                        value={newItem.name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter item name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="item-description">Description</Label>
                      <Textarea
                        id="item-description"
                        value={newItem.description}
                        onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter item description"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="item-price">Price (₹)</Label>
                        <Input
                          id="item-price"
                          type="number"
                          value={newItem.price}
                          onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="item-category">Category</Label>
                        <Select 
                          value={newItem.category} 
                          onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value as MenuItem['category'] }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="coffee">Coffee</SelectItem>
                            <SelectItem value="tea">Tea</SelectItem>
                            <SelectItem value="snacks">Snacks</SelectItem>
                            <SelectItem value="meals">Meals</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <Button onClick={handleAddItem} className="w-full bg-gradient-hero text-white">
                      Add Item
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <Card key={item.id} className={`shadow-soft ${!item.available ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-cafe-espresso">{item.name}</h3>
                          <p className="text-sm text-cafe-medium">{item.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`${getCategoryColor(item.category)} text-white text-xs`}>
                              {item.category}
                            </Badge>
                            <span className="text-lg font-bold text-cafe-dark">₹{item.price}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => toggleItemAvailability(item)}
                          size="sm"
                          variant={item.available ? "outline" : "default"}
                          className={item.available ? "" : "bg-green-500 hover:bg-green-600 text-white"}
                        >
                          {item.available ? "Disable" : "Enable"}
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{item.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
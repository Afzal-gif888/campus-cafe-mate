import { MenuItem, Order, OrderItem } from '../types';

// Mock data storage
const MENU_STORAGE_KEY = 'cafe_menu_items';
const ORDERS_STORAGE_KEY = 'cafe_orders';

// Initial menu items
const initialMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Cappuccino',
    description: 'Rich espresso with steamed milk and foam',
    price: 45,
    category: 'coffee',
    image: '/api/placeholder/200/150',
    available: true
  },
  {
    id: '2',
    name: 'Latte',
    description: 'Smooth espresso with steamed milk',
    price: 50,
    category: 'coffee',
    image: '/api/placeholder/200/150',
    available: true
  },
  {
    id: '3',
    name: 'Black Coffee',
    description: 'Pure coffee for the purists',
    price: 35,
    category: 'coffee',
    image: '/api/placeholder/200/150',
    available: true
  },
  {
    id: '4',
    name: 'Masala Tea',
    description: 'Traditional spiced tea',
    price: 20,
    category: 'tea',
    image: '/api/placeholder/200/150',
    available: true
  },
  {
    id: '5',
    name: 'Green Tea',
    description: 'Healthy and refreshing',
    price: 25,
    category: 'tea',
    image: '/api/placeholder/200/150',
    available: true
  },
  {
    id: '6',
    name: 'Samosa',
    description: 'Crispy vegetable samosa',
    price: 15,
    category: 'snacks',
    image: '/api/placeholder/200/150',
    available: true
  },
  {
    id: '7',
    name: 'Sandwich',
    description: 'Grilled veg sandwich',
    price: 40,
    category: 'snacks',
    image: '/api/placeholder/200/150',
    available: true
  },
  {
    id: '8',
    name: 'Biryani',
    description: 'Aromatic rice with vegetables',
    price: 80,
    category: 'meals',
    image: '/api/placeholder/200/150',
    available: true
  }
];

// Initialize storage if empty
const initializeStorage = () => {
  if (!localStorage.getItem(MENU_STORAGE_KEY)) {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(initialMenuItems));
  }
  if (!localStorage.getItem(ORDERS_STORAGE_KEY)) {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([]));
  }
};

// Menu API
export const menuApi = {
  async getAll(): Promise<MenuItem[]> {
    initializeStorage();
    const items = localStorage.getItem(MENU_STORAGE_KEY);
    return items ? JSON.parse(items) : [];
  },

  async create(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const items = await this.getAll();
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString()
    };
    items.push(newItem);
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
    return newItem;
  },

  async update(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const items = await this.getAll();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');
    
    items[index] = { ...items[index], ...updates };
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(items));
    return items[index];
  },

  async delete(id: string): Promise<void> {
    const items = await this.getAll();
    const filteredItems = items.filter(item => item.id !== id);
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(filteredItems));
  }
};

// Orders API
export const ordersApi = {
  async getAll(): Promise<Order[]> {
    initializeStorage();
    const orders = localStorage.getItem(ORDERS_STORAGE_KEY);
    return orders ? JSON.parse(orders) : [];
  },

  async getByStudentId(studentId: string): Promise<Order[]> {
    const orders = await this.getAll();
    return orders.filter(order => order.studentId === studentId);
  },

  async create(orderData: {
    studentId: string;
    studentName: string;
    studentMobile: string;
    items: OrderItem[];
    total: number;
  }): Promise<Order> {
    const orders = await this.getAll();
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    return newOrder;
  },

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const orders = await this.getAll();
    const index = orders.findIndex(order => order.id === id);
    if (index === -1) throw new Error('Order not found');
    
    orders[index] = {
      ...orders[index],
      status,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    return orders[index];
  }
};
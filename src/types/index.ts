export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'coffee' | 'tea' | 'snacks' | 'meals';
  image: string;
  available: boolean;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  studentId: string;
  studentName: string;
  studentMobile: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}
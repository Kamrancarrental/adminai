
export enum OrderStatus {
  PENDING = 'Pending',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: Array<{ productId: string; productName: string; quantity: number; price: number }>;
  status: OrderStatus;
  total: number;
  orderDate: string;
  shippingAddress: string;
}

export enum MessageType {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
}

export enum SenderType {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  AI = 'ai',
}

export interface Message {
  id: string;
  conversationId: string;
  customerId: string;
  sender: SenderType;
  type: MessageType;
  subject?: string; // For emails
  body: string;
  timestamp: string;
  attachments?: string[]; // URLs or base64
  aiDraft?: string; // AI generated draft for replies
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  messages: Message[];
}

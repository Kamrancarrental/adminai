
import { Customer, Order, OrderStatus, Product, Conversation, Message, MessageType, SenderType } from '../types';

// Mock Data - In a real application, these would come from an n8n workflow connected to a database
const MOCK_CUSTOMERS: Customer[] = [
  { id: 'C001', name: 'Alice Smith', email: 'alice@example.com', phone: '111-222-3333', address: '123 Main St', totalOrders: 5, totalSpent: 250.75 },
  { id: 'C002', name: 'Bob Johnson', email: 'bob@example.com', phone: '444-555-6666', address: '456 Oak Ave', totalOrders: 3, totalSpent: 120.00 },
  { id: 'C003', name: 'Charlie Brown', email: 'charlie@example.com', phone: '777-888-9999', address: '789 Pine Ln', totalOrders: 1, totalSpent: 50.00 },
];

const MOCK_PRODUCTS: Product[] = [
  { id: 'P001', name: 'Wireless Earbuds', description: 'High-quality wireless earbuds with noise cancellation.', price: 79.99, stock: 50, images: ['https://picsum.photos/id/1015/300/300'], category: 'Electronics' },
  { id: 'P002', name: 'Smartwatch Ultra', description: 'Advanced smartwatch with fitness tracking and notifications.', price: 199.99, stock: 20, images: ['https://picsum.photos/id/1025/300/300'], category: 'Wearables' },
  { id: 'P003', name: 'Portable Bluetooth Speaker', description: 'Compact speaker with powerful sound and long battery life.', price: 49.99, stock: 100, images: ['https://picsum.photos/id/1027/300/300'], category: 'Audio' },
  { id: 'P004', name: 'Ergonomic Office Chair', description: 'Comfortable chair designed for long working hours.', price: 249.99, stock: 15, images: ['https://picsum.photos/id/237/300/300'], category: 'Home Office' },
  { id: 'P005', name: '4K Smart TV 55"', description: 'Vibrant 4K display with smart features.', price: 599.99, stock: 8, images: ['https://picsum.photos/id/238/300/300'], category: 'Electronics' },
];

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD001', customerId: 'C001', customerName: 'Alice Smith',
    items: [{ productId: 'P001', productName: 'Wireless Earbuds', quantity: 1, price: 79.99 }],
    status: OrderStatus.DELIVERED, total: 79.99, orderDate: '2023-10-26T10:00:00Z', shippingAddress: '123 Main St',
  },
  {
    id: 'ORD002', customerId: 'C002', customerName: 'Bob Johnson',
    items: [{ productId: 'P002', productName: 'Smartwatch Ultra', quantity: 1, price: 199.99 }],
    status: OrderStatus.SHIPPED, total: 199.99, orderDate: '2023-10-27T11:30:00Z', shippingAddress: '456 Oak Ave',
  },
  {
    id: 'ORD003', customerId: 'C001', customerName: 'Alice Smith',
    items: [{ productId: 'P003', productName: 'Portable Bluetooth Speaker', quantity: 2, price: 49.99 }],
    status: OrderStatus.PENDING, total: 99.98, orderDate: '2023-10-28T14:15:00Z', shippingAddress: '123 Main St',
  },
  {
    id: 'ORD004', customerId: 'C003', customerName: 'Charlie Brown',
    items: [{ productId: 'P001', productName: 'Wireless Earbuds', quantity: 1, price: 79.99 }],
    status: OrderStatus.PENDING, total: 79.99, orderDate: '2023-10-29T09:00:00Z', shippingAddress: '789 Pine Ln',
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: 'M001', conversationId: 'CONV001', customerId: 'C001', sender: SenderType.CUSTOMER,
    type: MessageType.EMAIL, subject: 'Order status inquiry', body: 'Hi, I would like to know the status of my order ORD001.',
    timestamp: '2023-10-28T15:00:00Z', attachments: [],
  },
  {
    id: 'M002', conversationId: 'CONV001', customerId: 'C001', sender: SenderType.ADMIN,
    type: MessageType.EMAIL, subject: 'Re: Order status inquiry', body: 'Your order ORD001 has been delivered.',
    timestamp: '2023-10-28T15:05:00Z', attachments: [],
  },
  {
    id: 'M003', conversationId: 'CONV002', customerId: 'C002', sender: SenderType.CUSTOMER,
    type: MessageType.WHATSAPP, body: 'Hey, I need to change the shipping address for my order ORD002.',
    timestamp: '2023-10-28T16:00:00Z', attachments: [],
  },
  {
    id: 'M004', conversationId: 'CONV003', customerId: 'C003', sender: SenderType.CUSTOMER,
    type: MessageType.EMAIL, subject: 'Product return request', body: 'Hello, I received product P001 but it is faulty. I would like to request a return or replacement.',
    timestamp: '2023-10-29T10:30:00Z', attachments: [],
  },
];

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'CONV001', customerId: 'C001', customerName: 'Alice Smith',
    lastMessage: 'Your order ORD001 has been delivered.', lastMessageTimestamp: '2023-10-28T15:05:00Z', unreadCount: 0,
    messages: [MOCK_MESSAGES[0], MOCK_MESSAGES[1]],
  },
  {
    id: 'CONV002', customerId: 'C002', customerName: 'Bob Johnson',
    lastMessage: 'Hey, I need to change the shipping address for my order ORD002.', lastMessageTimestamp: '2023-10-28T16:00:00Z', unreadCount: 1,
    messages: [MOCK_MESSAGES[2]],
  },
  {
    id: 'CONV003', customerId: 'C003', customerName: 'Charlie Brown',
    lastMessage: 'Hello, I received product P001 but it is faulty. I would like to request a return or replacement.', lastMessageTimestamp: '2023-10-29T10:30:00Z', unreadCount: 1,
    messages: [MOCK_MESSAGES[3]],
  },
];


const simulateNetworkDelay = (ms = 500) => new Promise(res => setTimeout(res, ms));

export const apiService = {
  // --- Customers ---
  getCustomers: async (): Promise<Customer[]> => {
    await simulateNetworkDelay();
    return MOCK_CUSTOMERS;
  },

  getCustomer: async (id: string): Promise<Customer | undefined> => {
    await simulateNetworkDelay();
    return MOCK_CUSTOMERS.find(c => c.id === id);
  },

  addCustomer: async (newCustomer: Omit<Customer, 'id'>): Promise<Customer> => {
    await simulateNetworkDelay();
    const customerWithId: Customer = { ...newCustomer, id: `C${MOCK_CUSTOMERS.length + 1}` };
    MOCK_CUSTOMERS.push(customerWithId);
    return customerWithId;
  },

  updateCustomer: async (id: string, updatedCustomer: Customer): Promise<Customer> => {
    await simulateNetworkDelay();
    const index = MOCK_CUSTOMERS.findIndex(c => c.id === id);
    if (index > -1) {
      MOCK_CUSTOMERS[index] = updatedCustomer;
      return updatedCustomer;
    }
    throw new Error('Customer not found');
  },

  // --- Products ---
  getProducts: async (): Promise<Product[]> => {
    await simulateNetworkDelay();
    return MOCK_PRODUCTS;
  },

  getProduct: async (id: string): Promise<Product | undefined> => {
    await simulateNetworkDelay();
    return MOCK_PRODUCTS.find(p => p.id === id);
  },

  addProduct: async (newProduct: Omit<Product, 'id'>): Promise<Product> => {
    await simulateNetworkDelay();
    const productWithId: Product = { ...newProduct, id: `P${MOCK_PRODUCTS.length + 1}` };
    MOCK_PRODUCTS.push(productWithId);
    return productWithId;
  },

  updateProduct: async (id: string, updatedProduct: Product): Promise<Product> => {
    await simulateNetworkDelay();
    const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
    if (index > -1) {
      MOCK_PRODUCTS[index] = updatedProduct;
      return updatedProduct;
    }
    throw new Error('Product not found');
  },

  deleteProduct: async (id: string): Promise<void> => {
    await simulateNetworkDelay();
    const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
    if (index > -1) {
      MOCK_PRODUCTS.splice(index, 1);
    } else {
      throw new Error('Product not found');
    }
  },

  // --- Orders ---
  getOrders: async (): Promise<Order[]> => {
    await simulateNetworkDelay();
    return MOCK_ORDERS;
  },

  getOrder: async (id: string): Promise<Order | undefined> => {
    await simulateNetworkDelay();
    return MOCK_ORDERS.find(o => o.id === id);
  },

  updateOrderStatus: async (orderId: string, newStatus: OrderStatus): Promise<Order> => {
    await simulateNetworkDelay();
    const order = MOCK_ORDERS.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      return order;
    }
    throw new Error('Order not found');
  },

  // --- Messaging (Inbox) ---
  getConversations: async (): Promise<Conversation[]> => {
    await simulateNetworkDelay();
    return MOCK_CONVERSATIONS;
  },

  getMessagesForConversation: async (conversationId: string): Promise<Message[]> => {
    await simulateNetworkDelay();
    const conversation = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
    return conversation ? conversation.messages : [];
  },

  sendMessage: async (message: Message): Promise<Message> => {
    await simulateNetworkDelay();
    MOCK_MESSAGES.push(message); // Add to global message list
    const conversation = MOCK_CONVERSATIONS.find(c => c.id === message.conversationId);
    if (conversation) {
      conversation.messages.push(message);
      conversation.lastMessage = message.body;
      conversation.lastMessageTimestamp = message.timestamp;
      if (message.sender === SenderType.CUSTOMER) {
        conversation.unreadCount++;
      } else {
        conversation.unreadCount = 0; // Admin replies, marks as read
      }
    }
    return message;
  },
};

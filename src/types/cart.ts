export interface CartItem {
  productUid: string;
  name: string;
  price: string;
  priceNum: number;
  image: string;
  quantity: number;
  article?: string;
}

export interface OrderPayload {
  customerName: string;
  phone: string;
  email?: string;
  deliveryAddress: string;
  comment?: string;
  items: CartItem[];
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customerName: string;
  phone: string;
  email?: string;
  deliveryAddress?: string;
  comment?: string;
  items: CartItem[];
}

export type OrderStatus =
  | 'new'
  | 'contacted'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

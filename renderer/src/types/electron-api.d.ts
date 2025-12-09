import type { Joke } from './jokes'

export interface User {
  id?: number;
  username: string;
  password_hash?: string; // Only when needed, for creation or specific queries
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id?: number;
  code: string;
  name: string;
  description?: string | null;
  category_id?: number | null;
  category_name?: string | null; // For joined results
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id?: number;
  code: string;
  name: string;
  description?: string | null;
  target_segment?: string | null;
  is_in_carousel?: boolean;
  is_top_product?: boolean;
  price?: number;
  payment_type?: 'one_time' | 'monthly';
  created_at?: string;
  updated_at?: string;
}

export interface PricingPlan {
  id?: number;
  product_id?: number;
  name: string;
  price: number;
  currency?: string;
  billing_interval?: string;
  created_at?: string;
  updated_at?: string;
}

declare global {
  interface ElectronApi {
    ping: () => Promise<unknown>
    openFileDialog: () => Promise<string[] | undefined>
    notifyJokeAdded: (joke: Joke) => Promise<void> | void

    // Users
    getUsers: () => Promise<User[]>;
    createUser: (user: User) => Promise<User>;
    deleteUser(id: number): unknown;

    // Services
    getServices: () => Promise<Service[]>;
    createService: (service: Service) => Promise<Service>;
    deleteService: (id: number) => Promise<void>;

    // Products
    getProducts: () => Promise<Product[]>;
    createProduct: (product: Product) => Promise<Product>;
    deleteProduct: (id: number) => Promise<void>;
    
    // Product Services Management
    addServiceToProduct: (productId: number, serviceId: number, quantity: number) => Promise<any>;
    removeServiceFromProduct: (productId: number, serviceId: number) => Promise<void>;
    getServicesForProduct: (productId: number) => Promise<any[]>;

    // Pricing Plans
    getPlansByProductId: (productId: number) => Promise<PricingPlan[]>;
    addPlanToProduct: (productId: number, plan: PricingPlan) => Promise<PricingPlan>;
  }

  interface Window {
    electronApi: ElectronApi
  }
}

export {}


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
  tag: string;
  name: string;
  description?: string | null;
  category_id?: number | null;
  category_name?: string | null; // For joined results
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id?: number;
  tag: string;
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

export interface Tag {
  id?: number;
  name: string;
  created_at?: string;
}

export interface Category {
  id?: number;
  name: string;
  description?: string;
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
    updateUser: (id: number, user: User) => Promise<User>;
    deleteUser(id: number): unknown;

    // Services
    getServices: () => Promise<Service[]>;
    createService: (service: Service) => Promise<Service>;
    updateService: (id: number, service: Service) => Promise<Service>;
    deleteService: (id: number) => Promise<void>;
    getServiceByTag: (tag: string) => Promise<Service>;

    // Products
    getProducts: () => Promise<Product[]>;
    createProduct: (product: Product) => Promise<Product>;
    updateProduct: (id: number, product: Product) => Promise<Product>;
    deleteProduct: (id: number) => Promise<void>;
    getProductByTag: (tag: string) => Promise<Product>;
    
    // Product Services Management
    addServiceToProduct: (productId: number, serviceId: number, quantity: number) => Promise<any>;
    removeServiceFromProduct: (productId: number, serviceId: number) => Promise<void>;
    getServicesForProduct: (productId: number) => Promise<any[]>;

    // Pricing Plans
    getPlansByProductId: (productId: number) => Promise<PricingPlan[]>;
    addPlanToProduct: (productId: number, plan: PricingPlan) => Promise<PricingPlan>;

    // Tags
    getTags: () => Promise<Tag[]>;
    createTag: (tag: Tag) => Promise<Tag>;
    updateTag: (id: number, tag: Tag) => Promise<Tag>;
    deleteTag: (id: number) => Promise<void>;
    
    // Tag-Service relationships
    getTagsForService: (serviceId: number) => Promise<Tag[]>;
    addTagToService: (serviceId: number, tagId: number) => Promise<any>;
    removeTagFromService: (serviceId: number, tagId: number) => Promise<void>;
    
    // Tag-Product relationships
    getTagsForProduct: (productId: number) => Promise<Tag[]>;
    addTagToProduct: (productId: number, tagId: number) => Promise<any>;
    removeTagFromProduct: (productId: number, tagId: number) => Promise<void>;

    // Categories
    getCategories: () => Promise<Category[]>;
    createCategory: (category: Category) => Promise<Category>;
    updateCategory: (id: number, category: Category) => Promise<Category>;
    deleteCategory: (id: number) => Promise<void>;
  }

  interface Window {
    electronApi: ElectronApi
  }
}

export {}


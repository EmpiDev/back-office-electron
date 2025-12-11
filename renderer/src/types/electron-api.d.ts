
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
  name: string;
  description?: string | null;
  category_id?: number | null;
  category_name?: string | null; // For joined results
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id?: number;
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

    export interface ApiResponse<T> {
      success: boolean;
      code: number;
      data: T;
      error?: string;
    }
  
    interface ElectronApi {
      // Users
      getUsers: () => Promise<ApiResponse<User[]>>;
      createUser: (user: User) => Promise<ApiResponse<User>>;
      updateUser: (id: number, user: User) => Promise<ApiResponse<User>>;
      deleteUser(id: number): Promise<ApiResponse<void>>;
  
      // Services
      getServices: () => Promise<ApiResponse<Service[]>>;
      createService: (service: Service) => Promise<ApiResponse<Service>>;
      updateService: (id: number, service: Service) => Promise<ApiResponse<Service>>;
      deleteService: (id: number) => Promise<ApiResponse<void>>;
  
  
      // Products
      getProducts: () => Promise<ApiResponse<Product[]>>;
      createProduct: (product: Product) => Promise<ApiResponse<Product>>;
      updateProduct: (id: number, product: Product) => Promise<ApiResponse<Product>>;
      deleteProduct: (id: number) => Promise<ApiResponse<void>>;
      
      // Product Services Management
      addServiceToProduct: (productId: number, serviceId: number, quantity: number) => Promise<ApiResponse<any>>;
      removeServiceFromProduct: (productId: number, serviceId: number) => Promise<ApiResponse<void>>;
      getServicesForProduct: (productId: number) => Promise<ApiResponse<any[]>>;
  
  
  
      // Tags
      getTags: () => Promise<ApiResponse<Tag[]>>;
      createTag: (tag: Tag) => Promise<ApiResponse<Tag>>;
      updateTag: (id: number, tag: Tag) => Promise<ApiResponse<Tag>>;
      deleteTag: (id: number) => Promise<ApiResponse<void>>;
      
      // Tag-Service relationships
      getTagsForService: (serviceId: number) => Promise<ApiResponse<Tag[]>>;
      addTagToService: (serviceId: number, tagId: number) => Promise<ApiResponse<any>>;
      removeTagFromService: (serviceId: number, tagId: number) => Promise<ApiResponse<void>>;
      
      // Tag-Product relationships
      getTagsForProduct: (productId: number) => Promise<ApiResponse<Tag[]>>;
      addTagToProduct: (productId: number, tagId: number) => Promise<ApiResponse<any>>;
      removeTagFromProduct: (productId: number, tagId: number) => Promise<ApiResponse<void>>;
  
      // Categories
      getCategories: () => Promise<ApiResponse<Category[]>>;
      createCategory: (category: Category) => Promise<ApiResponse<Category>>;
      updateCategory: (id: number, category: Category) => Promise<ApiResponse<Category>>;
      deleteCategory: (id: number) => Promise<ApiResponse<void>>;

        // Dashboard
      getDashboardStats: () => Promise<ApiResponse<any>>;
    }

  interface Window {
    electronApi: ElectronApi
  }
}

export {}


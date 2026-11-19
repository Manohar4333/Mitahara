import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api.js';
import { IProduct, ICategory } from '../../types/index.js';

interface ProductsState {
  products: IProduct[];
  featuredProducts: IProduct[];
  categories: ICategory[];
  currentProduct: IProduct | null;
  relatedProducts: IProduct[];
  total: number;
  totalPages: number;
  page: number;
  loading: boolean;
  error: string | null;
  filters: {
    search: string;
    category: string;
    minPrice: string;
    maxPrice: string;
    sort: string;
    availableOnly: boolean;
  };
}

const initialState: ProductsState = {
  products: [],
  featuredProducts: [],
  categories: [],
  currentProduct: null,
  relatedProducts: [],
  total: 0,
  totalPages: 1,
  page: 1,
  loading: false,
  error: null,
  filters: {
    search: '',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
    availableOnly: false,
  },
};

// Generate stable session seed once per browser session
const getSessionSeed = (): string => {
  let seed = sessionStorage.getItem('mitahara_featured_seed');
  if (!seed) {
    seed = Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('mitahara_featured_seed', seed);
  }
  return seed;
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: Record<string, any> | void = {}, { getState, rejectWithValue }) => {
    try {
      const state = (getState() as any).products;
      const safeParams = params || {};
      const mergedParams = {
        page: safeParams.page || state.page,
        limit: safeParams.limit || 12,
        search: safeParams.search !== undefined ? safeParams.search : state.filters.search,
        category: safeParams.category !== undefined ? safeParams.category : state.filters.category,
        minPrice: safeParams.minPrice !== undefined ? safeParams.minPrice : state.filters.minPrice,
        maxPrice: safeParams.maxPrice !== undefined ? safeParams.maxPrice : state.filters.maxPrice,
        sort: safeParams.sort !== undefined ? safeParams.sort : state.filters.sort,
        availableOnly: safeParams.availableOnly !== undefined ? safeParams.availableOnly : state.filters.availableOnly,
      };

      const res = await api.get('/products', { params: mergedParams });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const sessionSeed = getSessionSeed();
      const res = await api.get('/products/featured', { params: { sessionSeed, limit: 8 } });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch featured products');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/categories');
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (idOrSlug: string, { rejectWithValue }) => {
    try {
      const [prodRes, relatedRes] = await Promise.all([
        api.get(`/products/${idOrSlug}`),
        api.get(`/products/${idOrSlug}/related`),
      ]);
      return {
        product: prodRes.data.data,
        related: relatedRes.data.data,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Product not found');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.page = 1;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.filters.category = action.payload;
      state.page = 1;
    },
    setSortFilter: (state, action: PayloadAction<string>) => {
      state.filters.sort = action.payload;
      state.page = 1;
    },
    setAvailableOnly: (state, action: PayloadAction<boolean>) => {
      state.filters.availableOnly = action.payload;
      state.page = 1;
    },
    setPriceRange: (state, action: PayloadAction<{ min: string; max: string }>) => {
      state.filters.minPrice = action.payload.min;
      state.filters.maxPrice = action.payload.max;
      state.page = 1;
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        category: 'all',
        minPrice: '',
        maxPrice: '',
        sort: 'newest',
        availableOnly: false,
      };
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    // Products
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload.data;
      state.total = action.payload.pagination.total;
      state.totalPages = action.payload.pagination.totalPages;
      state.page = action.payload.pagination.page;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Featured
    builder.addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
      state.featuredProducts = action.payload;
    });

    // Categories
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.categories = action.payload;
    });

    // Product Detail
    builder.addCase(fetchProductById.pending, (state) => {
      state.loading = true;
      state.currentProduct = null;
    });
    builder.addCase(fetchProductById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentProduct = action.payload.product;
      state.relatedProducts = action.payload.related;
    });
    builder.addCase(fetchProductById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setSearch,
  setCategoryFilter,
  setSortFilter,
  setAvailableOnly,
  setPriceRange,
  resetFilters,
} = productsSlice.actions;
export default productsSlice.reducer;

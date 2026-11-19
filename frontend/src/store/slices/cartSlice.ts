import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api.js';
import { ICartItem, IValidatedCouponData } from '../../types/index.js';

interface CartState {
  items: ICartItem[];
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  gst: number;
  total: number;
  coupon: IValidatedCouponData | null;
  couponError: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  deliveryCharge: 24,
  gst: 0,
  total: 0,
  coupon: null,
  couponError: null,
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/cart');
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }: { productId: string; quantity?: number }, { rejectWithValue }) => {
    try {
      const res = await api.post('/cart/items', { productId, quantity });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

export const updateCartItemQty = createAsyncThunk(
  'cart/updateQty',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/cart/items/${productId}`, { quantity });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update quantity');
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async (productId: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/cart/items/${productId}`);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove item');
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async ({ couponCode, subtotal }: { couponCode: string; subtotal: number }, { rejectWithValue }) => {
    try {
      const res = await api.post('/coupons/validate', { couponCode, subtotal });
      return res.data.data as IValidatedCouponData;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Coupon invalid or expired');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    removeCoupon: (state) => {
      state.coupon = null;
      state.couponError = null;
      state.total = state.subtotal > 0 ? state.subtotal + state.deliveryCharge : 0;
    },
    clearCartLocal: (state) => {
      state.items = [];
      state.itemCount = 0;
      state.subtotal = 0;
      state.total = 0;
      state.coupon = null;
      state.couponError = null;
    },
    clearCouponError: (state) => {
      state.couponError = null;
    },
  },
  extraReducers: (builder) => {
    const handleCartData = (state: CartState, payload: any) => {
      state.items = payload.items || [];
      state.itemCount = payload.itemCount || 0;
      state.subtotal = payload.subtotal || 0;
      state.deliveryCharge = payload.deliveryCharge !== undefined ? payload.deliveryCharge : 24;
      state.gst = 0;

      // Recalculate total with active coupon if present
      const discount = state.coupon?.discountAmount || 0;
      state.total = state.subtotal > 0 ? Math.max(0, state.subtotal + state.deliveryCharge - discount) : 0;
      state.loading = false;
      state.error = null;
    };

    // Fetch
    builder.addCase(fetchCart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      handleCartData(state, action.payload);
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add
    builder.addCase(addToCart.fulfilled, (state, action) => {
      handleCartData(state, action.payload);
    });

    // Update
    builder.addCase(updateCartItemQty.fulfilled, (state, action) => {
      handleCartData(state, action.payload);
    });

    // Remove
    builder.addCase(removeCartItem.fulfilled, (state, action) => {
      handleCartData(state, action.payload);
    });

    // Apply Coupon
    builder.addCase(applyCoupon.pending, (state) => {
      state.couponError = null;
    });
    builder.addCase(applyCoupon.fulfilled, (state, action: PayloadAction<IValidatedCouponData>) => {
      state.coupon = action.payload;
      state.couponError = null;
      state.total = action.payload.finalAmount;
    });
    builder.addCase(applyCoupon.rejected, (state, action) => {
      state.coupon = null;
      state.couponError = action.payload as string;
    });
  },
});

export const { removeCoupon, clearCartLocal, clearCouponError } = cartSlice.actions;
export default cartSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api.js';
import { IOrder, IOrderTrackingData } from '../../types/index.js';

interface OrdersState {
  orders: IOrder[];
  currentOrder: IOrder | null;
  trackingData: IOrderTrackingData | null;
  loading: boolean;
  trackingLoading: boolean;
  error: string | null;
  checkoutSuccess: boolean;
  lastCreatedOrder: IOrder | null;
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  trackingData: null,
  loading: false,
  trackingLoading: false,
  error: null,
  checkoutSuccess: false,
  lastCreatedOrder: null,
};

export const fetchMyOrders = createAsyncThunk('orders/fetchMyOrders', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/user/orders');
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
  }
});

export const fetchOrderTracking = createAsyncThunk(
  'orders/fetchTracking',
  async (orderIdOrNumber: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/user/orders/${orderIdOrNumber}/tracking`);
      return res.data.data as IOrderTrackingData;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load order tracking');
    }
  }
);

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderPayload: any, { rejectWithValue }) => {
    try {
      const res = await api.post('/orders/checkout', orderPayload);
      return res.data.data as IOrder;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to place order');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetCheckoutState: (state) => {
      state.checkoutSuccess = false;
      state.lastCreatedOrder = null;
      state.error = null;
    },
    // Handler for real-time Socket.IO status updates
    updateLiveTrackingStatus: (state, action: PayloadAction<any>) => {
      const update = action.payload;
      if (state.trackingData && state.trackingData.orderNumber === update.orderNumber) {
        state.trackingData.currentStatus = update.orderStatus;
        if (update.courierName) state.trackingData.courierName = update.courierName;
        if (update.trackingNumber) state.trackingData.trackingNumber = update.trackingNumber;
        if (update.estimatedDeliveryDate) state.trackingData.estimatedDeliveryDate = update.estimatedDeliveryDate;
        if (update.statusHistory) state.trackingData.statusHistory = update.statusHistory;

        // Recalculate timeline stage states
        const allStages = [
          'ORDER PLACED',
          'ORDER CONFIRMED',
          'PROCESSING',
          'SHIPPED',
          'OUT FOR DELIVERY',
          'DELIVERED',
        ];
        const isCancelled = update.orderStatus === 'CANCELLED';
        const currentIdx = allStages.indexOf(update.orderStatus);

        state.trackingData.timeline = allStages.map((stage, idx) => {
          let s: 'completed' | 'current' | 'pending' = 'pending';
          if (!isCancelled) {
            if (idx < currentIdx) s = 'completed';
            else if (idx === currentIdx) s = 'current';
          }
          const historyItem = update.statusHistory?.find((h: any) => h.status === stage);
          return {
            stage: stage as any,
            state: s,
            timestamp: historyItem?.updatedAt || null,
            message: historyItem?.message || null,
          };
        });
      }

      // Also update in orders list if present
      const listIdx = state.orders.findIndex((o) => o.orderNumber === update.orderNumber);
      if (listIdx !== -1) {
        state.orders[listIdx].orderStatus = update.orderStatus;
      }
    },
  },
  extraReducers: (builder) => {
    // My Orders
    builder.addCase(fetchMyOrders.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchMyOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload;
    });
    builder.addCase(fetchMyOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Tracking
    builder.addCase(fetchOrderTracking.pending, (state) => {
      state.trackingLoading = true;
    });
    builder.addCase(fetchOrderTracking.fulfilled, (state, action) => {
      state.trackingLoading = false;
      state.trackingData = action.payload;
    });
    builder.addCase(fetchOrderTracking.rejected, (state, action) => {
      state.trackingLoading = false;
      state.error = action.payload as string;
    });

    // Place Order
    builder.addCase(placeOrder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(placeOrder.fulfilled, (state, action) => {
      state.loading = false;
      state.checkoutSuccess = true;
      state.lastCreatedOrder = action.payload;
      state.orders.unshift(action.payload);
    });
    builder.addCase(placeOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { resetCheckoutState, updateLiveTrackingStatus } = ordersSlice.actions;
export default ordersSlice.reducer;

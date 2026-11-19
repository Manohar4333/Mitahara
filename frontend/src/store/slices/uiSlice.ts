import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UiState {
  authModalOpen: boolean;
  authRedirectPath: string | null;
  wishlist: string[]; // Product IDs
  toasts: Toast[];
}

const getStoredWishlist = (): string[] => {
  try {
    const item = localStorage.getItem('mitahara_wishlist');
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
};

const initialState: UiState = {
  authModalOpen: false,
  authRedirectPath: null,
  wishlist: getStoredWishlist(),
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAuthModal: (state, action: PayloadAction<string | undefined>) => {
      state.authModalOpen = true;
      state.authRedirectPath = action.payload || null;
    },
    closeAuthModal: (state) => {
      state.authModalOpen = false;
      state.authRedirectPath = null;
    },
    toggleWishlist: (state, action: PayloadAction<string>) => {
      const prodId = action.payload;
      if (state.wishlist.includes(prodId)) {
        state.wishlist = state.wishlist.filter((id) => id !== prodId);
      } else {
        state.wishlist.push(prodId);
      }
      try {
        localStorage.setItem('mitahara_wishlist', JSON.stringify(state.wishlist));
      } catch (e) {
        console.error('LocalStorage error:', e);
      }
    },
    showToast: (state, action: PayloadAction<{ type: 'success' | 'error' | 'info'; message: string }>) => {
      const id = Math.random().toString(36).substring(2, 9);
      state.toasts.push({
        id,
        type: action.payload.type,
        message: action.payload.message,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { openAuthModal, closeAuthModal, toggleWishlist, showToast, removeToast } = uiSlice.actions;
export default uiSlice.reducer;

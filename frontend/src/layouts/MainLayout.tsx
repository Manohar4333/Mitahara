import React, { useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/navbar/Navbar.js';
import { Footer } from '../components/footer/Footer.js';
import { AuthModal } from '../components/common/AuthModal.js';
import { ToastContainer } from '../components/common/ToastContainer.js';
import { useAppDispatch } from '../store/index.js';
import { checkAuthMe } from '../store/slices/authSlice.js';
import { fetchCart } from '../store/slices/cartSlice.js';
import { registerAuthModalHandler, triggerAuthModal } from '../services/api.js';
import { openAuthModal } from '../store/slices/uiSlice.js';

export const MainLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  // Initialize auth check & register modal interceptor
  useEffect(() => {
    dispatch(checkAuthMe()).then((res) => {
      if (checkAuthMe.fulfilled.match(res)) {
        dispatch(fetchCart());
      }
    });

    registerAuthModalHandler((redirectPath) => {
      dispatch(openAuthModal(redirectPath));
    });
  }, [dispatch]);

  // Capture UTM parameters for marketing attribution
  useEffect(() => {
    const utmSource = searchParams.get('utm_source');
    const utmMedium = searchParams.get('utm_medium');
    const utmCampaign = searchParams.get('utm_campaign');

    if (utmSource || utmMedium || utmCampaign) {
      const attribution = {
        utm_source: utmSource || 'direct',
        utm_medium: utmMedium || 'none',
        utm_campaign: utmCampaign || 'organic',
      };
      sessionStorage.setItem('mitahara_utm', JSON.stringify(attribution));
      console.log('[Attribution] Captured campaign UTMs:', attribution);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

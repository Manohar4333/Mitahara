import crypto from 'crypto';

export const generateOtp = (): string => {
  // Generate cryptographically secure 6-digit OTP
  return Math.floor(100000 + crypto.randomInt(900000)).toString();
};

export const hashOtp = (otp: string): string => {
  return crypto.createHash('sha256').update(otp.trim()).digest('hex');
};

export const verifyOtpHash = (inputOtp: string, hashedOtp: string): boolean => {
  const computedHash = hashOtp(inputOtp);
  return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hashedOtp));
};

export const generateOrderNumber = (): string => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = crypto.randomInt(1000, 9999).toString();
  return `MTH-${dateStr}-${randomSuffix}`;
};

export const getOtpEmailHtml = (otp: string, expiryMinutes: number = 5): string => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #15803d; padding: 28px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px;">MITAHARA</h1>
        <p style="color: #dcfce7; margin: 6px 0 0 0; font-size: 14px;">Pure & Wholesome Organic Living</p>
      </div>
      <div style="padding: 32px 24px; color: #1e293b;">
        <h2 style="color: #1e293b; font-size: 20px; margin-top: 0;">Your Verification Code</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Please use the 6-digit One-Time Password (OTP) below to authenticate your MITAHARA account.
        </p>
        <div style="background-color: #f0fdf4; border: 2px dashed #86efac; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: 800; color: #15803d; letter-spacing: 8px; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
          This code is valid for <strong>${expiryMinutes} minutes</strong> and can only be used once. Never share this OTP with anyone.
        </p>
      </div>
      <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} MITAHARA. Pure health, balanced diet.</p>
      </div>
    </div>
  `;
};

export const getOrderStatusEmailHtml = ({
  orderNumber,
  customerName,
  status,
  message,
  totalAmount,
  courierName,
  trackingNumber,
  estimatedDeliveryDate,
}: {
  orderNumber: string;
  customerName: string;
  status: string;
  message?: string;
  totalAmount: number;
  courierName?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
}): string => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background-color: #15803d; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 2px;">MITAHARA</h1>
        <p style="color: #dcfce7; margin: 4px 0 0 0; font-size: 14px;">Order Status Update</p>
      </div>
      <div style="padding: 28px 24px; color: #1e293b;">
        <h2 style="font-size: 20px; color: #1e293b; margin-top: 0;">Hello ${customerName},</h2>
        <p style="font-size: 15px; color: #475569; line-height: 1.5;">
          Your order <strong>#${orderNumber}</strong> has been updated to:
        </p>
        <div style="display: inline-block; background-color: #dcfce7; color: #15803d; font-weight: 700; font-size: 16px; padding: 8px 18px; border-radius: 9999px; margin: 12px 0;">
          ${status}
        </div>
        ${message ? `<p style="font-size: 14px; color: #334155; background-color: #f1f5f9; padding: 12px; border-radius: 6px;">${message}</p>` : ''}
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Order Total:</td>
            <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #1e293b;">₹${totalAmount}</td>
          </tr>
          ${courierName ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Courier Partner:</td>
            <td style="padding: 8px 0; font-weight: 600; text-align: right; color: #1e293b;">${courierName}</td>
          </tr>` : ''}
          ${trackingNumber ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Tracking ID:</td>
            <td style="padding: 8px 0; font-weight: 600; text-align: right; color: #1e293b;">${trackingNumber}</td>
          </tr>` : ''}
          ${estimatedDeliveryDate ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Estimated Delivery:</td>
            <td style="padding: 8px 0; font-weight: 600; text-align: right; color: #1e293b;">${new Date(estimatedDeliveryDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</td>
          </tr>` : ''}
        </table>
      </div>
      <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">Track your fresh healthy items anytime directly on MITAHARA.</p>
      </div>
    </div>
  `;
};

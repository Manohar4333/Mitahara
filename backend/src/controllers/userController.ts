import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { User } from '../models/User.js';

export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user!;
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        location: user.location || '',
        pinCode: user.pinCode || '',
        marketingConsent: user.marketingConsent,
        role: user.role,
        savedAddresses: user.savedAddresses || [],
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const { name, phone, location, pinCode, marketingConsent } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(location !== undefined && { location: location.trim() }),
        ...(pinCode !== undefined && { pinCode: pinCode.trim() }),
        ...(marketingConsent !== undefined && { marketingConsent: Boolean(marketingConsent) }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        location: updatedUser.location,
        pinCode: updatedUser.pinCode,
        marketingConsent: updatedUser.marketingConsent,
        role: updatedUser.role,
        savedAddresses: updatedUser.savedAddresses,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addSavedAddress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const addressData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (addressData.isDefault) {
      user.savedAddresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.savedAddresses.push(addressData);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully.',
      data: user.savedAddresses,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSavedAddress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    user.savedAddresses = user.savedAddresses.filter((a: any) => a._id.toString() !== addressId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address removed successfully.',
      data: user.savedAddresses,
    });
  } catch (error) {
    next(error);
  }
};

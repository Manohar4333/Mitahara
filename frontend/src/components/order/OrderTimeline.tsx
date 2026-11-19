import React from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  CheckCheck,
  AlertCircle,
  Calendar,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { ITimelineStage, OrderStatus } from '../../types/index.js';

interface OrderTimelineProps {
  timeline: ITimelineStage[];
  currentStatus: OrderStatus;
  isCancelled: boolean;
  courierName?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
}

const getStageIcon = (stage: OrderStatus, state: string) => {
  switch (stage) {
    case 'ORDER PLACED':
      return <Package className="w-5 h-5" />;
    case 'ORDER CONFIRMED':
      return <CheckCircle2 className="w-5 h-5" />;
    case 'PROCESSING':
      return <Clock className="w-5 h-5" />;
    case 'SHIPPED':
      return <Truck className="w-5 h-5" />;
    case 'OUT FOR DELIVERY':
      return <Truck className="w-5 h-5" />;
    case 'DELIVERED':
      return <CheckCheck className="w-5 h-5" />;
    case 'CANCELLED':
      return <AlertCircle className="w-5 h-5" />;
    default:
      return <Clock className="w-5 h-5" />;
  }
};

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  timeline,
  currentStatus,
  isCancelled,
  courierName,
  trackingNumber,
  estimatedDeliveryDate,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-emerald-100 p-6 md:p-8 shadow-sm">
      {/* Courier & Tracking Metadata Bar */}
      {(courierName || trackingNumber || estimatedDeliveryDate) && (
        <div className="mb-8 p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {courierName && (
            <div>
              <span className="text-slate-500 block mb-0.5">Courier Partner</span>
              <span className="font-bold text-slate-800 text-sm">{courierName}</span>
            </div>
          )}
          {trackingNumber && (
            <div>
              <span className="text-slate-500 block mb-0.5">Tracking Number</span>
              <span className="font-mono font-bold text-emerald-800 text-sm">{trackingNumber}</span>
            </div>
          )}
          {estimatedDeliveryDate && (
            <div>
              <span className="text-slate-500 block mb-0.5">Estimated Delivery</span>
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                {new Date(estimatedDeliveryDate).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Cancelled Alert Banner */}
      {isCancelled && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-sm">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">This Order Has Been Cancelled</h4>
            <p className="text-xs text-red-700 mt-1">
              If any advance payment was made, it will be refunded to your source account within 3-5 business days.
            </p>
          </div>
        </div>
      )}

      {/* Vertical Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {timeline.map((item, idx) => {
          const isCompleted = item.state === 'completed';
          const isCurrent = item.state === 'current';
          const isPending = item.state === 'pending';

          return (
            <div key={item.stage} className="relative group">
              {/* Step Circle Marker */}
              <div
                className={`absolute -left-[30px] sm:-left-[35px] top-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                    : isCurrent
                    ? 'bg-lime-500 text-emerald-950 ring-4 ring-lime-200 font-bold shadow-md animate-pulse'
                    : 'bg-slate-100 text-slate-400 border border-slate-300'
                }`}
              >
                {getStageIcon(item.stage, item.state)}
              </div>

              {/* Stage Content */}
              <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm sm:text-base font-bold ${
                        isCurrent
                          ? 'text-emerald-800'
                          : isCompleted
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.stage}
                    </h4>
                    {isCurrent && (
                      <span className="text-[10px] bg-lime-100 text-lime-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Current Status
                      </span>
                    )}
                  </div>

                  {item.timestamp && (
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(item.timestamp).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                {item.message ? (
                  <p className="text-xs text-slate-600 mt-1">{item.message}</p>
                ) : isCompleted ? (
                  <p className="text-xs text-slate-400 mt-1">Stage completed successfully.</p>
                ) : isCurrent ? (
                  <p className="text-xs text-emerald-700 mt-1 font-medium">Order is currently being handled at this stage.</p>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">Pending subsequent workflow updates.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

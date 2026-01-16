import { format } from 'date-fns';
import { Calendar, Clock, MapPin, IndianRupee, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

const statusConfig = {
  pending: {
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: AlertCircle,
    label: 'Pending'
  },
  confirmed: {
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: CheckCircle,
    label: 'Confirmed'
  },
  in_progress: {
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Loader,
    label: 'In Progress'
  },
  completed: {
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
    label: 'Completed'
  },
  cancelled: {
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
    label: 'Cancelled'
  }
};

const BookingCard = ({ booking, onCancel, onConfirm, onComplete, showActions = false, userRole = 'farmer' }) => {
  const {
    _id,
    machine,
    date,
    timeSlots,
    fieldLocation,
    acres,
    cost,
    status,
    workType
  } = booking;

  const statusInfo = statusConfig[status] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden card-hover">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {machine?.name || 'Machine'}
            </h3>
            <span className="text-sm text-gray-500 capitalize">
              {machine?.type?.replace('_', ' ')} • {workType?.replace('_', ' ')}
            </span>
          </div>
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}>
            <StatusIcon className="h-4 w-4" />
            <span>{statusInfo.label}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Date */}
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4 text-primary-500" />
            <span className="text-sm">{formatDate(date)}</span>
          </div>

          {/* Time Slot */}
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4 text-primary-500" />
            <span className="text-sm">
              {timeSlots?.startTime || 'TBD'} - {timeSlots?.endTime || 'TBD'}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-2 text-gray-600 col-span-2">
            <MapPin className="h-4 w-4 text-primary-500" />
            <span className="text-sm">
              {fieldLocation?.village}, {fieldLocation?.district}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-500">Total Cost</div>
            <div className="flex items-center text-primary-600">
              <IndianRupee className="h-4 w-4" />
              <span className="text-lg font-bold">{cost?.totalCost}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-500">Area</div>
            <div className="text-lg font-semibold text-gray-900">{acres} acres</div>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            {status === 'pending' && userRole === 'owner' && onConfirm && (
              <button
                onClick={() => onConfirm(_id)}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Confirm
              </button>
            )}
            {status === 'confirmed' && onComplete && (
              <button
                onClick={() => onComplete(_id)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Mark Complete
              </button>
            )}
            {['pending', 'confirmed'].includes(status) && onCancel && (
              <button
                onClick={() => onCancel(_id)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;

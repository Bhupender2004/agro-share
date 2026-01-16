import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addWeeks, 
  subWeeks,
  isSameDay,
  parseISO
} from 'date-fns';
import toast from 'react-hot-toast';

const Schedule = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('week'); // 'week' or 'list'

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getAll();
      const allBookings = response.data.data || [];
      // Filter only confirmed and in_progress bookings
      const activeBookings = allBookings.filter(
        b => ['confirmed', 'in_progress', 'pending'].includes(b.status)
      );
      setBookings(activeBookings);
    } catch (error) {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await bookingAPI.updateStatus(bookingId, status);
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update booking');
    }
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getBookingsForDate = (date) => {
    return bookings.filter(booking => {
      const bookingDate = booking.timeSlot?.date 
        ? parseISO(booking.timeSlot.date) 
        : new Date(booking.createdAt);
      return isSameDay(bookingDate, date);
    });
  };

  const selectedDateBookings = getBookingsForDate(selectedDate);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      in_progress: 'bg-purple-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-700', label: 'Confirmed' },
      in_progress: { color: 'bg-purple-100 text-purple-700', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-700', label: 'Cancelled' }
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule</h1>
              <p className="text-gray-600">View and manage your machine bookings</p>
            </div>
            
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('week')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'week' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                }`}
              >
                Week View
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                }`}
              >
                List View
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'week' ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Week Navigation */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <button
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                </h2>
              </div>
              
              <button
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-7">
              {weekDays.map((day, index) => {
                const dayBookings = getBookingsForDate(day);
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day)}
                    className={`p-4 border-b border-r last:border-r-0 text-center hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="text-xs text-gray-500 uppercase mb-1">
                      {format(day, 'EEE')}
                    </div>
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-semibold ${
                      isToday 
                        ? 'bg-primary-600 text-white' 
                        : isSelected 
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-900'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    
                    {/* Booking Indicators */}
                    <div className="mt-2 flex justify-center gap-1">
                      {dayBookings.slice(0, 3).map((booking, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${getStatusColor(booking.status)}`}
                        />
                      ))}
                      {dayBookings.length > 3 && (
                        <span className="text-xs text-gray-500">+{dayBookings.length - 3}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Date Bookings */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              
              {selectedDateBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No bookings scheduled for this day</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateBookings.map(booking => {
                    const badge = getStatusBadge(booking.status);
                    
                    return (
                      <div
                        key={booking._id}
                        className="bg-gray-50 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {booking.machine?.name || 'Machine'}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${badge.color}`}>
                                {badge.label}
                              </span>
                            </div>
                            
                            <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span>
                                  {booking.timeSlot?.startTime 
                                    ? format(new Date(booking.timeSlot.startTime), 'h:mm a')
                                    : 'TBD'
                                  }
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span>{booking.fieldLocation?.village}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span>{booking.farmer?.name || 'Farmer'}</span>
                              </div>
                              {booking.farmer?.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <a href={`tel:${booking.farmer.phone}`} className="text-primary-600">
                                    {booking.farmer.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          {user?.role === 'owner' && booking.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                title="Accept"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                title="Reject"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                          
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'in_progress')}
                              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                            >
                              Start Work
                            </button>
                          )}
                          
                          {booking.status === 'in_progress' && (
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'completed')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                            >
                              Complete
                            </button>
                          )}
                        </div>

                        {/* Cost */}
                        <div className="mt-3 pt-3 border-t flex justify-between items-center">
                          <span className="text-sm text-gray-500">Booking Cost</span>
                          <span className="font-semibold text-primary-600">
                            ₹{booking.cost?.totalCost || 0}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">All Scheduled Bookings</h2>
            </div>
            
            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No scheduled bookings</h3>
                <p className="text-gray-600">Your confirmed bookings will appear here</p>
              </div>
            ) : (
              <div className="divide-y">
                {bookings
                  .sort((a, b) => new Date(a.timeSlot?.date || a.createdAt) - new Date(b.timeSlot?.date || b.createdAt))
                  .map(booking => {
                    const badge = getStatusBadge(booking.status);
                    const bookingDate = booking.timeSlot?.date 
                      ? parseISO(booking.timeSlot.date) 
                      : new Date(booking.createdAt);
                    
                    return (
                      <div key={booking._id} className="p-6 hover:bg-gray-50">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          {/* Date */}
                          <div className="lg:w-24 flex-shrink-0 text-center lg:text-left">
                            <div className="text-2xl font-bold text-gray-900">
                              {format(bookingDate, 'd')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(bookingDate, 'MMM yyyy')}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {booking.machine?.name || 'Machine'}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${badge.color}`}>
                                {badge.label}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {booking.timeSlot?.startTime 
                                    ? format(new Date(booking.timeSlot.startTime), 'h:mm a')
                                    : 'TBD'
                                  }
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  {booking.fieldLocation?.village}, {booking.fieldLocation?.district}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{booking.farmer?.name || 'Farmer'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Cost & Actions */}
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-lg font-semibold text-primary-600">
                                ₹{booking.cost?.totalCost || 0}
                              </div>
                            </div>
                            
                            {user?.role === 'owner' && booking.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                  className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;

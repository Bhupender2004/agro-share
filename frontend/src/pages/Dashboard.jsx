import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { machineAPI, bookingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import MachineCard from '../components/MachineCard';
import { 
  Plus, 
  Calendar, 
  TrendingUp, 
  Clock, 
  MapPin,
  Star,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  Tractor
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalMachines: 0,
    totalEarnings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [myMachines, setMyMachines] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings
      const bookingsRes = await bookingAPI.getAll();
      const bookings = bookingsRes.data.data || [];
      
      // Calculate stats
      const pending = bookings.filter(b => b.status === 'pending').length;
      const completed = bookings.filter(b => b.status === 'completed').length;
      const earnings = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.cost?.totalCost || 0), 0);
      
      setStats(prev => ({
        ...prev,
        totalBookings: bookings.length,
        pendingBookings: pending,
        completedBookings: completed,
        totalEarnings: earnings
      }));
      
      setRecentBookings(bookings.slice(0, 5));

      // Fetch machines if owner
      if (user?.role === 'owner') {
        const machinesRes = await machineAPI.getAll({ owner: user._id });
        const machines = machinesRes.data.data || [];
        setMyMachines(machines);
        setStats(prev => ({ ...prev, totalMachines: machines.length }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
      confirmed: { icon: CheckCircle, color: 'bg-blue-100 text-blue-700', label: 'Confirmed' },
      in_progress: { icon: TrendingUp, color: 'bg-purple-100 text-purple-700', label: 'In Progress' },
      completed: { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Completed' },
      cancelled: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Cancelled' }
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-primary-100">
                {user?.role === 'owner' 
                  ? 'Manage your machines and track bookings'
                  : 'Track your bookings and find new machines'}
              </p>
            </div>
            
            {user?.role === 'owner' ? (
              <Link
                to="/add-machine"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Machine
              </Link>
            ) : (
              <Link
                to="/machines"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
              >
                <Tractor className="h-5 w-5 mr-2" />
                Browse Machines
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-16 relative z-10 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.totalBookings}</span>
            </div>
            <p className="text-gray-600">Total Bookings</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</span>
            </div>
            <p className="text-gray-600">Pending Requests</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.completedBookings}</span>
            </div>
            <p className="text-gray-600">Completed</p>
          </div>

          {user?.role === 'owner' ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings.toLocaleString()}</span>
              </div>
              <p className="text-gray-600">Total Earnings</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings.toLocaleString()}</span>
              </div>
              <p className="text-gray-600">Total Spent</p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                <Link
                  to="/bookings"
                  className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              
              {recentBookings.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-5xl mb-4">📅</div>
                  <h3 className="font-medium text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-500 mb-4">
                    {user?.role === 'farmer' 
                      ? 'Start by booking a machine for your farm'
                      : 'Add your machines to start receiving bookings'}
                  </p>
                  <Link
                    to={user?.role === 'farmer' ? '/machines' : '/add-machine'}
                    className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700"
                  >
                    {user?.role === 'farmer' ? 'Browse Machines' : 'Add Machine'}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {recentBookings.map(booking => {
                    const badge = getStatusBadge(booking.status);
                    const BadgeIcon = badge.icon;
                    
                    return (
                      <Link
                        key={booking._id}
                        to="/bookings"
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                          🚜
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {booking.machine?.name || 'Machine'}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(booking.timeSlot?.date || booking.createdAt), 'MMM dd')}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {booking.fieldLocation?.village}
                            </span>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${badge.color}`}>
                          <BadgeIcon className="h-4 w-4" />
                          <span className="hidden sm:inline">{badge.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions / My Machines */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {user?.role === 'farmer' ? (
                  <>
                    <Link
                      to="/machines"
                      className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                    >
                      <Tractor className="h-5 w-5" />
                      <span className="font-medium">Find Machines</span>
                    </Link>
                    <Link
                      to="/bookings"
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Calendar className="h-5 w-5" />
                      <span className="font-medium">My Bookings</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/add-machine"
                      className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="font-medium">Add New Machine</span>
                    </Link>
                    <Link
                      to="/schedule"
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Calendar className="h-5 w-5" />
                      <span className="font-medium">View Schedule</span>
                    </Link>
                    <Link
                      to="/bookings"
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Clock className="h-5 w-5" />
                      <span className="font-medium">Pending Requests</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Location</h2>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.location?.village}</p>
                  <p className="text-sm text-gray-500">
                    {user?.location?.district}, {user?.location?.state}
                  </p>
                </div>
              </div>
            </div>

            {/* Owner's Machines Summary */}
            {user?.role === 'owner' && myMachines.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">My Machines</h2>
                  <span className="text-sm text-gray-500">{myMachines.length} listed</span>
                </div>
                <div className="space-y-3">
                  {myMachines.slice(0, 3).map(machine => (
                    <Link
                      key={machine._id}
                      to={`/machines/${machine._id}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl">
                        🚜
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{machine.name}</p>
                        <p className="text-sm text-primary-600">₹{machine.pricePerHour}/hr</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        machine.availability?.isAvailable ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

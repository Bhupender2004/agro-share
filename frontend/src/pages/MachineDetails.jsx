import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { machineAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  MapPin, 
  Star, 
  Clock, 
  Calendar, 
  Phone, 
  User, 
  ChevronLeft,
  Heart,
  Share2,
  Shield,
  CheckCircle,
  Info,
  Fuel,
  Settings,
  Gauge
} from 'lucide-react';
import toast from 'react-hot-toast';

const MachineDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const machineEmojis = {
    tractor: '🚜',
    harvester: '🌾',
    rotavator: '⚙️',
    seed_drill: '🌱',
    sprayer: '💧',
    thresher: '🔧',
    cultivator: '🛠️',
    plough: '🌾',
    other: '🔩'
  };

  useEffect(() => {
    fetchMachine();
  }, [id]);

  const fetchMachine = async () => {
    try {
      setLoading(true);
      const response = await machineAPI.getOne(id);
      setMachine(response.data.data);
    } catch (error) {
      toast.error('Failed to load machine details');
      navigate('/machines');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a machine');
      navigate('/login');
      return;
    }
    navigate(`/create-booking/${id}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!machine) {
    return null;
  }

  const images = machine.images?.length > 0 
    ? machine.images 
    : [`https://via.placeholder.com/800x600/16a34a/ffffff?text=${machine.type}`];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Machines
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden relative">
              {machine.images?.length > 0 ? (
                <img
                  src={images[activeImage]}
                  alt={machine.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl">
                  {machineEmojis[machine.type] || '🚜'}
                </div>
              )}
              
              {/* Wishlist & Share */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="p-2 bg-white/90 rounded-full hover:bg-white shadow-lg">
                  <Heart className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-2 bg-white/90 rounded-full hover:bg-white shadow-lg">
                  <Share2 className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Available Badge */}
              {machine.availability?.isAvailable && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Available Now
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      activeImage === index ? 'border-primary-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-sm text-primary-600 mb-2">
                <span className="px-2 py-1 bg-primary-50 rounded-full capitalize">
                  {machine.type?.replace('_', ' ')}
                </span>
                {machine.brand && (
                  <span className="text-gray-500">• {machine.brand}</span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{machine.name}</h1>
              
              {/* Rating & Location */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{machine.rating?.toFixed(1) || '4.5'}</span>
                  <span>({machine.totalReviews || 0} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span>
                    {machine.location?.village}, {machine.location?.district}
                  </span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-primary-50 rounded-2xl p-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary-600">₹{machine.pricePerHour}</span>
                <span className="text-gray-600">/hour</span>
              </div>
              {machine.pricePerDay && (
                <p className="text-sm text-gray-600 mt-1">
                  or ₹{machine.pricePerDay}/day (save {Math.round((1 - machine.pricePerDay / (machine.pricePerHour * 8)) * 100)}%)
                </p>
              )}
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-4">
              {machine.specifications?.horsepower && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border">
                  <Gauge className="h-6 w-6 text-primary-600" />
                  <div>
                    <div className="text-sm text-gray-500">Horsepower</div>
                    <div className="font-semibold">{machine.specifications.horsepower} HP</div>
                  </div>
                </div>
              )}
              {machine.specifications?.fuelType && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border">
                  <Fuel className="h-6 w-6 text-primary-600" />
                  <div>
                    <div className="text-sm text-gray-500">Fuel Type</div>
                    <div className="font-semibold capitalize">{machine.specifications.fuelType}</div>
                  </div>
                </div>
              )}
              {machine.yearOfManufacture && (
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border">
                  <Calendar className="h-6 w-6 text-primary-600" />
                  <div>
                    <div className="text-sm text-gray-500">Year</div>
                    <div className="font-semibold">{machine.yearOfManufacture}</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border">
                <Clock className="h-6 w-6 text-primary-600" />
                <div>
                  <div className="text-sm text-gray-500">Min Booking</div>
                  <div className="font-semibold">{machine.availability?.minimumBookingHours || 2} hours</div>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-600" />
                Working Hours
              </h3>
              <div className="flex flex-wrap gap-2">
                {machine.availability?.workingDays?.map(day => (
                  <span key={day} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm capitalize">
                    {day}
                  </span>
                )) || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(day => (
                  <span key={day} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm capitalize">
                    {day}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {machine.availability?.workingHoursStart || '06:00'} - {machine.availability?.workingHoursEnd || '18:00'}
              </p>
            </div>

            {/* Owner Info */}
            {machine.owner && (
              <div className="bg-white rounded-xl border p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Machine Owner</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                      {machine.owner.name?.charAt(0) || 'O'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{machine.owner.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Shield className="h-4 w-4 text-green-500" />
                        Verified Owner
                      </div>
                    </div>
                  </div>
                  {isAuthenticated && machine.owner.phone && (
                    <a
                      href={`tel:${machine.owner.phone}`}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      <Phone className="h-5 w-5" />
                      <span className="hidden sm:inline">Contact</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Book Button */}
            <div className="flex gap-3">
              <button
                onClick={handleBookNow}
                disabled={!machine.availability?.isAvailable}
                className="flex-1 px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-shine"
              >
                {machine.availability?.isAvailable ? 'Book Now' : 'Not Available'}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-green-500" />
                Secure Booking
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Verified Machine
              </div>
              <div className="flex items-center gap-1">
                <Info className="h-4 w-4 text-blue-500" />
                24/7 Support
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {machine.description && (
          <div className="mt-12 bg-white rounded-2xl border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Machine</h2>
            <p className="text-gray-600 leading-relaxed">{machine.description}</p>
          </div>
        )}

        {/* Specifications */}
        {machine.specifications && Object.keys(machine.specifications).length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(machine.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineDetails;

import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, IndianRupee, Tractor } from 'lucide-react';

const machineTypeIcons = {
  tractor: '🚜',
  harvester: '🌾',
  rotavator: '⚙️',
  seed_drill: '🌱',
  sprayer: '💧',
  thresher: '🔧',
  cultivator: '🔨',
  plough: '⛏️',
  water_pump: '🚰',
  other: '🔧'
};

const MachineCard = ({ machine }) => {
  const {
    _id,
    name,
    type,
    location,
    pricing,
    availability,
    rating,
    status
  } = machine;

  const isAvailable = availability?.isAvailable && status === 'active';

  return (
    <Link to={`/machines/${_id}`} className="block">
      <div className="bg-white rounded-xl shadow-md overflow-hidden card-hover border border-gray-100">
        {/* Image/Icon Section */}
        <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <span className="text-7xl">{machineTypeIcons[type] || '🚜'}</span>
          
          {/* Status Badge */}
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
            isAvailable 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {isAvailable ? 'Available' : 'Unavailable'}
          </div>

          {/* Type Badge */}
          <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-gray-700 capitalize">
            {type?.replace('_', ' ')}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {name}
          </h3>

          {/* Location */}
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">
              {location?.village}, {location?.district}
            </span>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            {/* Rating */}
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm font-medium text-gray-700">
                {rating?.average?.toFixed(1) || '0.0'}
              </span>
              <span className="ml-1 text-xs text-gray-400">
                ({rating?.count || 0})
              </span>
            </div>

            {/* Working Hours */}
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              <span>{availability?.workingHoursStart || 8}AM - {availability?.workingHoursEnd || 18}PM</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center text-primary-600">
              <IndianRupee className="h-5 w-5" />
              <span className="text-xl font-bold">{pricing?.ratePerAcre}</span>
              <span className="text-sm text-gray-500 ml-1">/acre</span>
            </div>
            
            <button className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors">
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MachineCard;

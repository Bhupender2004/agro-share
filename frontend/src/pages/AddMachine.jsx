import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { machineAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronLeft, 
  Upload, 
  X, 
  MapPin, 
  DollarSign,
  Clock,
  Settings,
  Info,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AddMachine = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    type: 'tractor',
    brand: '',
    model: '',
    yearOfManufacture: '',
    description: '',
    pricePerHour: '',
    pricePerDay: '',
    location: {
      village: user?.location?.village || '',
      district: user?.location?.district || '',
      state: user?.location?.state || '',
      coordinates: {
        latitude: '',
        longitude: ''
      }
    },
    specifications: {
      horsepower: '',
      fuelType: 'diesel',
      workingWidth: '',
      weight: ''
    },
    availability: {
      isAvailable: true,
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      workingHoursStart: '06:00',
      workingHoursEnd: '18:00',
      minimumBookingHours: 2
    },
    images: []
  });

  const machineTypes = [
    { value: 'tractor', label: 'Tractor', emoji: '🚜' },
    { value: 'harvester', label: 'Harvester', emoji: '🌾' },
    { value: 'rotavator', label: 'Rotavator', emoji: '⚙️' },
    { value: 'seed_drill', label: 'Seed Drill', emoji: '🌱' },
    { value: 'sprayer', label: 'Sprayer', emoji: '💧' },
    { value: 'thresher', label: 'Thresher', emoji: '🔧' },
    { value: 'cultivator', label: 'Cultivator', emoji: '🛠️' },
    { value: 'plough', label: 'Plough', emoji: '🌾' },
    { value: 'other', label: 'Other', emoji: '🔩' }
  ];

  const weekDays = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        setFormData(prev => ({
          ...prev,
          [parts[0]]: { ...prev[parts[0]], [parts[1]]: value }
        }));
      } else if (parts.length === 3) {
        setFormData(prev => ({
          ...prev,
          [parts[0]]: {
            ...prev[parts[0]],
            [parts[1]]: { ...prev[parts[0]][parts[1]], [parts[2]]: value }
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleWorkingDay = (day) => {
    setFormData(prev => {
      const days = prev.availability.workingDays;
      const newDays = days.includes(day)
        ? days.filter(d => d !== day)
        : [...days, day];
      return {
        ...prev,
        availability: { ...prev.availability, workingDays: newDays }
      };
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // In a real app, you'd upload to a server/cloud storage
    // For now, we'll create object URLs
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls].slice(0, 5) // Max 5 images
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (stepNum) => {
    switch (stepNum) {
      case 1:
        if (!formData.name || !formData.type) {
          toast.error('Please fill machine name and type');
          return false;
        }
        return true;
      case 2:
        if (!formData.pricePerHour) {
          toast.error('Please set hourly price');
          return false;
        }
        return true;
      case 3:
        if (!formData.location.village || !formData.location.district || !formData.location.state) {
          toast.error('Please fill all location fields');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      // Clean up the data before sending
      const machineData = {
        ...formData,
        pricePerHour: Number(formData.pricePerHour),
        pricePerDay: formData.pricePerDay ? Number(formData.pricePerDay) : Number(formData.pricePerHour) * 8,
        yearOfManufacture: formData.yearOfManufacture ? Number(formData.yearOfManufacture) : undefined,
        specifications: {
          ...formData.specifications,
          horsepower: formData.specifications.horsepower ? Number(formData.specifications.horsepower) : undefined,
          weight: formData.specifications.weight ? Number(formData.specifications.weight) : undefined
        },
        availability: {
          ...formData.availability,
          minimumBookingHours: Number(formData.availability.minimumBookingHours)
        }
      };

      await machineAPI.create(machineData);
      toast.success('Machine added successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add machine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Your Machine</h1>
          <p className="text-gray-600">List your farm machinery and start earning</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[
            { num: 1, label: 'Details' },
            { num: 2, label: 'Pricing' },
            { num: 3, label: 'Location' },
            { num: 4, label: 'Review' }
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  step >= s.num ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > s.num ? <CheckCircle className="h-5 w-5" /> : s.num}
                </div>
                <span className="text-xs mt-1 text-gray-500">{s.label}</span>
              </div>
              {i < 3 && (
                <div className={`w-16 h-1 mx-2 ${step > s.num ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Details */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-6">
                  <Settings className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-semibold">Machine Details</h2>
                </div>

                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Machine Type *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {machineTypes.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                        className={`p-4 border-2 rounded-xl text-center transition-all ${
                          formData.type === type.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-3xl mb-1">{type.emoji}</div>
                        <div className="text-sm font-medium">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Machine Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., John Deere 5045D Tractor"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Brand */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="e.g., John Deere"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Model */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="e.g., 5045D"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Year */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year of Manufacture</label>
                    <input
                      type="number"
                      name="yearOfManufacture"
                      value={formData.yearOfManufacture}
                      onChange={handleChange}
                      placeholder="e.g., 2020"
                      min="1990"
                      max={new Date().getFullYear()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Horsepower */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Horsepower</label>
                    <input
                      type="number"
                      name="specifications.horsepower"
                      value={formData.specifications.horsepower}
                      onChange={handleChange}
                      placeholder="e.g., 45"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe your machine's condition, features, and any special notes..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Machine Photos</label>
                  <div className="flex flex-wrap gap-4">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative w-24 h-24">
                        <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {formData.images.length < 5 && (
                      <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                        <Upload className="h-6 w-6 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">Add Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Upload up to 5 photos of your machine</p>
                </div>
              </div>
            )}

            {/* Step 2: Pricing & Availability */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-6">
                  <DollarSign className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-semibold">Pricing & Availability</h2>
                </div>

                {/* Pricing */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price per Hour (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        name="pricePerHour"
                        value={formData.pricePerHour}
                        onChange={handleChange}
                        required
                        placeholder="500"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price per Day (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        name="pricePerDay"
                        value={formData.pricePerDay}
                        onChange={handleChange}
                        placeholder={formData.pricePerHour ? String(Number(formData.pricePerHour) * 8) : '4000'}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Leave empty to auto-calculate (8 hours)</p>
                  </div>
                </div>

                {/* Working Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Working Days</label>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleWorkingDay(day.value)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          formData.availability.workingDays.includes(day.value)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Working Hours */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      name="availability.workingHoursStart"
                      value={formData.availability.workingHoursStart}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      name="availability.workingHoursEnd"
                      value={formData.availability.workingHoursEnd}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Minimum Booking */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Booking Hours</label>
                  <select
                    name="availability.minimumBookingHours"
                    value={formData.availability.minimumBookingHours}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                    <option value="3">3 hours</option>
                    <option value="4">4 hours</option>
                    <option value="8">8 hours (Full Day)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-semibold">Machine Location</h2>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700 flex gap-2">
                  <Info className="h-5 w-5 flex-shrink-0" />
                  <p>This helps farmers find machines near their fields. You can use your registered address or a different location.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Village/Town *</label>
                  <input
                    type="text"
                    name="location.village"
                    value={formData.location.village}
                    onChange={handleChange}
                    required
                    placeholder="Enter village or town name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                  <input
                    type="text"
                    name="location.district"
                    value={formData.location.district}
                    onChange={handleChange}
                    required
                    placeholder="Enter district"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <select
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select State</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-semibold">Review & Submit</h2>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-4xl">
                      {machineTypes.find(t => t.value === formData.type)?.emoji || '🚜'}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{formData.name || 'Machine Name'}</h3>
                      <p className="text-gray-500 capitalize">{formData.type?.replace('_', ' ')}</p>
                      {formData.brand && <p className="text-sm text-gray-500">{formData.brand} {formData.model}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Hourly Rate</p>
                      <p className="font-semibold text-primary-600">₹{formData.pricePerHour || '0'}/hour</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Daily Rate</p>
                      <p className="font-semibold text-primary-600">₹{formData.pricePerDay || (Number(formData.pricePerHour) * 8) || '0'}/day</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold">{formData.location.village}, {formData.location.district}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Working Hours</p>
                      <p className="font-semibold">{formData.availability.workingHoursStart} - {formData.availability.workingHoursEnd}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Working Days</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.availability.workingDays.map(day => (
                        <span key={day} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm capitalize">
                          {day.substring(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-xl text-sm text-green-700 flex gap-2">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <p>Your machine listing will be live immediately after submission. You can edit it anytime from your dashboard.</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(prev => prev - 1)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
              
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors btn-shine"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 btn-shine"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    'List Machine'
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMachine;

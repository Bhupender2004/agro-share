import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { machineAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, addDays, isBefore, startOfDay } from 'date-fns';

const CreateBooking = () => {
  const { machineId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    startTime: '08:00',
    duration: 4,
    fieldLocation: {
      village: user?.location?.village || '',
      district: user?.location?.district || '',
      state: user?.location?.state || '',
      fieldArea: ''
    },
    priority: 'normal',
    notes: ''
  });

  const durations = [
    { value: 2, label: '2 hours' },
    { value: 4, label: '4 hours (Half Day)' },
    { value: 6, label: '6 hours' },
    { value: 8, label: '8 hours (Full Day)' }
  ];

  const priorities = [
    { value: 'normal', label: 'Normal', desc: 'Regular scheduling', color: 'gray' },
    { value: 'high', label: 'High Priority', desc: 'Prioritized scheduling', color: 'orange' },
    { value: 'urgent', label: 'Urgent', desc: 'Immediate scheduling needed', color: 'red' }
  ];

  useEffect(() => {
    fetchMachine();
  }, [machineId]);

  const fetchMachine = async () => {
    try {
      setLoading(true);
      const response = await machineAPI.getOne(machineId);
      setMachine(response.data.data);
      
      // Set minimum booking duration from machine settings
      if (response.data.data.availability?.minimumBookingHours) {
        setFormData(prev => ({
          ...prev,
          duration: Math.max(prev.duration, response.data.data.availability.minimumBookingHours)
        }));
      }
    } catch (error) {
      toast.error('Failed to load machine details');
      navigate('/machines');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('fieldLocation.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        fieldLocation: { ...prev.fieldLocation, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const calculateCost = () => {
    if (!machine) return { base: 0, service: 0, total: 0 };
    
    const hourlyRate = machine.pricePerHour;
    const hours = formData.duration;
    let baseCost = hourlyRate * hours;
    
    // Apply day rate discount if booking 8+ hours
    if (hours >= 8 && machine.pricePerDay && machine.pricePerDay < baseCost) {
      baseCost = machine.pricePerDay;
    }
    
    const serviceFee = Math.round(baseCost * 0.05); // 5% service fee
    
    return {
      base: baseCost,
      service: serviceFee,
      total: baseCost + serviceFee
    };
  };

  const validateForm = () => {
    const selectedDate = new Date(formData.date);
    const today = startOfDay(new Date());
    
    if (isBefore(selectedDate, today)) {
      toast.error('Please select a future date');
      return false;
    }

    if (!formData.fieldLocation.village || !formData.fieldLocation.district) {
      toast.error('Please provide your field location');
      return false;
    }

    if (formData.duration < (machine?.availability?.minimumBookingHours || 2)) {
      toast.error(`Minimum booking is ${machine?.availability?.minimumBookingHours || 2} hours`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const [hours, minutes] = formData.startTime.split(':');
      const startDateTime = new Date(formData.date);
      startDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + formData.duration);

      const cost = calculateCost();

      const bookingData = {
        machine: machineId,
        timeSlot: {
          date: formData.date,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString()
        },
        fieldLocation: {
          ...formData.fieldLocation,
          coordinates: {
            latitude: user?.location?.coordinates?.latitude || 0,
            longitude: user?.location?.coordinates?.longitude || 0
          }
        },
        priority: formData.priority,
        notes: formData.notes,
        cost: {
          baseCost: cost.base,
          serviceFee: cost.service,
          totalCost: cost.total
        }
      };

      await bookingAPI.create(bookingData);
      toast.success('Booking request submitted successfully!');
      navigate('/bookings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!machine) {
    return null;
  }

  const cost = calculateCost();
  const minDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const maxDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Machine</h1>
          <p className="text-gray-600">Complete the form below to request a booking</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date & Time */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary-600" />
                    Date & Time
                  </h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Booking Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={minDate}
                        max={maxDate}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                        min={machine.availability?.workingHoursStart || '06:00'}
                        max={machine.availability?.workingHoursEnd || '18:00'}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {durations.map(d => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, duration: d.value }))}
                        disabled={d.value < (machine.availability?.minimumBookingHours || 2)}
                        className={`p-3 border-2 rounded-xl text-center transition-all ${
                          formData.duration === d.value
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${d.value < (machine.availability?.minimumBookingHours || 2) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="font-semibold">{d.value}h</div>
                        <div className="text-xs text-gray-500">₹{machine.pricePerHour * d.value}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Field Location */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary-600" />
                    Field Location
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Village/Town *</label>
                      <input
                        type="text"
                        name="fieldLocation.village"
                        value={formData.fieldLocation.village}
                        onChange={handleChange}
                        required
                        placeholder="Enter village or town name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
                        <input
                          type="text"
                          name="fieldLocation.district"
                          value={formData.fieldLocation.district}
                          onChange={handleChange}
                          required
                          placeholder="Enter district"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Field Area (acres)</label>
                        <input
                          type="number"
                          name="fieldLocation.fieldArea"
                          value={formData.fieldLocation.fieldArea}
                          onChange={handleChange}
                          placeholder="e.g., 5"
                          step="0.5"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Booking Priority</label>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {priorities.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, priority: p.value }))}
                        className={`p-4 border-2 rounded-xl text-left transition-all ${
                          formData.priority === p.value
                            ? p.value === 'urgent' ? 'border-red-500 bg-red-50'
                            : p.value === 'high' ? 'border-orange-500 bg-orange-50'
                            : 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{p.label}</div>
                        <div className="text-xs text-gray-500">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any special requirements or instructions for the operator..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700 flex gap-2">
                  <Info className="h-5 w-5 flex-shrink-0" />
                  <p>
                    The machine owner will confirm your booking. You'll receive a notification once confirmed.
                    Payment is collected after the work is completed.
                  </p>
                </div>

                {/* Submit Button - Desktop */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="hidden lg:flex w-full items-center justify-center px-6 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 btn-shine"
                >
                  {submitting ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Confirm Booking - ₹{cost.total}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
              
              {/* Machine Info */}
              <div className="flex items-start gap-3 pb-4 border-b">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                  🚜
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{machine.name}</h4>
                  <p className="text-sm text-gray-500 capitalize">{machine.type?.replace('_', ' ')}</p>
                  <p className="text-sm text-primary-600 font-medium">₹{machine.pricePerHour}/hour</p>
                </div>
              </div>

              {/* Details */}
              <div className="py-4 space-y-3 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium">{format(new Date(formData.date), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Time</span>
                  <span className="font-medium">{formData.startTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">{formData.duration} hours</span>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="py-4 space-y-3 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Rental Cost</span>
                  <span>₹{cost.base}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Service Fee (5%)</span>
                  <span>₹{cost.service}</span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">₹{cost.total}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Payment after work completion</p>
              </div>

              {/* Submit Button - Mobile */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="lg:hidden w-full mt-6 flex items-center justify-center px-6 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { machineAPI } from '../services/api';
import MachineCard from '../components/MachineCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Filter, MapPin, X, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const Machines = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    search: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const machineTypes = [
    { value: '', label: 'All Types' },
    { value: 'tractor', label: 'Tractor' },
    { value: 'harvester', label: 'Harvester' },
    { value: 'rotavator', label: 'Rotavator' },
    { value: 'seed_drill', label: 'Seed Drill' },
    { value: 'sprayer', label: 'Sprayer' },
    { value: 'thresher', label: 'Thresher' },
    { value: 'cultivator', label: 'Cultivator' },
    { value: 'plough', label: 'Plough' },
    { value: 'other', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'pricePerHour-asc', label: 'Price: Low to High' },
    { value: 'pricePerHour-desc', label: 'Price: High to Low' },
    { value: 'rating-desc', label: 'Highest Rated' }
  ];

  useEffect(() => {
    fetchMachines();
  }, [filters]);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.search) params.search = filters.search;
      params.sortBy = filters.sortBy;
      params.sortOrder = filters.sortOrder;

      const response = await machineAPI.getAll(params);
      let filteredMachines = response.data.data || [];

      // Client-side price filtering
      if (filters.minPrice) {
        filteredMachines = filteredMachines.filter(m => m.pricePerHour >= Number(filters.minPrice));
      }
      if (filters.maxPrice) {
        filteredMachines = filteredMachines.filter(m => m.pricePerHour <= Number(filters.maxPrice));
      }

      setMachines(filteredMachines);
    } catch (error) {
      toast.error('Failed to load machines');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'type') {
      if (value) {
        setSearchParams({ type: value });
      } else {
        setSearchParams({});
      }
    }
  };

  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split('-');
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchParams({});
  };

  const activeFilterCount = [filters.type, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Farm Machines</h1>
          <p className="text-gray-600">Find and book the right machinery for your farm</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border-b sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search machines, brands..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Type Dropdown - Desktop */}
            <div className="hidden lg:block">
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                {machineTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="hidden lg:block">
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Filter Button - Mobile */}
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.type && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                  Type: {machineTypes.find(t => t.value === filters.type)?.label}
                  <button onClick={() => handleFilterChange('type', '')}>
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {filters.minPrice && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                  Min: ₹{filters.minPrice}
                  <button onClick={() => handleFilterChange('minPrice', '')}>
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {filters.maxPrice && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                  Max: ₹{filters.maxPrice}
                  <button onClick={() => handleFilterChange('maxPrice', '')}>
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <LoadingSpinner />
        ) : machines.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚜</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No machines found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{machines.length}</span> machines
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {machines.map(machine => (
                <MachineCard key={machine._id} machine={machine} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white px-4 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Machine Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  {machineTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₹/hour)</label>
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-4 border-t flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Machines;

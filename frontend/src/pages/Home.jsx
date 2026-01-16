import { Link } from 'react-router-dom';
import { 
  Tractor, 
  Calendar, 
  Users, 
  Clock, 
  Shield, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Star,
  MapPin
} from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Tractor,
      title: 'Wide Machine Selection',
      description: 'Access tractors, harvesters, rotavators, and more from verified owners in your area.'
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'AI-powered scheduling optimizes routes and time slots to minimize idle time.'
    },
    {
      icon: Shield,
      title: 'Verified Owners',
      description: 'All machine owners are verified with ratings and reviews from fellow farmers.'
    },
    {
      icon: Clock,
      title: 'Real-time Availability',
      description: 'Check machine availability in real-time and book instantly.'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Farmers Registered' },
    { value: '2,500+', label: 'Machines Listed' },
    { value: '50,000+', label: 'Bookings Completed' },
    { value: '500+', label: 'Villages Covered' }
  ];

  const machineTypes = [
    { name: 'Tractors', emoji: '🚜', count: '1,200+' },
    { name: 'Harvesters', emoji: '🌾', count: '450+' },
    { name: 'Rotavators', emoji: '⚙️', count: '380+' },
    { name: 'Seed Drills', emoji: '🌱', count: '290+' },
    { name: 'Sprayers', emoji: '💧', count: '420+' },
    { name: 'Threshers', emoji: '🔧', count: '180+' }
  ];

  const testimonials = [
    {
      name: 'Ramesh Kumar',
      role: 'Farmer, Punjab',
      content: 'AgroShare helped me find a harvester within hours. The scheduling was perfect and saved me 2 days of waiting!',
      rating: 5
    },
    {
      name: 'Suresh Patel',
      role: 'Machine Owner, Gujarat',
      content: 'My tractor is now earning 40% more thanks to the smart scheduling. The platform handles everything!',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Farmer, Maharashtra',
      content: 'Easy booking, transparent pricing, and reliable machines. This is exactly what farmers needed.',
      rating: 5
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="absolute inset-0 opacity-20 bg-pattern"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full text-sm mb-6 backdrop-blur">
                <span className="animate-pulse-slow mr-2">🌾</span>
                <span>AI-Powered Farm Machinery Platform</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Share Farm Machines,
                <span className="text-accent-400"> Grow Together</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-primary-100 mb-8 max-w-lg">
                Connect with machine owners in your area. Book tractors, harvesters, and more with AI-optimized scheduling for maximum efficiency.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/machines"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-all btn-shine group"
                >
                  Browse Machines
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
                >
                  List Your Machine
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 mt-10 text-sm text-primary-200">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-accent-400" />
                  <span>Verified Owners</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-accent-400" />
                  <span>Secure Booking</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-accent-400" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="hidden lg:flex justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-accent-400 to-primary-400 rounded-full blur-3xl opacity-30"></div>
                <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <div className="text-9xl mb-4">🚜</div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/20 rounded-xl p-3 text-center">
                      <div className="text-2xl mb-1">🌾</div>
                      <div className="text-xs">Harvester</div>
                    </div>
                    <div className="bg-white/20 rounded-xl p-3 text-center">
                      <div className="text-2xl mb-1">💧</div>
                      <div className="text-xs">Sprayer</div>
                    </div>
                    <div className="bg-white/20 rounded-xl p-3 text-center">
                      <div className="text-2xl mb-1">🌱</div>
                      <div className="text-xs">Seed Drill</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Machine Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Find the Right Machine
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse through our extensive collection of farm machinery available for rent in your area.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {machineTypes.map((type, index) => (
              <Link
                key={index}
                to={`/machines?type=${type.name.toLowerCase()}`}
                className="bg-gray-50 rounded-xl p-6 text-center hover:bg-primary-50 hover:shadow-lg transition-all card-hover group"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                  {type.emoji}
                </div>
                <div className="font-semibold text-gray-900">{type.name}</div>
                <div className="text-sm text-primary-600">{type.count}</div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/machines"
              className="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700"
            >
              View All Machines
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AgroShare?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing farm machinery sharing with cutting-edge technology and farmer-first approach.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200"></div>

            {[
              { step: '1', title: 'Search Machines', desc: 'Browse available machines in your area by type, location, and price.' },
              { step: '2', title: 'Book & Schedule', desc: 'Select your preferred date and let our AI optimize the time slot.' },
              { step: '3', title: 'Get Work Done', desc: 'Machine arrives at your field. Pay after completion.' }
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 relative z-10">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Farmers
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See what our community has to say about AgroShare
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of farmers and machine owners who are already benefiting from AgroShare's smart platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-all"
            >
              Create Free Account
            </Link>
            <Link
              to="/machines"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
            >
              Explore Machines
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

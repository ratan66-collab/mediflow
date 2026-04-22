import { useState } from 'react';
import { Search, Star, MapPin, Clock, Filter, User, Stethoscope } from 'lucide-react';

export default function DoctorFinder() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const doctors = [
    {
      id: 1,
      name: "Dr. Priya Sharma",
      specialty: "Cardiologist",
      rating: 4.8,
      reviews: 124,
      experience: "15 years",
      location: "Mumbai, MH",
      availability: "Available Today",
      image: "👩‍⚕️",
      recommended: true
    },
    {
      id: 2,
      name: "Dr. Rahul Verma",
      specialty: "Neurologist",
      rating: 4.9,
      reviews: 89,
      experience: "12 years",
      location: "Delhi, DL",
      availability: "Tomorrow",
      image: "👨‍⚕️",
      recommended: false
    },
    {
      id: 3,
      name: "Dr. Anjali Desai",
      specialty: "Pediatrician",
      rating: 4.7,
      reviews: 156,
      experience: "10 years",
      location: "Bangalore, KA",
      availability: "Available Today",
      image: "👩‍⚕️",
      recommended: true
    },
    {
      id: 4,
      name: "Dr. Vikram Singh",
      specialty: "Orthopedic Surgeon",
      rating: 4.6,
      reviews: 203,
      experience: "20 years",
      location: "Chennai, TN",
      availability: "In 3 days",
      image: "👨‍⚕️",
      recommended: false
    },
    {
      id: 5,
      name: "Dr. Sneha Patel",
      specialty: "Dermatologist",
      rating: 4.9,
      reviews: 178,
      experience: "8 years",
      location: "Hyderabad, TS",
      availability: "Tomorrow",
      image: "👩‍⚕️",
      recommended: true
    },
    {
      id: 6,
      name: "Dr. Amit Kumar",
      specialty: "General Practitioner",
      rating: 4.5,
      reviews: 267,
      experience: "18 years",
      location: "Pune, MH",
      availability: "Available Today",
      image: "👨‍⚕️",
      recommended: false
    }
  ];

  const specialties = ['all', 'Cardiologist', 'Neurologist', 'Pediatrician', 'Orthopedic Surgeon', 'Dermatologist', 'General Practitioner'];
  const locations = ['all', 'Mumbai, MH', 'Delhi, DL', 'Bangalore, KA', 'Chennai, TN', 'Hyderabad, TS', 'Pune, MH'];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    const matchesLocation = selectedLocation === 'all' || doctor.location === selectedLocation;
    
    return matchesSearch && matchesSpecialty && matchesLocation;
  });

  const recommendedDoctors = doctors.filter(doctor => doctor.recommended);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">FIND A DOCTOR</h1>
          <p className="text-gray-400">Connect with qualified healthcare professionals</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-900 rounded-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="flex-1 bg-slate-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>
                  {specialty === 'all' ? 'All Specialties' : specialty}
                </option>
              ))}
            </select>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="flex-1 bg-slate-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {locations.map(location => (
                <option key={location} value={location}>
                  {location === 'all' ? 'All Locations' : location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Recommended Section */}
        {recommendedDoctors.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">AI Recommended</h2>
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-lg p-4 mb-4 border border-yellow-600/30">
              <p className="text-yellow-200 mb-2">Based on your lab results, we recommend these specialists:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedDoctors.map(doctor => (
                  <div key={doctor.id} className="bg-slate-800/50 rounded-lg p-4 border border-yellow-600/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-3xl">{doctor.image}</div>
                      <div>
                        <h3 className="font-semibold">{doctor.name}</h3>
                        <p className="text-sm text-gray-400">{doctor.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{doctor.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{doctor.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Doctor Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doctor => (
            <div key={doctor.id} className="bg-slate-900 rounded-lg p-6 hover:bg-slate-800 transition-colors border border-slate-700">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{doctor.image}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{doctor.name}</h3>
                  <p className="text-blue-400 mb-2">{doctor.specialty}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{doctor.rating}</span>
                      </div>
                      <span className="text-gray-500">({doctor.reviews} reviews)</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>{doctor.experience}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="w-4 h-4" />
                      <span>{doctor.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <span className={`text-sm px-3 py-1 rounded-full ${
                  doctor.availability === 'Available Today' 
                    ? 'bg-green-900/50 text-green-400 border border-green-600/30' 
                    : 'bg-yellow-900/50 text-yellow-400 border border-yellow-600/30'
                }`}>
                  {doctor.availability}
                </span>
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors">
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <Stethoscope className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No doctors found matching your criteria</p>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
}

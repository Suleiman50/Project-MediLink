"use client";

import { useState, useEffect } from 'react';
import { IoClose, IoSearch } from 'react-icons/io5';
import { IoLocationOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  address: string;
  email: string;
  phone: string;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showDoctorDetails, setShowDoctorDetails] = useState<Doctor | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Add class to body to remove background
  useEffect(() => {
    document.body.classList.add("searchpage");
    document.body.style.backgroundColor = "#00BCD4";
    
    return () => {
      document.body.classList.remove("searchpage");
      document.body.style.backgroundColor = "";
    };
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setShowResults(true);
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.doctors) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMore = (doctor: Doctor) => {
    setShowDoctorDetails(doctor);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      {/* Initial Search View */}
      <AnimatePresence>
        {!showResults && !showDoctorDetails && (
          <motion.div 
            className="w-full max-w-4xl mx-4 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Find Your Healthcare Professional</h1>
              <p className="text-xl text-gray-600">Search through our network of qualified doctors and specialists</p>
            </motion.div>
            <motion.div 
              className="flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="flex items-center gap-3 border-2 border-gray-200 bg-white rounded-full p-4 shadow-lg w-[700px]">
                <input
                  type="text"
                  placeholder="Search for Doctors and Categories"
                  className="flex-1 outline-none text-gray-800 text-lg px-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <motion.button
                  onClick={handleSearch}
                  className="p-2 text-[#00BCD4] hover:text-[#00BCD4]/80 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IoSearch size={28} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results Overlay */}
      <AnimatePresence>
        {showResults && (
          <motion.div 
            className="fixed inset-0 bg-black/50 z-40 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className="fixed inset-0 bg-gray-50 bg-opacity-90 bg-[url('/subtle-pattern.png')] z-50 overflow-y-auto pt-20 mt-16"
            >
              <div className="max-w-6xl mx-auto p-8">
                <motion.div 
                  className="flex items-center justify-center mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 border-2 border-gray-200 bg-white rounded-full p-4 shadow-lg w-[700px]">
                    <input
                      type="text"
                      placeholder="Search for Doctors and Categories"
                      className="flex-1 outline-none text-gray-800 text-lg px-4"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <motion.button
                      onClick={handleSearch}
                      className="p-2 text-[#00BCD4] hover:text-[#00BCD4]/80 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IoSearch size={28} />
                    </motion.button>
                  </div>
                </motion.div>
                
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-[#00BCD4]">Search Results</h2>
                  {doctors.length > 0 && (
                    <p className="text-gray-600 mt-2">Found {doctors.length} doctor{doctors.length !== 1 ? 's' : ''}</p>
                  )}
                </div>
                
                {isLoading ? (
                  <motion.div 
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.p 
                      className="text-gray-600"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: [0.7, 1, 0.7] 
                      }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      Searching for doctors...
                    </motion.p>
                  </motion.div>
                ) : doctors.length === 0 ? (
                  <motion.div 
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-gray-600">No doctors found. Try a different search term.</p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="p-6 bg-white rounded-[20px] border border-gray-200 shadow-md hover:shadow-xl transition-all flex flex-col"
                      >
                        <h3 className="text-xl font-semibold text-[#00BCD4] mb-3 border-b border-gray-200 pb-2">{doctor.name}</h3>
                        <p className="text-gray-600 mb-4">{doctor.specialty}</p>
                        <div className="flex items-center text-gray-500 mb-5">
                          <IoLocationOutline className="mr-2 flex-shrink-0" />
                          <span>{doctor.location}</span>
                        </div>
                        <div className="mt-auto">
                          <motion.button
                            onClick={() => handleViewMore(doctor)}
                            className="w-full py-3 px-4 bg-[#00BCD4] rounded-full text-white font-medium hover:bg-[#00BCD4]/90 active:bg-[#00BCD4]/80 transition-colors"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                          >
                            View More
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Doctor Details Modal Overlay */}
      <AnimatePresence>
        {showDoctorDetails && (
          <motion.div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="relative bg-white rounded-[20px] w-full max-w-3xl mx-4 p-10 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <motion.button
                onClick={() => setShowDoctorDetails(null)}
                className="absolute right-5 top-5 bg-white hover:bg-gray-100 p-1 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <IoClose size={24} />
              </motion.button>
              
              <motion.div 
                className="pb-6 mb-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-4xl font-bold text-gray-800 mb-3">
                  {showDoctorDetails.name}
                </h2>
                <p className="text-2xl text-[#00BCD4] font-medium">{showDoctorDetails.specialty}</p>
              </motion.div>
              
              <div className="space-y-8">
                <motion.div 
                  className="bg-gray-50 p-6 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Address</h3>
                  <p className="text-lg text-gray-700">
                    {showDoctorDetails.address}
                  </p>
                </motion.div>
                
                <motion.div 
                  className="bg-gray-50 p-6 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Contact Information</h3>
                  <div className="space-y-4">
                    <p className="text-lg text-gray-700 flex items-center">
                      <svg className="w-6 h-6 mr-3 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {showDoctorDetails.email}
                    </p>
                    <p className="text-lg text-gray-700 flex items-center">
                      <svg className="w-6 h-6 mr-3 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {showDoctorDetails.phone}
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex justify-center mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button
                    onClick={() => setShowDoctorDetails(null)}
                    className="px-8 py-3 bg-[#00BCD4] text-white text-lg font-medium rounded-full shadow-md hover:bg-[#00BCD4]/90 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Close
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
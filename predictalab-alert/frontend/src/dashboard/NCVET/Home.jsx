import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE_URL = "http://localhost:5000/api";

const Home = () => {
  const [stats, setStats] = useState({
    branches: 0,
    students: 0,
    machines: 0,
    maintenanceWorkers: 0,
    itiStaff: 0
  });
  const [locations, setLocations] = useState([]);
  const [itiScores, setItiScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [stateDistribution, setStateDistribution] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const calculateStateDistribution = (locations) => {
    const stateCount = {};
    const cityData = {};
    
    locations.forEach(loc => {
      stateCount[loc.state] = (stateCount[loc.state] || 0) + 1;
      
      // Group by city for better positioning
      const key = `${loc.city}, ${loc.state}`;
      if (!cityData[key]) {
        cityData[key] = {
          city: loc.city,
          state: loc.state,
          count: 0,
          locations: []
        };
      }
      cityData[key].count++;
      cityData[key].locations.push(loc);
    });
    
    const distribution = Object.entries(stateCount)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count);
    
    setStateDistribution(distribution);
  };

  // Accurate latitude/longitude coordinates for Indian cities
  const getCityCoordinates = (city, state) => {
    const cityCoords = {
      // Maharashtra
      "Pune": { lat: 18.5204, lng: 73.8567 },
      "Mumbai": { lat: 19.0760, lng: 72.8777 },
      "Nagpur": { lat: 21.1458, lng: 79.0882 },
      "Nashik": { lat: 19.9975, lng: 73.7898 },
      "Aurangabad": { lat: 19.8762, lng: 75.3433 },
      "Thane": { lat: 19.2183, lng: 72.9781 },
      
      // Gujarat
      "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
      "Surat": { lat: 21.1702, lng: 72.8311 },
      "Vadodara": { lat: 22.3072, lng: 73.1812 },
      "Rajkot": { lat: 22.3039, lng: 70.8022 },
      "Gandhinagar": { lat: 23.2156, lng: 72.6369 },
      
      // Karnataka
      "Bangalore": { lat: 12.9716, lng: 77.5946 },
      "Bengaluru": { lat: 12.9716, lng: 77.5946 },
      "Mysore": { lat: 12.2958, lng: 76.6394 },
      "Mangalore": { lat: 12.9141, lng: 74.8560 },
      "Hubli": { lat: 15.3647, lng: 75.1240 },
      
      // Tamil Nadu
      "Chennai": { lat: 13.0827, lng: 80.2707 },
      "Coimbatore": { lat: 11.0168, lng: 76.9558 },
      "Madurai": { lat: 9.9252, lng: 78.1198 },
      "Salem": { lat: 11.6643, lng: 78.1460 },
      "Tiruchirappalli": { lat: 10.7905, lng: 78.7047 },
      
      // Kerala  
      "Thiruvananthapuram": { lat: 8.5241, lng: 76.9366 },
      "Kochi": { lat: 9.9312, lng: 76.2673 },
      "Kozhikode": { lat: 11.2588, lng: 75.7804 },
      "Thrissur": { lat: 10.5276, lng: 76.2144 },
      
      // Delhi NCR
      "Delhi": { lat: 28.7041, lng: 77.1025 },
      "New Delhi": { lat: 28.6139, lng: 77.2090 },
      "Gurgaon": { lat: 28.4595, lng: 77.0266 },
      "Noida": { lat: 28.5355, lng: 77.3910 },
      "Gurugram": { lat: 28.4595, lng: 77.0266 },
      "Faridabad": { lat: 28.4089, lng: 77.3178 },
      
      // Rajasthan
      "Jaipur": { lat: 26.9124, lng: 75.7873 },
      "Jodhpur": { lat: 26.2389, lng: 73.0243 },
      "Udaipur": { lat: 24.5854, lng: 73.7125 },
      "Kota": { lat: 25.2138, lng: 75.8648 },
      "Ajmer": { lat: 26.4499, lng: 74.6399 },
      
      // Uttar Pradesh
      "Lucknow": { lat: 26.8467, lng: 80.9462 },
      "Kanpur": { lat: 26.4499, lng: 80.3319 },
      "Agra": { lat: 27.1767, lng: 78.0081 },
      "Varanasi": { lat: 25.3176, lng: 82.9739 },
      "Meerut": { lat: 28.9845, lng: 77.7064 },
      "Allahabad": { lat: 25.4358, lng: 81.8463 },
      "Prayagraj": { lat: 25.4358, lng: 81.8463 },
      
      // West Bengal
      "Kolkata": { lat: 22.5726, lng: 88.3639 },
      "Howrah": { lat: 22.5958, lng: 88.2636 },
      "Durgapur": { lat: 23.5204, lng: 87.3119 },
      "Asansol": { lat: 23.6739, lng: 86.9524 },
      
      // Telangana
      "Hyderabad": { lat: 17.3850, lng: 78.4867 },
      "Warangal": { lat: 17.9689, lng: 79.5941 },
      "Nizamabad": { lat: 18.6725, lng: 78.0941 },
      
      // Andhra Pradesh
      "Visakhapatnam": { lat: 17.6868, lng: 83.2185 },
      "Vijayawada": { lat: 16.5062, lng: 80.6480 },
      "Guntur": { lat: 16.3067, lng: 80.4365 },
      "Tirupati": { lat: 13.6288, lng: 79.4192 },
      
      // Madhya Pradesh
      "Bhopal": { lat: 23.2599, lng: 77.4126 },
      "Indore": { lat: 22.7196, lng: 75.8577 },
      "Gwalior": { lat: 26.2183, lng: 78.1828 },
      "Jabalpur": { lat: 23.1815, lng: 79.9864 },
      
      // Punjab
      "Chandigarh": { lat: 30.7333, lng: 76.7794 },
      "Ludhiana": { lat: 30.9010, lng: 75.8573 },
      "Amritsar": { lat: 31.6340, lng: 74.8723 },
      "Jalandhar": { lat: 31.3260, lng: 75.5762 },
      
      // Haryana
      "Rohtak": { lat: 28.8955, lng: 76.6066 },
      "Panipat": { lat: 29.3909, lng: 76.9635 },
      
      // Bihar
      "Patna": { lat: 25.5941, lng: 85.1376 },
      "Gaya": { lat: 24.7955, lng: 84.9994 },
      "Bhagalpur": { lat: 25.2425, lng: 86.9842 },
      "Muzaffarpur": { lat: 26.1225, lng: 85.3906 },
      
      // Jharkhand
      "Ranchi": { lat: 23.3441, lng: 85.3096 },
      "Jamshedpur": { lat: 22.8046, lng: 86.2029 },
      "Dhanbad": { lat: 23.7957, lng: 86.4304 },
      
      // Odisha
      "Bhubaneswar": { lat: 20.2961, lng: 85.8245 },
      "Cuttack": { lat: 20.4625, lng: 85.8830 },
      "Rourkela": { lat: 22.2604, lng: 84.8536 },
      
      // Assam
      "Guwahati": { lat: 26.1445, lng: 91.7362 },
      "Dibrugarh": { lat: 27.4728, lng: 94.9120 },
      "Silchar": { lat: 24.8333, lng: 92.7789 },
      
      // Chhattisgarh
      "Raipur": { lat: 21.2514, lng: 81.6296 },
      "Bhilai": { lat: 21.2094, lng: 81.3783 },
      "Bilaspur": { lat: 22.0797, lng: 82.1409 },
      
      // Uttarakhand
      "Dehradun": { lat: 30.3165, lng: 78.0322 },
      "Haridwar": { lat: 29.9457, lng: 78.1642 },
      "Roorkee": { lat: 29.8543, lng: 77.8880 },
      
      // Himachal Pradesh
      "Shimla": { lat: 31.1048, lng: 77.1734 },
      "Solan": { lat: 30.9045, lng: 77.0967 },
      "Mandi": { lat: 31.7058, lng: 76.9319 },
      
      // Jammu & Kashmir
      "Srinagar": { lat: 34.0837, lng: 74.7973 },
      "Jammu": { lat: 32.7266, lng: 74.8570 },
      
      // Goa
      "Panaji": { lat: 15.4909, lng: 73.8278 },
      "Margao": { lat: 15.2832, lng: 73.9667 },
    };

    // Try exact city match
    if (cityCoords[city]) {
      return cityCoords[city];
    }

    // State-level fallback coordinates
    const stateCoords = {
      "Maharashtra": { lat: 19.7515, lng: 75.7139 },
      "Gujarat": { lat: 22.2587, lng: 71.1924 },
      "Karnataka": { lat: 15.3173, lng: 75.7139 },
      "Tamil Nadu": { lat: 11.1271, lng: 78.6569 },
      "Kerala": { lat: 10.8505, lng: 76.2711 },
      "Rajasthan": { lat: 27.0238, lng: 74.2179 },
      "Madhya Pradesh": { lat: 22.9734, lng: 78.6569 },
      "Uttar Pradesh": { lat: 26.8467, lng: 80.9462 },
      "Bihar": { lat: 25.0961, lng: 85.3131 },
      "West Bengal": { lat: 22.9868, lng: 87.8550 },
      "Punjab": { lat: 31.1471, lng: 75.3412 },
      "Haryana": { lat: 29.0588, lng: 76.0856 },
      "Delhi": { lat: 28.7041, lng: 77.1025 },
      "Goa": { lat: 15.2993, lng: 74.1240 },
      "Andhra Pradesh": { lat: 15.9129, lng: 79.7400 },
      "Telangana": { lat: 18.1124, lng: 79.0193 },
      "Odisha": { lat: 20.9517, lng: 85.0985 },
      "Jharkhand": { lat: 23.6102, lng: 85.2799 },
      "Assam": { lat: 26.2006, lng: 92.9376 },
      "Chhattisgarh": { lat: 21.2787, lng: 81.8661 },
    };

    // Default to India center if nothing found
    return stateCoords[state] || { lat: 20.5937, lng: 78.9629 };
  };

  // More accurate city coordinates for Indian cities (calibrated for Google Maps iframe at zoom 5)
  const getCityPosition = (city, state) => {
    const cityCoords = {
      // Maharashtra
      "Pune": { x: 43.2, y: 56.8 },
      "Mumbai": { x: 39.8, y: 56.2 },
      "Nagpur": { x: 48.5, y: 53.5 },
      "Nashik": { x: 41.2, y: 55.5 },
      "Aurangabad": { x: 42.8, y: 56.2 },
      
      // Gujarat
      "Ahmedabad": { x: 38.5, y: 51.2 },
      "Surat": { x: 38.8, y: 53.8 },
      "Vadodara": { x: 39.2, y: 51.8 },
      "Rajkot": { x: 36.5, y: 51.5 },
      
      // Karnataka
      "Bangalore": { x: 45.2, y: 70.5 },
      "Bengaluru": { x: 45.2, y: 70.5 },
      "Mysore": { x: 44.2, y: 72.5 },
      "Mangalore": { x: 41.8, y: 71.2 },
      
      // Tamil Nadu
      "Chennai": { x: 49.8, y: 73.8 },
      "Coimbatore": { x: 45.2, y: 75.5 },
      "Madurai": { x: 47.2, y: 78.2 },
      
      // Kerala  
      "Thiruvananthapuram": { x: 45.2, y: 82.5 },
      "Kochi": { x: 44.8, y: 78.5 },
      "Kozhikode": { x: 43.8, y: 76.2 },
      
      // Delhi NCR
      "Delhi": { x: 45.2, y: 35.2 },
      "New Delhi": { x: 45.2, y: 35.2 },
      "Gurgaon": { x: 44.8, y: 35.5 },
      "Noida": { x: 45.8, y: 35.0 },
      "Gurugram": { x: 44.8, y: 35.5 },
      
      // Rajasthan
      "Jaipur": { x: 42.5, y: 43.5 },
      "Jodhpur": { x: 39.2, y: 44.2 },
      "Udaipur": { x: 40.5, y: 48.2 },
      "Kota": { x: 43.2, y: 47.8 },
      
      // Uttar Pradesh
      "Lucknow": { x: 49.8, y: 42.8 },
      "Kanpur": { x: 49.5, y: 43.5 },
      "Varanasi": { x: 53.5, y: 46.8 },
      "Agra": { x: 46.5, y: 42.8 },
      "Noida": { x: 45.8, y: 35.2 },
      
      // West Bengal
      "Kolkata": { x: 58.2, y: 51.2 },
      "Howrah": { x: 58.0, y: 51.4 },
      "Durgapur": { x: 57.2, y: 50.5 },
      
      // Bihar
      "Patna": { x: 55.5, y: 46.8 },
      "Gaya": { x: 55.8, y: 48.2 },
      
      // Madhya Pradesh
      "Bhopal": { x: 45.8, y: 51.8 },
      "Indore": { x: 43.5, y: 52.5 },
      "Jabalpur": { x: 49.5, y: 51.5 },
      
      // Telangana
      "Hyderabad": { x: 47.5, y: 65.8 },
      
      // Andhra Pradesh
      "Visakhapatnam": { x: 53.2, y: 66.8 },
      "Vijayawada": { x: 50.2, y: 68.5 },
      
      // Punjab
      "Chandigarh": { x: 44.2, y: 32.8 },
      "Ludhiana": { x: 43.5, y: 32.5 },
      "Amritsar": { x: 42.2, y: 31.8 },
      
      // Haryana
      "Faridabad": { x: 45.5, y: 36.2 },
      "Gurgaon": { x: 44.8, y: 35.5 },
      
      // Odisha
      "Bhubaneswar": { x: 55.8, y: 57.5 },
      "Cuttack": { x: 55.5, y: 57.8 },
      
      // Assam
      "Guwahati": { x: 65.5, y: 43.8 },
      
      // Jharkhand
      "Ranchi": { x: 55.5, y: 51.2 },
      
      // Chhattisgarh
      "Raipur": { x: 52.5, y: 54.8 },
    };

    // Try exact city match first
    if (cityCoords[city]) {
      return cityCoords[city];
    }

    // Fall back to state-level positioning
    const stateCoords = {
      "Maharashtra": { x: 43, y: 56.5 },
      "Gujarat": { x: 38, y: 51.5 },
      "Karnataka": { x: 45, y: 70 },
      "Tamil Nadu": { x: 48.5, y: 75.5 },
      "Kerala": { x: 45, y: 79.5 },
      "Rajasthan": { x: 41, y: 43.5 },
      "Madhya Pradesh": { x: 46.5, y: 50.5 },
      "Uttar Pradesh": { x: 50.5, y: 41.5 },
      "Bihar": { x: 55.5, y: 46.8 },
      "West Bengal": { x: 58.5, y: 50.5 },
      "Punjab": { x: 43, y: 32.5 },
      "Haryana": { x: 44.5, y: 35.5 },
      "Delhi": { x: 45.2, y: 35.2 },
      "Goa": { x: 40.5, y: 69.5 },
      "Andhra Pradesh": { x: 49.5, y: 68.5 },
      "Telangana": { x: 47.5, y: 65.5 },
      "Odisha": { x: 55.5, y: 57.5 },
      "Jharkhand": { x: 55.5, y: 51.5 },
      "Assam": { x: 65.5, y: 43.5 },
      "Chhattisgarh": { x: 52.5, y: 54.5 },
    };

    return stateCoords[state] || { x: 50, y: 50 };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, locationsRes, scoresRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/dashboard/stats`),
        axios.get(`${API_BASE_URL}/dashboard/locations`),
        axios.get(`${API_BASE_URL}/dashboard/iti-scores`)
      ]);

      setStats(statsRes.data.data);
      setLocations(locationsRes.data.data);
      setItiScores(scoresRes.data.data);
      
      // Calculate state distribution for heatmap
      calculateStateDistribution(locationsRes.data.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f4f7fb] w-full min-h-full px-8 pt-6 pb-10">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <StatCard 
          title="Total Branches" 
          value={loading ? "..." : stats.branches.toLocaleString()} 
        />
        <StatCard 
          title="Students" 
          value={loading ? "..." : stats.students.toLocaleString()} 
        />
        <StatCard 
          title="Machines" 
          value={loading ? "..." : stats.machines.toLocaleString()} 
        />
        <StatCard 
          title="Maintenance Workers" 
          value={loading ? "..." : stats.maintenanceWorkers.toLocaleString()} 
        />
        <StatCard 
          title="ITI Staff" 
          value={loading ? "..." : stats.itiStaff.toLocaleString()} 
        />
      </div>

      {/* Map - Interactive ITI Locations with Heatmap Markers */}
      <div className="bg-white border border-[#dbe4f0] rounded-xl p-4 mb-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-3">ITI Distribution Heatmap - India</h3>
        
        {loading ? (
          <div className="w-full h-[600px] rounded-xl flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Loading map...</p>
          </div>
        ) : (
          <div className="relative">
            {/* Leaflet Map with CircleMarkers */}
            <div className="w-full h-[600px] rounded-xl overflow-hidden border-2 border-blue-200">
              <MapContainer 
                center={[20.5937, 78.9629]} 
                zoom={5} 
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* City-level heatmap markers */}
                {(() => {
                  // Group locations by city to get accurate city coordinates
                  const cityGroups = {};
                  locations.forEach(loc => {
                    const key = `${loc.city}, ${loc.state}`;
                    if (!cityGroups[key]) {
                      cityGroups[key] = {
                        city: loc.city,
                        state: loc.state,
                        count: 0,
                        locations: [],
                        // Get coordinates from first location in city
                        lat: getCityCoordinates(loc.city, loc.state).lat,
                        lng: getCityCoordinates(loc.city, loc.state).lng
                      };
                    }
                    cityGroups[key].count++;
                    cityGroups[key].locations.push(loc);
                  });

                  const maxCount = Math.max(...Object.values(cityGroups).map(g => g.count), 1);

                  return Object.values(cityGroups).map((group) => {
                    const intensity = group.count / maxCount;
                    const radius = Math.max(8, Math.min(30, 8 + (group.count * 3)));
                    
                    const getColor = (intensity) => {
                      if (intensity >= 0.8) return '#EF4444';
                      if (intensity >= 0.6) return '#F97316';
                      if (intensity >= 0.4) return '#EAB308';
                      if (intensity >= 0.2) return '#22C55E';
                      return '#3B82F6';
                    };

                    return (
                      <CircleMarker
                        key={`${group.city}-${group.state}`}
                        center={[group.lat, group.lng]}
                        radius={radius}
                        pathOptions={{
                          fillColor: getColor(intensity),
                          fillOpacity: 0.8,
                          color: '#fff',
                          weight: 3
                        }}
                      >
                        <Popup>
                          <div className="text-sm">
                            <div className="font-bold text-base mb-1">{group.city}, {group.state}</div>
                            <div className="text-gray-700">ITIs: <span className="font-semibold">{group.count}</span></div>
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              {group.locations.slice(0, 3).map((loc, idx) => (
                                <div key={idx} className="text-xs text-gray-600 mb-1">
                                  • {loc.name}
                                </div>
                              ))}
                              {group.count > 3 && (
                                <div className="text-xs text-gray-500 italic">+{group.count - 3} more...</div>
                              )}
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  });
                })()}
              </MapContainer>

              {/* Stats overlay */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-xl border-2 border-gray-200 z-[1000] pointer-events-none">
                <p className="text-sm font-bold text-gray-800">Total ITIs: <span className="text-blue-600">{locations.length}</span></p>
                <p className="text-sm text-gray-700 mt-1">States: <span className="text-blue-600">{stateDistribution.length}</span></p>
                {stateDistribution[0] && (
                  <p className="text-xs text-gray-500 mt-2">Top: {stateDistribution[0].state} ({stateDistribution[0].count})</p>
                )}
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-xl border-2 border-gray-200 z-[1000] pointer-events-none">
                <p className="text-xs font-bold text-gray-800 mb-2">ITI Density</p>
                <div className="space-y-1.5">
                  {[
                    { color: '#EF4444', label: 'Very High', range: '80-100%' },
                    { color: '#F97316', label: 'High', range: '60-80%' },
                    { color: '#EAB308', label: 'Medium', range: '40-60%' },
                    { color: '#22C55E', label: 'Low', range: '20-40%' },
                    { color: '#3B82F6', label: 'Very Low', range: '0-20%' }
                  ].map(item => (
                    <div key={item.color} className="flex items-center gap-2">
                      <div 
                        className="w-5 h-5 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[11px] text-gray-700 font-medium">{item.label}</span>
                      <span className="text-[10px] text-gray-500">({item.range})</span>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-gray-500 mt-2 italic border-t pt-2">
                  • Click markers for details
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Dynamic Locations Grid */}
        {!loading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-md">All ITI Branches</h4>
              <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
                {locations.length} {locations.length === 1 ? 'Location' : 'Locations'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
              {locations.map((location) => (
                <div 
                  key={location.itiId}
                  onClick={() => setSelectedLocation(location)}
                  className={`border rounded-lg p-3 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
                    selectedLocation?.itiId === location.itiId
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-700 text-white'
                      : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200'
                  }`}
                  title={`Click to view ${location.name}`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      selectedLocation?.itiId === location.itiId ? 'bg-white' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm truncate ${
                        selectedLocation?.itiId === location.itiId ? 'text-white' : 'text-blue-900'
                      }`} title={location.name}>
                        {location.name}
                      </div>
                      <div className={`text-xs mt-1 ${
                        selectedLocation?.itiId === location.itiId ? 'text-blue-100' : 'text-blue-700'
                      }`}>
                        {location.city}, {location.state}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ITI Score - Full Width */}
      <div className="bg-white border border-[#dbe4f0] rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">ITI Analytics Score</h3>

        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-gray-500">Loading scores...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={itiScores.slice(0, 15)} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                label={{ value: 'Score (0-100)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="score" fill="#60a5fa" name="ITI Score" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Score calculated based on student performance, placement rate, and machine health</p>
        </div>
      </div>

    </div>
  );
};

export default Home;

const StatCard = ({ title, value }) => (
  <div className="bg-white border border-[#dbe4f0] rounded-xl p-5 text-center shadow-sm">
    <div className="text-xl font-bold text-black">{value}</div>
    <div className="text-sm text-gray-500 mt-1">{title}</div>
  </div>
);

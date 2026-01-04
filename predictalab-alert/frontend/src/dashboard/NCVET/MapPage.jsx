import React, { useState, useEffect } from "react";
import { MdArrowDropDown } from "react-icons/md";
import { AiOutlineSearch } from "react-icons/ai";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from "axios";

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_BASE_URL = "http://localhost:5000/api";

const MapPage = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [stats, setStats] = useState({
    totalIssues: 0,
    opened: 0,
    inProgress: 0,
    closed: 0
  });
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch all initial data
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [locationsRes, statsRes, filterOptionsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/map/locations`),
        axios.get(`${API_BASE_URL}/map/stats`),
        axios.get(`${API_BASE_URL}/map/filter-options`)
      ]);

      setLocations(locationsRes.data.data);
      setFilteredLocations(locationsRes.data.data);
      setStats(statsRes.data.data);
      setCities(filterOptionsRes.data.data.cities);
      setStates(filterOptionsRes.data.data.states);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Reset filters when searching
    setSelectedCity("all");
    setSelectedState("all");

    if (query.trim() === "") {
      setFilteredLocations(locations);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/map/search`, {
        params: { query }
      });
      setFilteredLocations(response.data.data);
    } catch (error) {
      console.error("Error searching ITIs:", error);
    }
  };

  // Handle filter changes
  const handleFilterChange = async (city, state) => {
    // Reset search when filtering
    setSearchQuery("");

    try {
      const response = await axios.get(`${API_BASE_URL}/map/filter`, {
        params: {
          city: city === "all" ? "" : city,
          state: state === "all" ? "" : state
        }
      });
      setFilteredLocations(response.data.data);
    } catch (error) {
      console.error("Error filtering ITIs:", error);
    }
  };

  // Handle city dropdown change
  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    handleFilterChange(city, selectedState);
  };

  // Handle state dropdown change
  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    handleFilterChange(selectedCity, state);
  };

  // Get coordinates for cities (real lat/lng)
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
      
      // Karnataka
      "Bangalore": { lat: 12.9716, lng: 77.5946 },
      "Bengaluru": { lat: 12.9716, lng: 77.5946 },
      "Mysore": { lat: 12.2958, lng: 76.6394 },
      
      // Tamil Nadu
      "Chennai": { lat: 13.0827, lng: 80.2707 },
      "Coimbatore": { lat: 11.0168, lng: 76.9558 },
      "Madurai": { lat: 9.9252, lng: 78.1198 },
      
      // Kerala
      "Thiruvananthapuram": { lat: 8.5241, lng: 76.9366 },
      "Kochi": { lat: 9.9312, lng: 76.2673 },
      "Kozhikode": { lat: 11.2588, lng: 75.7804 },
      
      // Delhi NCR
      "Delhi": { lat: 28.7041, lng: 77.1025 },
      "New Delhi": { lat: 28.6139, lng: 77.2090 },
      "Noida": { lat: 28.5355, lng: 77.3910 },
      
      // Rajasthan
      "Jaipur": { lat: 26.9124, lng: 75.7873 },
      "Jodhpur": { lat: 26.2389, lng: 73.0243 },
      "Udaipur": { lat: 24.5854, lng: 73.7125 },
      
      // Uttar Pradesh
      "Lucknow": { lat: 26.8467, lng: 80.9462 },
      "Kanpur": { lat: 26.4499, lng: 80.3319 },
      "Agra": { lat: 27.1767, lng: 78.0081 },
      "Varanasi": { lat: 25.3176, lng: 82.9739 },
      
      // West Bengal
      "Kolkata": { lat: 22.5726, lng: 88.3639 },
      "Howrah": { lat: 22.5958, lng: 88.2636 },
      
      // Telangana
      "Hyderabad": { lat: 17.3850, lng: 78.4867 },
      
      // Andhra Pradesh
      "Visakhapatnam": { lat: 17.6868, lng: 83.2185 },
      "Vijayawada": { lat: 16.5062, lng: 80.6480 },
      
      // Madhya Pradesh
      "Bhopal": { lat: 23.2599, lng: 77.4126 },
      "Indore": { lat: 22.7196, lng: 75.8577 },
      
      // Punjab
      "Chandigarh": { lat: 30.7333, lng: 76.7794 },
      "Ludhiana": { lat: 30.9010, lng: 75.8573 },
      "Amritsar": { lat: 31.6340, lng: 74.8723 },
      
      // Bihar
      "Patna": { lat: 25.5941, lng: 85.1376 },
      
      // Jharkhand
      "Ranchi": { lat: 23.3441, lng: 85.3096 },
      
      // Odisha
      "Bhubaneswar": { lat: 20.2961, lng: 85.8245 },
      
      // Assam
      "Guwahati": { lat: 26.1445, lng: 91.7362 },
      
      // Chhattisgarh
      "Raipur": { lat: 21.2514, lng: 81.6296 },
    };

    // Try exact city match
    if (cityCoords[city]) {
      return cityCoords[city];
    }

    // State-level fallback
    const stateCoords = {
      "Maharashtra": { lat: 19.7515, lng: 75.7139 },
      "Gujarat": { lat: 22.2587, lng: 71.1924 },
      "Karnataka": { lat: 15.3173, lng: 75.7139 },
      "Tamil Nadu": { lat: 11.1271, lng: 78.6569 },
      "Kerala": { lat: 10.8505, lng: 76.2711 },
      "Delhi": { lat: 28.7041, lng: 77.1025 },
      "Rajasthan": { lat: 27.0238, lng: 74.2179 },
      "Uttar Pradesh": { lat: 26.8467, lng: 80.9462 },
      "West Bengal": { lat: 22.9868, lng: 87.8550 },
      "Telangana": { lat: 18.1124, lng: 79.0193 },
      "Andhra Pradesh": { lat: 15.9129, lng: 79.7400 },
      "Madhya Pradesh": { lat: 22.9734, lng: 78.6569 },
      "Punjab": { lat: 31.1471, lng: 75.3412 },
      "Bihar": { lat: 25.0961, lng: 85.3131 },
      "Jharkhand": { lat: 23.6102, lng: 85.2799 },
      "Odisha": { lat: 20.9517, lng: 85.0985 },
      "Assam": { lat: 26.2006, lng: 92.9376 },
      "Chhattisgarh": { lat: 21.2787, lng: 81.8661 },
    };

    return stateCoords[state] || { lat: 20.5937, lng: 78.9629 }; // Default to India center
  };

  return (
    <div className="bg-white w-full min-h-screen px-8 pt-6">

      {/* Search Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-[640px]">
          <AiOutlineSearch className="absolute top-3.5 left-4 text-gray-400 text-lg" />
          <input
            type="text"
            placeholder="Search by ITI name, city, or state..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full border border-[#dbe4f0] rounded-[14px] px-12 py-3 text-sm shadow-sm outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Filters Row - Only City and State */}
      <div className="flex gap-4 mb-5">
        {/* City Dropdown */}
        <div className="relative">
          <select
            value={selectedCity}
            onChange={handleCityChange}
            className="flex items-center justify-between border border-[#dbe4f0] rounded-lg px-4 py-2 text-sm w-[150px] bg-white shadow-sm cursor-pointer appearance-none pr-8 outline-none focus:border-blue-400"
          >
            <option value="all">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <MdArrowDropDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600" />
        </div>

        {/* State Dropdown */}
        <div className="relative">
          <select
            value={selectedState}
            onChange={handleStateChange}
            className="flex items-center justify-between border border-[#dbe4f0] rounded-lg px-4 py-2 text-sm w-[150px] bg-white shadow-sm cursor-pointer appearance-none pr-8 outline-none focus:border-blue-400"
          >
            <option value="all">All States</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <MdArrowDropDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600" />
        </div>

        {/* Results counter */}
        <div className="flex items-center px-4 py-2 text-sm text-gray-600">
          Showing <span className="font-semibold mx-1">{filteredLocations.length}</span> ITI(s)
        </div>
      </div>

      {/* Dynamic Map Section */}
      <div className="border border-[#dbe4f0] rounded-[16px] overflow-hidden shadow-sm mb-6">
        {loading ? (
          <div className="w-full h-[420px] flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Loading map...</p>
          </div>
        ) : (
          <MapContainer 
            center={[20.5937, 78.9629]} 
            zoom={5} 
            style={{ height: '420px', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Dynamic markers for each ITI location */}
            {filteredLocations.map((location) => {
              const coords = getCityCoordinates(location.City, location.State);
              return (
                <Marker
                  key={location.ITI_ID}
                  position={[coords.lat, coords.lng]}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-bold text-base mb-1">{location.Name}</div>
                      <div className="text-gray-700">
                        <strong>City:</strong> {location.City}
                      </div>
                      <div className="text-gray-700">
                        <strong>State:</strong> {location.State}
                      </div>
                      {location.Address && (
                        <div className="text-gray-600 text-xs mt-1">
                          {location.Address}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* Dynamic Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard 
          title="Total Issues" 
          value={loading ? "..." : stats.totalIssues.toLocaleString()} 
          label="Issues" 
        />
        <StatCard 
          title="Reported" 
          value={loading ? "..." : stats.opened.toLocaleString()} 
          label="New" 
        />
        <StatCard 
          title="In Progress" 
          value={loading ? "..." : stats.inProgress.toLocaleString()} 
          label="Progressing" 
        />
        <StatCard 
          title="Total Resolved" 
          value={loading ? "..." : stats.closed.toLocaleString()} 
          label="Done" 
        />
      </div>
    </div>
  );
};

export default MapPage;

const StatCard = ({ title, value, label }) => {
  return (
    <div className="bg-white border border-[#dbe4f0] rounded-[16px] p-5 text-center shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      <h1 className="text-2xl font-bold text-black">{value}</h1>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
  );
};

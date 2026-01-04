// src/pages/LandingPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import image4 from "../assets/image-4.svg";
import imageHero from "../assets/hero.jpg";

import aboutImg1 from "../assets/about1.jpg";
import aboutImg2 from "../assets/about2.jpg";
import course1 from "../assets/course1.jpg";
import course2 from "../assets/course2.jpg";
import course3 from "../assets/course3.jpg";
import course4 from "../assets/course4.jpg";

const API_BASE_URL = "http://localhost:5000/api";

export default function LandingPage() {
  const navigate = useNavigate();
  const courseImages = [course1, course2, course3, course4];
  const [publishedAuctions, setPublishedAuctions] = useState([]);
  const [auctionsLoading, setAuctionsLoading] = useState(false);

  // Fetch published auctions
  useEffect(() => {
    const fetchPublishedAuctions = async () => {
      try {
        setAuctionsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/auctions/published`);
        if (response.data.success) {
          setPublishedAuctions(response.data.data.slice(0, 6)); // Show only 6 recent auctions
        }
      } catch (err) {
        console.error("Error fetching published auctions:", err);
      } finally {
        setAuctionsLoading(false);
      }
    };

    fetchPublishedAuctions();
  }, []);

  return (
    <div className="w-full bg-white min-h-screen">
      {/* HEADER */}
      <header className="w-full flex items-center justify-between px-10 py-4 shadow-sm sticky top-0 bg-white z-50">
        <div className="flex items-center gap-4">
          <img src={image4} alt="NCVET" className="h-[62px]" />
          <h1 className="text-[17px] font-semibold text-gray-800 leading-tight max-w-[390px]">
            National Council for Vocational Education and Training
          </h1>
        </div>

        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#courses">Courses</a>
          <a href="#find">Admissions</a>
          <a href="#schemes">Schemes</a>
        </nav>

        <button
          onClick={() => navigate("/select-role")}
          className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm hover:bg-blue-700 transition"
        >
          Login
        </button>
      </header>

      {/* HERO */}
      <section className="relative w-full h-[420px] overflow-hidden">
        <img src={imageHero} className="w-full h-full object-cover absolute" />

        <div className="absolute inset-0 bg-black/50"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to India ITI Portal
          </h1>
          <p className="max-w-[640px] text-sm">
            Your gateway to India’s network of Government & Private Industrial
            Training Institutes.
          </p>
        </div>
      </section>

      {/* STATS */}
      <div className="relative z-[999] bg-white max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 -mt-12 p-6 rounded-xl shadow-lg">
        <Stat number="15,000+" label="ITIs Across India" />
        <Stat number="3,00,000+" label="Students" />
        <Stat number="90%" label="Placement" />
        <Stat number="130+" label="Courses" />
      </div>

      {/* ABOUT */}
      <section id="about" className="max-w-6xl mx-auto py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">About India ITI Portal</h2>
          <p className="text-gray-600 text-sm mb-6">
            The India ITI Portal is a national platform that provides accurate
            information about Industrial Training Institutes across the country.
          </p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-md">
            Learn More
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <img className="rounded-lg" src={aboutImg1} />
          <img className="rounded-lg" src={aboutImg2} />
        </div>
      </section>

      {/* FIND ITI */}
      <section id="find" className="bg-gray-50 py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">Find an ITI Near You</h2>
        <p className="text-sm text-gray-500 mb-8">
          Search institutes by location and course
        </p>

        <div className="flex justify-center gap-4 mb-6">
          <select className="border p-3 rounded-md w-[180px]">
            <option>Select State</option>
          </select>
          <select className="border p-3 rounded-md w-[180px]">
            <option>Select District</option>
          </select>
          <select className="border p-3 rounded-md w-[180px]">
            <option>Select Course</option>
          </select>
        </div>

        <button className="bg-blue-600 text-white px-8 py-2 rounded-md">
          Search ITI
        </button>
      </section>

      {/* COURSES */}
      <section id="courses" className="max-w-6xl mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold mb-10">Popular Courses Offered</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {["Electrician", "Welder", "Fitter", "AC Technician"].map((c, i) => (
            <div key={c} className="rounded-lg overflow-hidden shadow">
              <img src={courseImages[i]} className="h-40 w-full object-cover" />
              <div className="p-4 font-medium">{c}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PLACEMENTS */}
      <section className="bg-blue-50 py-16 text-center">
        <h2 className="text-2xl font-bold mb-8">Placements</h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatBox number="90%+" label="Placement Rate" />
          <StatBox number="1,50,000+" label="Students Placed" />
          <StatBox number="Pan-India" label="Apprenticeships" />
        </div>

        <h3 className="text-xl font-bold mt-16 mb-6">Hiring Partners</h3>

        <div className="flex flex-wrap justify-center gap-6">
          {["TATA", "Hero", "TVS", "Mahindra", "Yamaha"].map((n) => (
            <div key={n} className="w-28 h-16 bg-white border rounded-lg flex items-center justify-center font-bold text-gray-500">
              {n}
            </div>
          ))}
        </div>
      </section>

      {/* SCHEMES */}
      <section id="schemes" className="max-w-6xl mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold mb-10">
          National Schemes & Initiatives
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Skill Development Program" />
          <Card title="Apprenticeship Support" />
          <Card title="NCVT Guidelines" />
        </div>

        <button className="mt-10 bg-blue-600 text-white px-8 py-2 rounded-md">
          View All Schemes
        </button>
      </section>

      {/* AUCTIONS SECTION */}
      <section id="auctions" className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-gray-900">Live Auctions</h2>
            <p className="text-gray-600">Browse and bid on surplus equipment from ITIs across India</p>
          </div>

          {auctionsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading auctions...</p>
            </div>
          ) : publishedAuctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedAuctions.map((auction) => (
                <div key={auction.itemId} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{auction.itemName}</h3>
                      <p className="text-sm text-gray-500">{auction.itiName || "ITI Equipment"}</p>
                    </div>
                    <div className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
                      Live
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Quantity</span>
                      <span className="font-semibold text-gray-900">{auction.quantity} units</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Base Price</span>
                      <span className="font-bold text-green-600">₹{parseFloat(auction.basePrice).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current Bids</span>
                      <span className="font-semibold text-blue-600">{auction.bids}</span>
                    </div>
                  </div>

                  {auction.itiCity && auction.itiState && (
                    <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {auction.itiCity}, {auction.itiState}
                    </div>
                  )}

                  <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Place Bid
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500">No live auctions at the moment</p>
              <p className="text-sm text-gray-400 mt-2">Check back soon for upcoming equipment auctions</p>
            </div>
          )}

          {publishedAuctions.length > 0 && (
            <div className="text-center mt-8">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                View All Auctions
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-sm">
          <div>
            <h3 className="font-semibold mb-4">India ITI Portal</h3>
            <p className="text-gray-400">
              Empowering skill development across India.
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-10"></p>
      </footer>
    </div>
  );
}

const Stat = ({ number, label }) => (
  <div className="text-center">
    <div className="text-xl font-bold text-blue-600">{number}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

const StatBox = ({ number, label }) => (
  <div className="bg-white p-6 rounded-lg shadow text-center">
    <div className="text-xl font-bold text-blue-700">{number}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

const Card = ({ title }) => (
  <div className="bg-white p-6 rounded-lg shadow text-center">
    <div className="font-semibold">{title}</div>
  </div>
);

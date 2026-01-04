import React, { useState, useEffect } from "react";
import { FaCircle } from "react-icons/fa";
import { BsCheck2All, BsTrash, BsBell } from "react-icons/bs";

const API_BASE_URL = "http://localhost:5000/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readNotifications, setReadNotifications] = useState(new Set());

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/notifications/latest`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      if (data.success && Array.isArray(data.data)) {
        setNotifications(data.data);
      } else if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      
      // Set user-friendly error message
      if (err.message.includes('Failed to fetch') || err.message.includes('ERR_CONNECTION_REFUSED')) {
        setError('Unable to connect to server. Please ensure the backend is running.');
      } else {
        setError(`Failed to load notifications: ${err.message}`);
      }
      
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (index) => {
    setReadNotifications(prev => new Set([...prev, index]));
  };

  const isRead = (index) => {
    return readNotifications.has(index);
  };

  const markAllAsRead = () => {
    const allIndices = notifications.map((_, index) => index);
    setReadNotifications(new Set(allIndices));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="p-6">
      {/* PAGE TITLE */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {error && (
          <button
            onClick={fetchNotifications}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NOTIFICATIONS LIST */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white border rounded-lg p-8 text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
              <p className="text-gray-500 mt-4">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <div className="text-red-600 mb-4">
                <BsBell size={48} className="mx-auto mb-2 opacity-50" />
                <p className="font-semibold">{error}</p>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Please make sure the backend server is running on port 5000.
              </p>
              <button
                onClick={fetchNotifications}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
              <BsBell size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-semibold">No new notifications</p>
              <p className="text-sm mt-2">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((note, index) => (
                <div
                  key={index}
                  onClick={() => markAsRead(index)}
                  className={`border p-4 rounded-lg shadow-sm flex justify-between items-start cursor-pointer transition-colors ${
                    isRead(index) ? 'bg-white' : 'bg-red-50'
                  }`}
                >
                  <div className="flex gap-4">
                    <FaCircle 
                      className={`mt-1 ${isRead(index) ? 'text-gray-300' : 'text-red-500'}`} 
                      size={10} 
                    />

                    <div>
                      <p className="font-semibold text-gray-700">{note.machineName}</p>
                      <p className="text-gray-500 text-sm">{note.issue}</p>
                    </div>
                  </div>

                  <div className="text-right text-sm">
                    <p className="text-gray-500">{note.timeAgo}</p>
                    <p className="text-blue-600 font-medium">Maintenance</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT ACTIONS AREA */}
        <div className="space-y-6">

          {/* Quick Actions */}
          <div className="border bg-white p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>

            <div className="space-y-4 text-blue-600 font-medium text-sm">
              <button 
                onClick={markAllAsRead}
                className="flex items-center gap-2 hover:underline"
              >
                <BsCheck2All size={18} />
                Mark all as read
              </button>

              <button 
                onClick={clearAllNotifications}
                className="flex items-center gap-2 hover:underline"
              >
                <BsTrash size={18} />
                Clear all Notification
              </button>

              <button className="flex items-center gap-2 hover:underline">
                <BsBell size={18} />
                Notification Checks
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

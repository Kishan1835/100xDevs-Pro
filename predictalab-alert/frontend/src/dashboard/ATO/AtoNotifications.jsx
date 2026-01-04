import React, { useState, useEffect } from "react";
import { FaCircle } from "react-icons/fa";
import { BsCheck2All, BsTrash, BsBell } from "react-icons/bs";

export default function AtoNotifications() {
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
      const response = await fetch('http://localhost:5000/api/notifications/latest');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
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
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* NOTIFICATIONS LIST */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading notifications...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No new notifications</div>
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

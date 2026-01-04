import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2, FiRefreshCw } from "react-icons/fi";

const API_BASE_URL = "http://localhost:5000/api/schedules";

// Helper function to format dates without timezone conversion
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export default function AtoSchedulingPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduling, setScheduling] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    filterSchedulesByDate();
  }, [schedules, dateFilter]);

  const filterSchedulesByDate = () => {
    if (dateFilter === 'all') {
      setFilteredSchedules(schedules);
      return;
    }

    const now = new Date();
    const filtered = schedules.filter(schedule => {
      const scheduledDate = new Date(schedule.Scheduled_On);
      
      switch(dateFilter) {
        case 'today':
          return scheduledDate.toDateString() === now.toDateString();
        
        case 'yesterday':
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          return scheduledDate.toDateString() === yesterday.toDateString();
        
        case 'last7days':
          const last7Days = new Date(now);
          last7Days.setDate(last7Days.getDate() - 7);
          return scheduledDate >= last7Days && scheduledDate <= now;
        
        case 'last30days':
          const last30Days = new Date(now);
          last30Days.setDate(last30Days.getDate() - 30);
          return scheduledDate >= last30Days && scheduledDate <= now;
        
        case 'thisMonth':
          return scheduledDate.getMonth() === now.getMonth() && 
                 scheduledDate.getFullYear() === now.getFullYear();
        
        case 'lastMonth':
          const lastMonth = new Date(now);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          return scheduledDate.getMonth() === lastMonth.getMonth() && 
                 scheduledDate.getFullYear() === lastMonth.getFullYear();
        
        default:
          return true;
      }
    });
    
    setFilteredSchedules(filtered);
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }
      
      const data = await response.json();
      const actualSchedules = data.data || data;
      console.log('Raw response data:', data);
      console.log('Actual schedules:', actualSchedules);
      if (actualSchedules.length > 0) {
        console.log('First schedule object:', actualSchedules[0]);
        console.log('Worker data:', actualSchedules[0].worker);
        console.log('Student data:', actualSchedules[0].student);
        console.log('Scheduled_On:', actualSchedules[0].Scheduled_On);
      }
      setSchedules(actualSchedules);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }

      await fetchSchedules();
      alert('Schedule deleted successfully');
    } catch (err) {
      alert('Error deleting schedule: ' + err.message);
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingSchedule(null);
  };

  const handleSaveSuccess = () => {
    fetchSchedules();
    handleCloseModal();
  };

  const handleScheduleMachines = async () => {
    // Get ITI_ID from user (you can modify this based on your auth context)
    const itiId = prompt('Enter ITI ID to schedule machines for:');
    
    if (!itiId || isNaN(itiId)) {
      alert('Please enter a valid ITI ID');
      return;
    }

    if (!window.confirm(`This will automatically schedule all students to available machines for ITI ${itiId}. Continue?`)) {
      return;
    }

    try {
      setScheduling(true);
      const response = await fetch(`${API_BASE_URL}/schedule-machines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itiId: parseInt(itiId),
          timeAllocation: 60 // Default 60 minutes, can be made configurable
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to schedule machines');
      }

      const result = await response.json();
      const data = result.data;

      alert(`✅ Successfully scheduled ${data.count} students to machines!`);
      
      // Refresh the schedules list to show new assignments
      await fetchSchedules();
    } catch (err) {
      alert('Error scheduling machines: ' + err.message);
      console.error('Schedule machines error:', err);
    } finally {
      setScheduling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading schedules...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Failed to load schedules.</p>
          <p>{error}</p>
          <button 
            onClick={fetchSchedules}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Machine Schedule Logs</h1>
        <div className="flex gap-3">
          {/* Date Filter Dropdown */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
          </select>
          {/* Rows Per Page Filter */}
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>Show 5</option>
            <option value={10}>Show 10</option>
            <option value={25}>Show 25</option>
            <option value={50}>Show 50</option>
            <option value={100}>Show 100</option>
            <option value={filteredSchedules.length}>Show All</option>
          </select>
          <button
            onClick={fetchSchedules}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            <FiRefreshCw size={20} />
            Refresh
          </button>
          <button
            onClick={handleScheduleMachines}
            disabled={scheduling}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-green-300 disabled:cursor-not-allowed"
          >
            <FiRefreshCw size={20} className={scheduling ? 'animate-spin' : ''} />
            {scheduling ? 'Scheduling...' : 'Schedule Machines'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <FiPlus size={20} />
            Add Manual Log
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow p-6">
        {schedules.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No schedules found.</p>
            <p className="mt-2">Click "Add Log" to create a new schedule.</p>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No schedules found for the selected date range.</p>
            <p className="mt-2">Try selecting a different date filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="mb-4 text-sm text-gray-600">
              Showing {Math.min(rowsPerPage, filteredSchedules.length)} of {filteredSchedules.length} filtered schedule{filteredSchedules.length !== 1 ? 's' : ''} ({schedules.length} total)
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-gray-600 font-medium">
                  <th className="py-3 px-4">ITI</th>
                  <th className="py-3 px-4">Machine</th>
                  <th className="py-3 px-4">Worker</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Scheduled On</th>
                  <th className="py-3 px-4">Time (hours)</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSchedules.slice(0, rowsPerPage).map((log) => (
                  <tr key={log.S_Log_ID} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {log.iti?.Name || `ITI ${log.ITI_ID}`}
                    </td>
                    <td className="py-3 px-4">
                      {log.machine?.Machine_Name || `Machine ${log.Machine_ID}`}
                    </td>
                    <td className="py-3 px-4">
                      {log.worker?.Name || `Worker ${log.Worker_ID}`}
                    </td>
                    <td className="py-3 px-4">
                      {log.student?.Name || `Student ${log.Student_ID}`}
                    </td>
                    <td className="py-3 px-4">
                      {formatDate(log.Scheduled_On)}
                    </td>
                    <td className="py-3 px-4">{log.Time} hours</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(log)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(log.S_Log_ID)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <AddScheduleModal 
          onClose={handleCloseModal}
          onSuccess={handleSaveSuccess}
          editData={editingSchedule}
        />
      )}
    </div>
  );
}

/* ---------------------- ADD/EDIT MODAL ---------------------- */

function AddScheduleModal({ onClose, onSuccess, editData }) {
  const [formData, setFormData] = useState({
    ITI_ID: editData?.ITI_ID || '',
    Machine_ID: editData?.Machine_ID || '',
    Worker_ID: editData?.Worker_ID || '',
    Student_ID: editData?.Student_ID || '',
    Time: editData?.Time || '',
    Scheduled_On: editData?.Scheduled_On 
      ? new Date(editData.Scheduled_On).toISOString().slice(0, 16)
      : '',
    Completed_At: editData?.Completed_At 
      ? new Date(editData.Completed_At).toISOString().slice(0, 16)
      : '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editData 
        ? `${API_BASE_URL}/${editData.S_Log_ID}`
        : `${API_BASE_URL}`;
      
      const method = editData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save schedule');
      }

      alert(editData ? 'Schedule updated successfully!' : 'Schedule created successfully!');
      onSuccess();
    } catch (err) {
      alert('Error saving schedule: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {editData ? 'Edit Schedule' : 'Add Machine Log'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">ITI ID *</label>
            <input
              type="number"
              required
              className="w-full border rounded-lg px-3 py-2"
              value={formData.ITI_ID}
              onChange={(e) => setFormData({ ...formData, ITI_ID: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Machine ID *</label>
            <input
              type="number"
              required
              className="w-full border rounded-lg px-3 py-2"
              value={formData.Machine_ID}
              onChange={(e) => setFormData({ ...formData, Machine_ID: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Worker ID *</label>
            <input
              type="number"
              required
              className="w-full border rounded-lg px-3 py-2"
              value={formData.Worker_ID}
              onChange={(e) => setFormData({ ...formData, Worker_ID: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Student ID *</label>
            <input
              type="number"
              required
              className="w-full border rounded-lg px-3 py-2"
              value={formData.Student_ID}
              onChange={(e) => setFormData({ ...formData, Student_ID: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Time (minutes) *</label>
            <input
              type="number"
              required
              className="w-full border rounded-lg px-3 py-2"
              value={formData.Time}
              onChange={(e) => setFormData({ ...formData, Time: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Scheduled On *</label>
            <input
              type="datetime-local"
              required
              className="w-full border rounded-lg px-3 py-2"
              value={formData.Scheduled_On}
              onChange={(e) => setFormData({ ...formData, Scheduled_On: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Completed At <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="datetime-local"
              className="w-full border rounded-lg px-3 py-2"
              value={formData.Completed_At}
              onChange={(e) => setFormData({ ...formData, Completed_At: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 border rounded-lg py-2 hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 disabled:bg-blue-300"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (editData ? 'Update' : 'Create')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchComplaintById } from '../../services/api';

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    const loadComplaintDetails = async () => {
      try {
        const complaintData = await fetchComplaintById(id);
        setComplaint(complaintData);
      } catch (error) {
        console.error('Error loading complaint details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadComplaintDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading complaint details...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="page-error">
        <h2>Complaint not found</h2>
        <p>The requested complaint could not be found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/complaints')}>
          Back to Complaints
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <button 
            className="back-button"
            onClick={() => navigate('/complaints')}
          >
            ← Back to Complaints
          </button>
          <h1>Complaint Details #{complaint.id}</h1>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-outline"
            onClick={() => setShowUpdateModal(true)}
          >
            Update Status
          </button>
          <button className="btn btn-primary">
            Assign Technician
          </button>
        </div>
      </div>

      <div className="complaint-details">
        <div className="complaint-overview">
          <div className="overview-card">
            <h3>Complaint Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Branch:</label>
                <span>{complaint.branchName}</span>
              </div>
              <div className="info-item">
                <label>Description:</label>
                <span>{complaint.description}</span>
              </div>
              <div className="info-item">
                <label>Severity:</label>
                <span className={`severity-badge severity-${complaint.severity.toLowerCase()}`}>
                  {complaint.severity}
                </span>
              </div>
              <div className="info-item">
                <label>Status:</label>
                <span className={`status-badge status-${complaint.status.toLowerCase().replace(' ', '-')}`}>
                  {complaint.status}
                </span>
              </div>
              <div className="info-item">
                <label>Last Updated:</label>
                <span>{new Date(complaint.lastUpdated).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <label>ITI Score:</label>
                <span>{complaint.itiScore}/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Complaint Timeline */}
        <div className="complaint-timeline">
          <h3>Activity Timeline</h3>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>Complaint Raised</h4>
                <p>Initial complaint submitted by branch staff</p>
                <span className="timeline-date">Nov 24, 2024 - 2:30 PM</span>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>Under Investigation</h4>
                <p>Technical team assigned to investigate the issue</p>
                <span className="timeline-date">Nov 25, 2024 - 10:15 AM</span>
              </div>
            </div>
            <div className="timeline-item active">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>In Progress</h4>
                <p>Maintenance team working on resolution</p>
                <span className="timeline-date">Nov 26, 2024 - 9:00 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Update Complaint Status</h3>
              <button 
                className="modal-close"
                onClick={() => setShowUpdateModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label>Status:</label>
                  <select defaultValue={complaint.status}>
                    <option value="Raised">Raised</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Solved">Solved</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Comments:</label>
                  <textarea rows="4" placeholder="Add update comments..."></textarea>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowUpdateModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary">
                Update Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetails;
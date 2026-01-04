import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatDate, formatCurrency } from "../../utils/dateUtils";

const API_BASE_URL = "http://localhost:5000/api";

const PrincipalAuction = () => {
  const [pendingAuctions, setPendingAuctions] = useState([]);
  const [approvedAuctions, setApprovedAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending"); // pending or approved

  // Fetch pending auctions
  const fetchPendingAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/auctions/pending`);
      if (response.data.success) {
        setPendingAuctions(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch pending auctions");
      console.error("Error fetching pending auctions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch approved auctions
  const fetchApprovedAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/auctions/approved`);
      if (response.data.success) {
        setApprovedAuctions(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch approved auctions");
      console.error("Error fetching approved auctions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAuctions();
    fetchApprovedAuctions();
  }, []);

  // Approve auction
  const handleApprove = async (itemId) => {
    if (!window.confirm("Are you sure you want to approve this auction?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.patch(`${API_BASE_URL}/auctions/${itemId}/approve`);
      
      if (response.data.success) {
        alert("Auction approved successfully!");
        // Refresh both lists
        fetchPendingAuctions();
        fetchApprovedAuctions();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to approve auction");
      console.error("Error approving auction:", err);
      alert("Failed to approve auction");
    } finally {
      setLoading(false);
    }
  };

  // Reject/Delete auction
  const handleReject = async (itemId) => {
    if (!window.confirm("Are you sure you want to reject and delete this auction?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.delete(`${API_BASE_URL}/auctions/${itemId}`);
      
      if (response.data.success) {
        alert("Auction rejected and removed!");
        fetchPendingAuctions();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reject auction");
      console.error("Error rejecting auction:", err);
      alert("Failed to reject auction");
    } finally {
      setLoading(false);
    }
  };

  const renderAuctionTable = (auctions, showActions = false) => {
    if (auctions.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          No auctions found
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <th className="px-6 py-4 text-left text-sm font-semibold">Item ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Item Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">ITI</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Quantity</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Base Price</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Bids</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Last Updated</th>
              {showActions && (
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {auctions.map((auction, index) => (
              <tr
                key={auction.itemId}
                className={`border-b hover:bg-blue-50 transition-colors ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {auction.itemId}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {auction.itemName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {auction.itiName || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {auction.quantity}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-green-600">
                  {formatCurrency(auction.basePrice)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {auction.bids}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(auction.lastUpdated)}
                </td>
                {showActions && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(auction.itemId)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                                 transition-colors font-medium text-sm shadow-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(auction.itemId)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                                 transition-colors font-medium text-sm shadow-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Auction Approvals</h1>
        <p className="text-gray-600">Review and approve auction items submitted by Training Officers</p>
      </div>

      {/* TABS */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "pending"
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            Pending Approvals
            {pendingAuctions.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                {pendingAuctions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "approved"
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            Approved Auctions
            {approvedAuctions.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                {approvedAuctions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      )}

      {/* TAB CONTENT */}
      {!loading && (
        <>
          {activeTab === "pending" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Pending Auction Approvals
              </h2>
              {renderAuctionTable(pendingAuctions, true)}
            </div>
          )}

          {activeTab === "approved" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Approved Auctions
              </h2>
              {renderAuctionTable(approvedAuctions, false)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PrincipalAuction;

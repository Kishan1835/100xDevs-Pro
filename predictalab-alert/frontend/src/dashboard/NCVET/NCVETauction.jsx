import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatDate, formatCurrency } from "../../utils/dateUtils";

const API_BASE_URL = "http://localhost:5000/api";

const NCVETAuction = () => {
  const [approvedAuctions, setApprovedAuctions] = useState([]);
  const [publishedAuctions, setPublishedAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("approved"); // approved or published

  // Fetch approved but not published auctions
  const fetchApprovedAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/auctions/approved-unpublished`);
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

  // Fetch published auctions
  const fetchPublishedAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/auctions/published`);
      if (response.data.success) {
        setPublishedAuctions(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch published auctions");
      console.error("Error fetching published auctions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedAuctions();
    fetchPublishedAuctions();
  }, []);

  // Publish auction
  const handlePublish = async (itemId) => {
    if (!window.confirm("Are you sure you want to publish this auction to the public?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.patch(`${API_BASE_URL}/auctions/${itemId}/publish`);
      
      if (response.data.success) {
        alert("Auction published successfully!");
        // Refresh both lists
        fetchApprovedAuctions();
        fetchPublishedAuctions();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to publish auction");
      console.error("Error publishing auction:", err);
      alert("Failed to publish auction");
    } finally {
      setLoading(false);
    }
  };

  // Unpublish auction
  const handleUnpublish = async (itemId) => {
    if (!window.confirm("Are you sure you want to unpublish this auction?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.patch(`${API_BASE_URL}/auctions/${itemId}/unpublish`);
      
      if (response.data.success) {
        alert("Auction unpublished successfully!");
        fetchApprovedAuctions();
        fetchPublishedAuctions();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to unpublish auction");
      console.error("Error unpublishing auction:", err);
      alert("Failed to unpublish auction");
    } finally {
      setLoading(false);
    }
  };

  // Reject and delete auction
  const handleReject = async (itemId) => {
    if (!window.confirm("Are you sure you want to reject and delete this auction request? This action cannot be undone.")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.delete(`${API_BASE_URL}/auctions/${itemId}`);
      
      if (response.data.success) {
        alert("Auction request rejected and deleted successfully!");
        fetchApprovedAuctions();
        fetchPublishedAuctions();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reject auction");
      console.error("Error rejecting auction:", err);
      alert("Failed to reject auction");
    } finally {
      setLoading(false);
    }
  };

  const renderAuctionTable = (auctions, showPublish = false, showUnpublish = false, showReject = false) => {
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
              {(showPublish || showUnpublish || showReject) && (
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
                {(showPublish || showReject) && (
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      {showPublish && (
                        <button
                          onClick={() => handlePublish(auction.itemId)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                   transition-colors font-medium text-sm shadow-sm"
                        >
                          Publish
                        </button>
                      )}
                      {showReject && (
                        <button
                          onClick={() => handleReject(auction.itemId)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
                                   transition-colors font-medium text-sm shadow-sm"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                )}
                {showUnpublish && (
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleUnpublish(auction.itemId)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 
                               transition-colors font-medium text-sm shadow-sm"
                    >
                      Unpublish
                    </button>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Auction Publishing</h1>
        <p className="text-gray-600">Manage and publish approved auctions to the public landing page</p>
      </div>

      {/* TABS */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "approved"
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            Ready to Publish
            {approvedAuctions.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                {approvedAuctions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("published")}
            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "published"
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            Published Auctions
            {publishedAuctions.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                {publishedAuctions.length}
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
          {activeTab === "approved" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Approved Auctions Ready to Publish
              </h2>
              {renderAuctionTable(approvedAuctions, true, false, true)}
            </div>
          )}

          {activeTab === "published" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Live Published Auctions
              </h2>
              {renderAuctionTable(publishedAuctions, false, true)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NCVETAuction;

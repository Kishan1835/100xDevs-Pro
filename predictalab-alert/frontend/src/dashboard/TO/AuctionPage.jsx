import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatDate, formatCurrency } from "../../utils/dateUtils";

const API_BASE_URL = "http://localhost:5000/api";

const AuctionPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [itis, setItis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    itemId: "",
    itiId: "",
    itemName: "",
    quantity: "",
    basePrice: "",
  });

  // Fetch all auctions
  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/auctions`);
      if (response.data.success) {
        setAuctions(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch auctions");
      console.error("Error fetching auctions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all ITIs for dropdown
  const fetchItis = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/iti`);
      if (response.data.success) {
        setItis(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching ITIs:", err);
    }
  };

  useEffect(() => {
    fetchAuctions();
    fetchItis();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const resetForm = () => {
    setForm({
      itemId: "",
      itiId: "",
      itemName: "",
      quantity: "",
      basePrice: "",
    });
    setEditingId(null);
  };

  // Create new auction
  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!form.itemId || !form.itemName || !form.quantity || !form.basePrice) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        itemId: parseInt(form.itemId),
        itiId: form.itiId ? parseInt(form.itiId) : null,
        itemName: form.itemName,
        quantity: parseInt(form.quantity),
        basePrice: parseFloat(form.basePrice),
      };

      const response = await axios.post(`${API_BASE_URL}/auctions`, payload);

      if (response.data.success) {
        alert(response.data.message || "Auction added successfully!");
        resetForm();
        fetchAuctions();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to add auction";
      alert(errorMsg);
      console.error("Error adding auction:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update existing auction
  const handleUpdateItem = async (e) => {
    e.preventDefault();

    if (!form.itemName || !form.quantity || !form.basePrice) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        itiId: form.itiId ? parseInt(form.itiId) : null,
        itemName: form.itemName,
        quantity: parseInt(form.quantity),
        basePrice: parseFloat(form.basePrice),
      };

      const response = await axios.put(
        `${API_BASE_URL}/auctions/${editingId}`,
        payload
      );

      if (response.data.success) {
        alert(response.data.message || "Auction updated successfully!");
        resetForm();
        fetchAuctions();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to update auction";
      alert(errorMsg);
      console.error("Error updating auction:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load auction data into form for editing
  const handleEdit = (auction) => {
    setForm({
      itemId: auction.itemId,
      itiId: auction.itiId || "",
      itemName: auction.itemName,
      quantity: auction.quantity,
      basePrice: auction.basePrice,
    });
    setEditingId(auction.itemId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete auction
  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this auction?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(`${API_BASE_URL}/auctions/${itemId}`);

      if (response.data.success) {
        alert(response.data.message || "Auction deleted successfully!");
        fetchAuctions();
        
        // Reset form if we were editing this item
        if (editingId === itemId) {
          resetForm();
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to delete auction";
      alert(errorMsg);
      console.error("Error deleting auction:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-gray-800">
        Auctions Management
      </h1>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add/Edit Auction Item Form */}
      <div className="bg-white border border-[#dbe4f0] rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-5">
          {editingId ? "Edit Auction Item" : "Add New Auction Item"}
        </h2>

        <form
          onSubmit={editingId ? handleUpdateItem : handleAddItem}
          className="grid grid-cols-1 md:grid-cols-5 gap-5"
        >
          {/* Item ID - Only for new items */}
          {!editingId && (
            <div>
              <label className="text-sm text-gray-600">
                Item ID <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="itemId"
                value={form.itemId}
                onChange={handleChange}
                placeholder="Enter Item ID"
                className="w-full mt-1 px-4 py-3 border border-[#dbe4f0] rounded-lg outline-none shadow-sm focus:border-blue-500"
                required
              />
            </div>
          )}

          {/* ITI Dropdown */}
          <div>
            <label className="text-sm text-gray-600">ITI</label>
            <select
              name="itiId"
              value={form.itiId}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 border border-[#dbe4f0] rounded-lg outline-none shadow-sm focus:border-blue-500"
            >
              <option value="">Select ITI </option>
              {itis.map((iti) => (
                <option key={iti.ITI_ID} value={iti.ITI_ID}>
                  {iti.Name} - {iti.City}
                </option>
              ))}
            </select>
          </div>

          {/* Item Name */}
          <div>
            <label className="text-sm text-gray-600">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="itemName"
              value={form.itemName}
              onChange={handleChange}
              placeholder="Enter item name"
              className="w-full mt-1 px-4 py-3 border border-[#dbe4f0] rounded-lg outline-none shadow-sm focus:border-blue-500"
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="text-sm text-gray-600">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
              min="1"
              className="w-full mt-1 px-4 py-3 border border-[#dbe4f0] rounded-lg outline-none shadow-sm focus:border-blue-500"
              required
            />
          </div>

          {/* Base Price */}
          <div>
            <label className="text-sm text-gray-600">
              Base Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="basePrice"
              value={form.basePrice}
              onChange={handleChange}
              placeholder="Enter price"
              min="0.01"
              step="0.01"
              className="w-full mt-1 px-4 py-3 border border-[#dbe4f0] rounded-lg outline-none shadow-sm focus:border-blue-500"
              required
            />
          </div>

          {/* Submit Buttons */}
          <div className={`flex items-end gap-2 ${!editingId ? 'md:col-start-5' : ''}`}>
            {editingId ? (
              <>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Item"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Item"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Auction Items Table */}
      <div className="bg-white border border-[#dbe4f0] rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-5">All Auction Items</h2>

        {loading && auctions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Loading auctions...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="text-left py-3 px-2">Item ID</th>
                  <th className="text-left py-3 px-2">ITI Name</th>
                  <th className="text-left py-3 px-2">Item Name</th>
                  <th className="text-left py-3 px-2">Quantity</th>
                  <th className="text-left py-3 px-2">Base Price</th>
                  <th className="text-left py-3 px-2">Last Updated</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {auctions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-gray-400">
                      No auction items found. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  auctions.map((auction) => (
                    <tr
                      key={auction.itemId}
                      className={`border-b last:border-none ${
                        editingId === auction.itemId ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="py-3 px-2 font-medium">
                        {auction.itemId}
                      </td>
                      <td className="py-3 px-2">
                        {auction.itiName}
                        {auction.itiCity && (
                          <span className="text-xs text-gray-500 block">
                            {auction.itiCity}, {auction.itiState}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 font-medium">
                        {auction.itemName}
                      </td>
                      <td className="py-3 px-2">{auction.quantity}</td>
                      <td className="py-3 px-2 font-semibold text-green-700">
                        {formatCurrency(auction.basePrice)}
                      </td>
                      <td className="py-3 px-2 text-gray-500 text-xs">
                        {formatDate(auction.lastUpdated)}
                      </td>
                      <td className="py-3 px-2 space-x-3">
                        <button
                          onClick={() => handleEdit(auction)}
                          className="text-blue-600 hover:underline font-medium"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(auction.itemId)}
                          className="text-red-600 hover:underline font-medium"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionPage;

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const API_BASE_URL = "http://localhost:5000/api";

const ReportsPage = () => {
  const { itiId } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[ReportsPage] itiId from params:', itiId);
    if (itiId) {
      fetchReportData();
    } else {
      console.error('[ReportsPage] No itiId found in URL params');
      setError("No ITI ID provided");
      setLoading(false);
    }
  }, [itiId]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      console.log('[ReportsPage] Fetching report for ITI:', itiId);
      const response = await axios.get(`${API_BASE_URL}/branches/${itiId}/report-data`);
      console.log('[ReportsPage] Report data received:', response.data);
      setReport(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching report data:", err);
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || err.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      console.log('[ReportsPage] Starting PDF download...');
      const element = reportRef.current;
      
      if (!element) {
        console.error('[ReportsPage] Report element not found');
        alert('Report content not ready. Please try again.');
        return;
      }

      // Create a clean wrapper
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'background: white; padding: 20px; width: 800px; font-family: Arial, sans-serif;';
      
      // Clone the content
      const clone = element.cloneNode(true);
      
      // Strip all class names and replace with inline styles
      const stripClasses = (el) => {
        if (el.nodeType === 1) { // Element node
          el.removeAttribute('class');
          
          // Set safe inline styles
          if (el.tagName === 'DIV') {
            el.style.cssText = 'background: white; color: black; border-color: #cccccc;';
          } else if (el.tagName === 'H1' || el.tagName === 'H2') {
            el.style.cssText = 'color: black; font-weight: bold; margin: 10px 0;';
          } else if (el.tagName === 'SPAN' || el.tagName === 'P') {
            el.style.cssText = 'color: black;';
          } else if (el.tagName === 'BUTTON') {
            el.style.display = 'none'; // Hide buttons in PDF
          }
          
          // Recursively process children
          Array.from(el.children).forEach(child => stripClasses(child));
        }
      };
      
      stripClasses(clone);
      wrapper.appendChild(clone);
      
      // Temporarily add to DOM
      wrapper.style.position = 'absolute';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
      document.body.appendChild(wrapper);

      console.log('[ReportsPage] Converting HTML to canvas...');
      const canvas = await html2canvas(wrapper, {
        scale: 2,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800,
        onclone: (clonedDoc) => {
          // Extra safety: ensure no oklch in cloned document
          const allEls = clonedDoc.querySelectorAll('*');
          allEls.forEach(el => {
            el.style.color = 'black';
            el.style.backgroundColor = 'white';
            el.style.borderColor = '#cccccc';
          });
        }
      });

      // Clean up
      document.body.removeChild(wrapper);

      console.log('[ReportsPage] Canvas created, generating PDF...');
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const filename = `ITI_Report_${report?.instituteProfile.name.replace(/\s+/g, '_') || 'Unknown'}.pdf`;
      pdf.save(filename);
      
      console.log('[ReportsPage] PDF downloaded successfully');
    } catch (err) {
      console.error('[ReportsPage] PDF Error:', err.message);
      alert('Failed to generate PDF: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#f6f9fc] min-h-screen p-8 flex items-center justify-center">
        <p className="text-gray-500">Loading report data...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="bg-[#f6f9fc] min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Report not found"}</p>
          <button
            onClick={() => navigate("/ncv/dashboard/branches")}
            className="text-blue-600 hover:underline"
          >
            ← Back to Branches
          </button>
        </div>
      </div>
    );
  }

  const { instituteProfile, infrastructure, staffTraining, students } = report;

  return (
    <div className="bg-[#f6f9fc] min-h-screen p-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Institute Report</h1>
        <button
          onClick={() => navigate(`/ncv/dashboard/branches/${itiId}`)}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          ← Back to Branch Details
        </button>
      </div>

      {/* Report Content */}
      <div ref={reportRef}>
        {/* Institute Profile */}
        <Section title="Institute Profile">
          <Row label="Name" value={instituteProfile.name} />
          <Row label="Address" value={instituteProfile.address} />
          <Row label="State" value={instituteProfile.state} />
          <Row label="City" value={instituteProfile.city} />
          <Row label="Established Year" value={instituteProfile.establishedYear} />
          <Row label="Contact" value={instituteProfile.contact || 'N/A'} />
          <Row 
            label="ITI Score" 
            value={`${instituteProfile.itiScore?.toFixed(1) || '0'}/100`} 
          />
          <Row 
            label="Trades Offered" 
            value={instituteProfile.tradesOffered?.length > 0 
              ? instituteProfile.tradesOffered.join(", ") 
              : 'N/A'
            } 
          />
        </Section>

        {/* Infrastructure Details */}
        <Section title="Infrastructure Details">
          <Row label="Total Machines" value={infrastructure.totalMachines} />
          <Row label="Healthy Machines" value={infrastructure.healthyMachines} />
        </Section>

        {/* Staff & Training */}
        <Section title="Staff & Training">
          <Row label="ITI Staff Count" value={staffTraining.itiStaffCount} />
          <Row label="Maintenance Workers Count" value={staffTraining.maintenanceWorkersCount} />
        </Section>

        {/* Students */}
        <Section title="Students">
          <Row label="Total Students" value={students.totalStudents} />
          <Row label="Placed Students" value={students.placedStudents} />
          <Row 
            label="Placement Rate" 
            value={students.totalStudents > 0 
              ? `${((students.placedStudents / students.totalStudents) * 100).toFixed(1)}%`
              : 'N/A'
            } 
          />
        </Section>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-10">
        <button 
          onClick={() => window.print()}
          className="px-6 py-2 rounded-lg border bg-white hover:bg-gray-50 transition"
        >
          Preview/Print
        </button>
        <button 
          onClick={handleDownloadPDF}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default ReportsPage;

/* ---------- Reusable UI Components ---------- */

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
      {children}
    </div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between border-b last:border-none py-1">
    <span className="text-gray-600 text-sm">{label}</span>
    <span className="font-medium text-sm text-gray-900">{value}</span>
  </div>
);


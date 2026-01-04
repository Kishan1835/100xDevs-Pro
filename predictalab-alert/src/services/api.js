// Mock data for the dashboard
const mockData = {
  branches: [
    {
      id: 1,
      name: "ANNA ITI",
      address: "Chennai, Tamil Nadu",
      status: "Active",
      totalMachines: 45,
      workingMachines: 42,
      students: 120,
      workforce: 15,
      lastUpdated: "2024-11-26T10:30:00Z"
    },
    {
      id: 2,
      name: "Delhi ITI",
      address: "New Delhi, Delhi",
      status: "Active",
      totalMachines: 38,
      workingMachines: 35,
      students: 98,
      workforce: 12,
      lastUpdated: "2024-11-26T09:15:00Z"
    },
    {
      id: 3,
      name: "Mumbai ITI",
      address: "Mumbai, Maharashtra", 
      status: "Maintenance",
      totalMachines: 52,
      workingMachines: 48,
      students: 140,
      workforce: 18,
      lastUpdated: "2024-11-26T08:45:00Z"
    }
  ],

  complaints: [
    {
      id: 1,
      branchId: 1,
      branchName: "ANNA ITI",
      issueRaised: 5,
      inProgress: 2,
      solved: 18,
      severity: "High",
      itiScore: 8.5,
      lastUpdated: "2024-11-26",
      description: "Machine maintenance issue",
      status: "In Progress"
    },
    {
      id: 2,
      branchId: 2,
      branchName: "Delhi ITI",
      issueRaised: 3,
      inProgress: 1,
      solved: 12,
      severity: "Medium",
      itiScore: 9.2,
      lastUpdated: "2024-11-25",
      description: "Power supply problems",
      status: "Raised"
    },
    {
      id: 3,
      branchId: 3,
      branchName: "Mumbai ITI",
      issueRaised: 7,
      inProgress: 4,
      solved: 25,
      severity: "Low",
      itiScore: 7.8,
      lastUpdated: "2024-11-24",
      description: "Software update required",
      status: "Solved"
    }
  ],

  machines: [
    {
      id: 1,
      name: "CNC Machine 001",
      type: "CNC Lathe",
      branchId: 1,
      branchName: "ANNA ITI",
      status: "Working",
      lastMaintenance: "2024-11-20",
      nextMaintenance: "2024-12-20",
      efficiency: 95
    },
    {
      id: 2,
      name: "Welding Station 005",
      type: "Arc Welding",
      branchId: 1,
      branchName: "ANNA ITI",
      status: "Under Maintenance",
      lastMaintenance: "2024-11-15",
      nextMaintenance: "2024-12-15",
      efficiency: 78
    },
    {
      id: 3,
      name: "Drill Press 003",
      type: "Drilling Machine",
      branchId: 2,
      branchName: "Delhi ITI",
      status: "Working",
      lastMaintenance: "2024-11-18",
      nextMaintenance: "2024-12-18",
      efficiency: 88
    }
  ],

  dashboardStats: {
    totalBranches: 25,
    totalStudents: 2450,
    totalMachines: 380,
    totalComplaints: 15,
    totalTechnicians: 145,
    workingMachines: 352,
    complaintsRaised: 15,
    complaintsInProgress: 7,
    complaintsSolved: 55
  },

  recentActivities: [
    {
      id: 1,
      type: "Machine Maintenance",
      description: "CNC Machine 001 maintenance completed",
      timestamp: "2024-11-26T10:30:00Z",
      branchName: "ANNA ITI"
    },
    {
      id: 2,
      type: "New Complaint",
      description: "Power supply issue reported",
      timestamp: "2024-11-26T09:15:00Z",
      branchName: "Delhi ITI"
    },
    {
      id: 3,
      type: "Student Enrollment",
      description: "25 new students enrolled",
      timestamp: "2024-11-26T08:45:00Z",
      branchName: "Mumbai ITI"
    }
  ],

  chartData: {
    machineHealthTrend: [
      { month: 'Jan', healthy: 85, needsMaintenance: 15 },
      { month: 'Feb', healthy: 88, needsMaintenance: 12 },
      { month: 'Mar', healthy: 82, needsMaintenance: 18 },
      { month: 'Apr', healthy: 91, needsMaintenance: 9 },
      { month: 'May', healthy: 89, needsMaintenance: 11 },
      { month: 'Jun', healthy: 93, needsMaintenance: 7 }
    ],
    
    complaintTrend: [
      { month: 'Jan', raised: 12, solved: 10 },
      { month: 'Feb', raised: 8, solved: 11 },
      { month: 'Mar', raised: 15, solved: 13 },
      { month: 'Apr', raised: 6, solved: 14 },
      { month: 'May', raised: 9, solved: 8 },
      { month: 'Jun', raised: 7, solved: 12 }
    ],

    itiPerformance: [
      { name: 'ANNA ITI', score: 8.5 },
      { name: 'Delhi ITI', score: 9.2 },
      { name: 'Mumbai ITI', score: 7.8 },
      { name: 'Bangalore ITI', score: 8.9 },
      { name: 'Kolkata ITI', score: 8.1 }
    ]
  }
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API functions
export const fetchDashboardStats = async () => {
  await delay(500);
  return mockData.dashboardStats;
};

export const fetchBranches = async () => {
  await delay(300);
  return mockData.branches;
};

export const fetchBranchById = async (id) => {
  await delay(300);
  return mockData.branches.find(branch => branch.id === parseInt(id));
};

export const fetchComplaints = async () => {
  await delay(400);
  return mockData.complaints;
};

export const fetchComplaintById = async (id) => {
  await delay(300);
  return mockData.complaints.find(complaint => complaint.id === parseInt(id));
};

export const fetchMachines = async (branchId = null) => {
  await delay(350);
  if (branchId) {
    return mockData.machines.filter(machine => machine.branchId === parseInt(branchId));
  }
  return mockData.machines;
};

export const fetchRecentActivities = async () => {
  await delay(200);
  return mockData.recentActivities;
};

export const fetchChartData = async (chartType) => {
  await delay(300);
  return mockData.chartData[chartType];
};

// Search functionality
export const searchData = async (query) => {
  await delay(400);
  const results = {
    branches: mockData.branches.filter(branch => 
      branch.name.toLowerCase().includes(query.toLowerCase()) ||
      branch.address.toLowerCase().includes(query.toLowerCase())
    ),
    machines: mockData.machines.filter(machine =>
      machine.name.toLowerCase().includes(query.toLowerCase()) ||
      machine.type.toLowerCase().includes(query.toLowerCase())
    ),
    complaints: mockData.complaints.filter(complaint =>
      complaint.description.toLowerCase().includes(query.toLowerCase()) ||
      complaint.branchName.toLowerCase().includes(query.toLowerCase())
    )
  };
  return results;
};
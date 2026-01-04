// Mock user data
const mockUsers = {
  'NCVET_ADMIN': {
    id: 1,
    name: 'Dr. Rajesh Kumar',
    role: 'NCVET_ADMIN',
    email: 'admin@ncvet.gov.in',
    permissions: ['VIEW_ALL', 'MANAGE_BRANCHES', 'MANAGE_POLICIES', 'VIEW_REPORTS']
  },
  'PRINCIPAL': {
    id: 2,
    name: 'Mrs. Priya Sharma',
    role: 'PRINCIPAL',
    email: 'principal@annaiti.edu.in',
    branchId: 1,
    branchName: 'ANNA ITI',
    permissions: ['VIEW_BRANCH', 'MANAGE_STUDENTS', 'MANAGE_STAFF', 'VIEW_MACHINES']
  },
  'TO': {
    id: 3,
    name: 'Mr. Amit Patel',
    role: 'TO',
    email: 'training@annaiti.edu.in',
    branchId: 1,
    branchName: 'ANNA ITI',
    permissions: ['VIEW_BRANCH', 'MANAGE_TRAINING', 'VIEW_MACHINES', 'MANAGE_COMPLAINTS']
  },
  'ATO': {
    id: 4,
    name: 'Ms. Sunita Rao',
    role: 'ATO',
    email: 'ato@annaiti.edu.in',
    branchId: 1,
    branchName: 'ANNA ITI',
    permissions: ['VIEW_BRANCH', 'ASSIST_TRAINING', 'MANAGE_COMPLAINTS']
  }
};

// Get current user from localStorage or return default
export const getCurrentUser = () => {
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  
  // Return default user for demo - NCVET_ADMIN
  const defaultUser = mockUsers.NCVET_ADMIN;
  localStorage.setItem('currentUser', JSON.stringify(defaultUser));
  return defaultUser;
};

// Login function
export const login = async (credentials) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const { email, password, role } = credentials;
  
  // Mock authentication - in real app, this would verify against server
  if (password === 'demo123') {
    const user = mockUsers[role] || mockUsers.NCVET_ADMIN;
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  } else {
    throw new Error('Invalid credentials');
  }
};

// Logout function
export const logout = () => {
  localStorage.removeItem('currentUser');
};

// Check if user has specific permission
export const hasPermission = (permission) => {
  const user = getCurrentUser();
  return user?.permissions?.includes(permission) || false;
};

// Get user role
export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role;
};

// Switch role for demo purposes
export const switchUserRole = (newRole) => {
  if (mockUsers[newRole]) {
    const newUser = mockUsers[newRole];
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return newUser;
  }
  throw new Error('Invalid role');
};

// Role-based access control helper
export const canAccess = (requiredRoles, userRole = null) => {
  const role = userRole || getUserRole();
  return requiredRoles.includes(role);
};

// Get branch access for user
export const getBranchAccess = () => {
  const user = getCurrentUser();
  if (user.role === 'NCVET_ADMIN') {
    return 'ALL_BRANCHES';
  }
  return user.branchId || null;
};
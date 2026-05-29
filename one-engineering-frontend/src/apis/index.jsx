const backendDomain = 'http://localhost:3000';

const SummaryApi = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  signUp:          { url: `${backendDomain}/api/users/signup`,          method: 'post' },
  signIn:          { url: `${backendDomain}/api/users/login`,           method: 'post' },
  logout:          { url: `${backendDomain}/api/users/logout`,          method: 'post' },
  forgotPassword:  { url: `${backendDomain}/api/users/forgot-password`, method: 'post' },

  // ── Users ─────────────────────────────────────────────────────────────────
  getAllUsers:           { url: `${backendDomain}/api/users`,                 method: 'get' },
  getUserById:          { url: `${backendDomain}/api/users/id`,              method: 'get' },
  getUserByEmployeeId:  { url: `${backendDomain}/api/users/employee`,        method: 'get' },
  getUsersByDepartment: { url: `${backendDomain}/api/users/department`,      method: 'get' },
  getUsersByRole:       { url: `${backendDomain}/api/users/role`,            method: 'get' },
  getUsersByManager:    { url: `${backendDomain}/api/users/manager`,         method: 'get' },

  // ── Projects ──────────────────────────────────────────────────────────────
  getProjects:    { url: `${backendDomain}/api/projects`, method: 'get'    },
  createProject:  { url: `${backendDomain}/api/projects`, method: 'post'   },
  getProjectById: { url: `${backendDomain}/api/projects`, method: 'get'    },
  updateProject:  { url: `${backendDomain}/api/projects`, method: 'put'    },
  deleteProject:  { url: `${backendDomain}/api/projects`, method: 'delete' },

  // ── Departmental Hours ────────────────────────────────────────────────────
  getDeptHours:    { url: `${backendDomain}/api/dept-hours`, method: 'get'  },
  upsertDeptHours: { url: `${backendDomain}/api/dept-hours`, method: 'post' },

  // ── Allocations ───────────────────────────────────────────────────────────
  getAllocations:    { url: `${backendDomain}/api/allocations`, method: 'get'    },
  allocateEmployee: { url: `${backendDomain}/api/allocations`, method: 'post'   },
  removeAllocation: { url: `${backendDomain}/api/allocations`, method: 'delete' },

  // ── Weekly Plans ──────────────────────────────────────────────────────────
  getWeeklyPlans:          { url: `${backendDomain}/api/weekly-plans`,                   method: 'get'  },
  upsertWeeklyPlan:        { url: `${backendDomain}/api/weekly-plans`,                   method: 'post' },
  getAllWeeklyPlans:        { url: `${backendDomain}/api/weekly-plans/all`,               method: 'get'  },
  bulkUpsertWeeklyPlan:    { url: `${backendDomain}/api/weekly-plans/bulk`,              method: 'post' },
  getEmployeeWeekCapacity: { url: `${backendDomain}/api/weekly-plans/employee-capacity`, method: 'get'  },

  // ── Weekly Cap ────────────────────────────────────────────────────────────
  getWeeklyCap: { url: `${backendDomain}/api/weekly-cap`, method: 'get' },

  // ── Weekly Project Config ─────────────────────────────────────────────────
  getWeeklyProjectConfig:    { url: `${backendDomain}/api/weekly-project-config`, method: 'get'  },
  upsertWeeklyProjectConfig: { url: `${backendDomain}/api/weekly-project-config`, method: 'post' },

  // ── Work Logs ─────────────────────────────────────────────────────────────
  getWorkLogs:          { url: `${backendDomain}/api/work-logs`,                   method: 'get'  },
  submitWorkLog:        { url: `${backendDomain}/api/work-logs`,                   method: 'post' },
  getEmployeeProjects:  { url: `${backendDomain}/api/work-logs/employee-projects`, method: 'get'  },
  managerUpdateWorkLog: { url: `${backendDomain}/api/work-logs/manager-update`,    method: 'post' },

  // ── Team ──────────────────────────────────────────────────────────────────
  getTeamMembers: { url: `${backendDomain}/api/users/team`, method: 'get' },

  // ── Weekly Summary ────────────────────────────────────────────────────────
  getWeeklySummary: { url: `${backendDomain}/api/weekly-summary`, method: 'get' },

  // ── Reports ───────────────────────────────────────────────────────────────
  generateReport: { url: `${backendDomain}/api/reports/generate`, method: 'post' },

  // ── Audit Logs ────────────────────────────────────────────────────────────
  getAuditLogs: { url: `${backendDomain}/api/audit-logs`, method: 'get' },

  // ── Project Progress ──────────────────────────────────────────────────────
  getProjectProgress:    { url: `${backendDomain}/api/project-progress`, method: 'get'  },
  upsertProjectProgress: { url: `${backendDomain}/api/project-progress`, method: 'post' },
};

export default SummaryApi;

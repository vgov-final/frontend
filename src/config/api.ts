// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me',
    },
    USERS: {
      LIST: '/api/users',
      CREATE: '/api/users',
      UPDATE: (id: number) => `/api/users/${id}`,
      DELETE: (id: number) => `/api/users/${id}`,
      BY_ID: (id: number) => `/api/users/${id}`,
      CHANGE_ROLE: (id: number) => `/api/users/${id}/role`,
      ACTIVATE: (id: number) => `/api/users/${id}/activate`,
      WORKLOAD: (id: number) => `/api/users/${id}/workload`,
      ROLES: '/api/users/roles',
    },
    PROJECTS: {
      LIST: '/api/projects',
      CREATE: '/api/projects',
      UPDATE: (id: number) => `/api/projects/${id}`,
      DELETE: (id: number) => `/api/projects/${id}`,
      BY_ID: (id: number) => `/api/projects/${id}`,
      UPDATE_STATUS: (id: number) => `/api/projects/${id}/status`,
      MEMBERS: (id: number) => `/api/projects/${id}/members`,
      ADD_MEMBER: (id: number) => `/api/projects/${id}/members`,
      UPDATE_MEMBER: (projectId: number, userId: number) => `/api/projects/${projectId}/members/${userId}`,
      REMOVE_MEMBER: (projectId: number, userId: number) => `/api/projects/${projectId}/members/${userId}`,
      MEMBER_WORKLOAD_HISTORY: (projectId: number, userId: number) => `/api/projects/${projectId}/members/${userId}/history`,
      USER_HISTORY: (userId: number) => `/api/projects/user-history/${userId}`,
    },
    DASHBOARD: {
      OVERVIEW: '/api/dashboard/overview',
    },
    ANALYTICS: {
      PROJECTS: '/api/analytics/projects',
      EMPLOYEES: '/api/analytics/employees',
      WORKLOAD: '/api/analytics/workload',
      PROJECT_TIMELINE: (id: number) => `/api/analytics/project/${id}/timeline`,
      PROJECT_TIMELINE_ANALYTICS: '/api/analytics/project-timeline',
    },
    WORK_LOGS: {
      LIST: '/api/worklogs',
      CREATE: '/api/worklogs',
      UPDATE: (id: number) => `/api/worklogs/${id}`,
      DELETE: (id: number) => `/api/worklogs/${id}`,
      BY_ID: (id: number) => `/api/worklogs/${id}`,
      BY_USER: (userId: number) => `/api/worklogs/user/${userId}`,
      BY_PROJECT: (projectId: number) => `/api/worklogs/project/${projectId}`,
    },
    NOTIFICATIONS: {
      LIST: '/api/notifications',
      UNREAD: '/api/notifications/unread',
      UNREAD_COUNT: '/api/notifications/unread/count',
      MARK_READ: (id: number) => `/api/notifications/${id}/read`,
      MARK_ALL_READ: '/api/notifications/read-all',
      DELETE: (id: number) => `/api/notifications/${id}`,
    },
    PROFILE: {
      GET: '/api/profile',
      CHANGE_PASSWORD: '/api/profile/password',
    },
    SYSTEM: {
      HEALTH: '/api/system/health',
      VERSION: '/api/system/version',
    },
    LOOKUP: {
      ROLES: '/api/lookup/roles',
      PROJECT_TYPES: '/api/lookup/project-types',
      PROJECT_STATUSES: '/api/lookup/project-statuses',
    },
  },
  TIMEOUT: 30000,
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export interface Project {
    id: number;
    name: string;
    projectCode: string;
    code: string;
    description?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    managerId?: number;
    manager?: {
        id: number;
        name: string;
        email: string;
    };
    employees?: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProjectRequest {
    name: string;
    projectCode: string;
    description?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    managerId?: number;
}

export interface UpdateProjectRequest {
    name?: string;
    projectCode?: string;
    description?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    managerId?: number;
}

export interface ProjectSearchParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    search?: string;
    status?: string;
    managerId?: number;
}

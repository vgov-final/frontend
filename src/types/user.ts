export interface User {
    id: number;
    employeeCode: string;
    fullName: string;
    email: string;
    role: string;
    gender: string;
    birthDate: string;
    profilePhotoUrl?: string;
    isActive: boolean;
    phone?: string;
    position?: string;
    department?: string;
    projects?: Array<{
        id: number;
        name: string;
        projectCode: string;
    }>;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy?: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    code: string;
    role: string;
    password: string;
    phone?: string;
    position?: string;
    department?: string;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    code?: string;
    role?: string;
    phone?: string;
    position?: string;
    department?: string;
    status?: string;
}

export interface UserSearchParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    search?: string;
    role?: string;
    status?: string;
    department?: string;
}

export interface ProfileUpdateRequest {
    fullName?: string;
    gender?: string;
    birthDate?: string;
    profilePhotoUrl?: string;
}

export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

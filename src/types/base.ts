export interface UserProfile {
    username: string | null
    avatarUrl: string | null
}

export interface User {
    id: string
    fullName: string
    lastSeenAt: string | null
    profile: UserProfile
}

export interface ProfileUser {
    id: string
    fullName: string
    email?: string
    profile: {
        username: string
        bio?: string | null
        avatarUrl?: string | null
        dateOfBirth?: string | null
    } | null
}

export type SearchUser = {
    id: string
    fullName: string
    lastSeenAt: string | null
    profile: {
        avatarUrl: string | null
    }[]
}

export interface SearchResponse {
    users: User[]
}

export interface ProfileUserResponse {
    user: ProfileUser
}


export interface RegisterResponse {
    user: {
        id: string
        fullName: string
        email: string
    }
}

export interface LoginResponse {
    user: {
        id: string
        fullName: string
        email: string
        profile: Profile | null
    }
}

export interface Profile {
    id: string | null
    userId: string | null
    username: string | null
    bio: string | null
    dateOfBirth: string | null
    avatarUrl: string | null
    updatedAt: string | null
}


export interface TypingUser {
    id: string
    name: string
}
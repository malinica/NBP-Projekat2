import { UserRole } from "../../Enums/UserRole";

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    profileImage?: string | null;
}
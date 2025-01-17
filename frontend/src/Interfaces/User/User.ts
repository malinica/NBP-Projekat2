import { UserRole } from "../../Enums/UserRole";
import {Tag} from "../Tag/Tag.ts";

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    profileImage?: string | null;
    tags: Tag[];
}
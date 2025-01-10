import {User} from "../User/User.ts";

export interface Tag {
    id: string;
    name: string;
    description: string;
    users: User[];
    // projects: Project[];
}
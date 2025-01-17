import {User} from "../User/User.ts";
import {Project} from "../Project/Project.ts";

export interface Tag {
    id: string;
    name: string;
    description: string;
    users: User[];
    projects: Project[];
}
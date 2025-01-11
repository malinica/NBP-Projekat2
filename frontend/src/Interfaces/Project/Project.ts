import {ProjectStatus} from "../../Enums/ProjectStatus.ts";
import {Tag} from "../Tag/Tag.ts";
import {User} from "../User/User.ts";

export interface Project {
    id: string;
    title: string;
    description: string;
    image: string;
    createdAt: Date;
    updatedAt: Date;
    status: ProjectStatus;
    tags: Tag[];
    createdBy: User | null;
}
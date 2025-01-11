import axios from "axios";
import toast from "react-hot-toast";
import {Project} from "../Interfaces/Project/Project.ts";

const api = `${import.meta.env.VITE_API_URL}/Project`;

export const createProjectAPI = async (projectDto: FormData) => {
    try {
        return await axios.post<Project>(api+"/CreateProject", projectDto, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    }
    catch(error:any) {
        toast.error(error.response?.data || "Došlo je do greške.");
        return undefined;
    }
}

export const getProjectByIdAPI = async (projectId: string) => {
    try {
        return await axios.get<Project>(api+`/GetProjectById/${projectId}`, {});
    }
    catch(error:any) {
        toast.error(error.response?.data || "Došlo je do greške.");
        return undefined;
    }
}

export const searchProjectsAPI = async (
    title?: string, 
    tags?: string[], 
    fromDate?: Date, 
    toDate?: Date, 
    skip: number = 0, 
    limit: number = 5
): Promise<Project[] | null> => {
    try {
        const params: any = {
            ...(title ? { title } : {}),
            ...(tags && tags.length ? { categories: tags.join(",") } : {}),
            ...(fromDate ? { fromDate: fromDate.toISOString() } : {}),
            ...(toDate ? { toDate: toDate.toISOString() } : {}),
            skip,
            limit
        };

        const response = await axios.post<Project[]>(`${api}/SearchProjects`, params);

        return response.data;
    } catch (error: any) {
        toast.error(error.response?.data || "Došlo je do greške pri pretrazi projekata.");
        return null;
    }
};

export const deleteProjectAPI = async (projectId: string) => {
    try {
        return await axios.delete<Project>(api+`/DeleteProject/${projectId}`, {});
    }
    catch(error:any) {
        toast.error(error.response?.data || "Došlo je do greške.");
        return undefined;
    }
}
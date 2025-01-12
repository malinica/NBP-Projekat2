import axios from "axios";
import toast from "react-hot-toast";
import {Project} from "../Interfaces/Project/Project.ts";
import { Tag } from "../Interfaces/Tag/Tag.ts";

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

export const updateProjectAPI = async (projectId: string, projectDto: FormData) => {
    try {
        return await axios.put<Project>(api+`/UpdateProject/${projectId}`, projectDto, {
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

export const deleteProjectAPI = async (projectId: string) => {
    try {
        return await axios.delete<Project>(api+`/DeleteProject/${projectId}`, {});
    }
    catch(error:any) {
        toast.error(error.response?.data || "Došlo je do greške.");
        return undefined;
    }
}


export const searchProjectsAPI = async (
    title?: string, 
    tags?: Tag[], 
    fromDate?: Date, 
    toDate?: Date, 
    pagenumber: number = 1, 
    limit: number = 10
): Promise<Project[] | null> => {
    try {
        const params: any = {
            ...(title ? { title } : {}),
            ...(tags && tags.length ? { tags: tags.map(tag => tag.name).join(",") } : {}),
            ...(fromDate ? { fromDate: fromDate.toISOString() } : {}),
            ...(toDate ? { toDate: toDate.toISOString() } : {}),
            skip: limit * (pagenumber - 1),
            limit
        };

        const url = `${api}/SearchProjects`;

        const response = await axios.get<Project[]>(url, { params });

        return response.data;
    } catch (error: any) {
        toast.error(error.response?.data || "Došlo je do greške pri pretrazi projekata.");
        return null;
    }
};

export const applyForProjectAPI = async (projectId: string, userId: string) => {
    try {
        return await axios.post<boolean>(api+`/ApplyForProject/${projectId}/${userId}`, {});
    }
    catch(error:any) {
        toast.error(error.response?.data || "Došlo je do greške.");
        return undefined;
    }
}

export const cancelProjectApplicationAPI = async (projectId: string, userId: string) => {
    try {
        return await axios.delete<boolean>(api+`/CancelProjectApplication/${projectId}/${userId}`, {});
    }
    catch(error:any) {
        toast.error(error.response?.data || "Došlo je do greške.");
        return undefined;
    }
}

export const acceptUserToProjectAPI = async (projectId: string, userId: string) => {
    try {
        return await axios.post<boolean>(api + `/AcceptUserToProject/${projectId}/${userId}`, {});
    } catch (error: any) {
        toast.error(error.response?.data || "Došlo je do greške.");
        return undefined;
    }
}

export const removeUserFromProjectAPI = async (projectId: string, userId: string) => {
    try {
        return await axios.delete<boolean>(api + `/RemoveUserFromProject/${projectId}/${userId}`, {});
    } catch (error: any) {
        toast.error(error.response?.data || "Došlo je do greške.");
        return undefined;
    }
}

export const inviteUserToProjectAPI = async (projectId: string, userId: string) => {
    try {
        return await axios.post<boolean>(api + `/InviteUserToProject/${projectId}/${userId}`, {});
    } catch (error: any) {
        toast.error(error.response?.data || "Došlo je do greške.");
        return undefined;
    }
}

export const cancelUserInvitationAPI = async (projectId: string, userId: string) => {
    try {
        return await axios.delete<boolean>(api + `/CancelUserInvitation/${projectId}/${userId}`, {});
    } catch (error: any) {
        toast.error(error.response?.data || "Došlo je do greške.");
        return undefined;
    }
}

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

export const filterProjectsAPI = async (
    title?: string, 
    tags?: string[], 
    fromDate?: Date, 
    toDate?: Date
) => {
    try {
        const response = await axios.post(`${api}/SearchProjects`, {
            params: {
                title,       
                tags,         
                fromDate,     
                toDate  
            }
        });
        return response.data; 
    } catch (error: any) {
        toast.error(error.response?.data || "Došlo je do greške.");
        return undefined;
    }
};

export const getProjectByIdAPI = async (projectId: string) => {
    try {
        return await axios.get<Project>(api+`/GetProjectById/${projectId}`, {});
    }
    catch(error:any) {
        toast.error(error.response?.data || "Došlo je do greške.");
        return undefined;
    }
}




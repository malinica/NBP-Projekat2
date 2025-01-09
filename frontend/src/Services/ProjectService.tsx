import axios from "axios";
import {AuthResponseDTO} from "../Interfaces/User/AuthResponseDTO.ts";
import toast from "react-hot-toast";

const api = `${import.meta.env.VITE_API_URL}/Project`;

export const createProjectAPI = async (projectDto: FormData) => {
    try {
        return await axios.post<AuthResponseDTO>(api+"/CreateProject", projectDto, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    }
    catch(error:any) {
        toast.error(error.response.data);
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




import axios from "axios";
import toast from "react-hot-toast";
import {Tag} from "../Interfaces/Tag/Tag.ts";

const api = `${import.meta.env.VITE_API_URL}/Tag`;

export const getTagsByNameAPI = async (tagName:string) => {
    try {
        return await axios.get<Tag[]>(api+`/GetTagsByName${tagName ? `?tagName=${tagName}` : ""}`);
    }
    catch(error:any) {
        toast.error(error.response.data);
        return undefined;
    }
}

export const addTagToProjectAPI = async (projectId: string, tagId: string) => {
    try {
        return await axios.post<boolean>(api+`/AddTagToProject/${projectId}/${tagId}`, {});
    }
    catch(error:any) {
        toast.error(error.response?.data || "Došlo je do greške.");
        return undefined;
    }
}

export const removeTagFromProjectAPI = async (projectId: string, tagId: string) => {
    try {
        return await axios.delete<boolean>(api+`/RemoveTagFromProject/${projectId}/${tagId}`, {});
    }
    catch(error:any) {
        toast.error(error.response?.data || "Došlo je do greške.");
        return undefined;
    }
}
import axios from "axios";
import toast from "react-hot-toast";
import { AuthResponseDTO } from "../Interfaces/User/AuthResponseDTO";
import { User } from "../Interfaces/User/User";
import {PaginatedResponseDTO} from "../Interfaces/Pagination/PaginatedResponseDTO.ts";
import {Tag} from "../Interfaces/Tag/Tag.ts";

const api = `${import.meta.env.VITE_API_URL}/User`;

export const loginAPI = async (email: string, password: string) => {
    try {
        return await axios.post<AuthResponseDTO>(api + "/Login", {
            email,
            password
        });
    }
    catch (error: any) {
        toast.error(error.response?.data ?? "Neuspešna prijava.");
        return undefined;
    }
}

export const registerAPI = async (email: string, username: string, password: string) => {
    try {
        return await axios.post<AuthResponseDTO>(api + "/register", {
            email: email,
            username: username,
            password: password
        });
    }
    catch (error: any) {
        toast.error(error.response?.data ?? "Neuspešna registracija.");
        return undefined;
    }
}

export const getAllUsersAPI = async () => {
    try {
        const response = await axios.get<User[]>(`${api}/GetAllUsers`);
        return response.data;
    } 
    catch (error: any) {
        toast.error(error.response?.data || "Došlo je do greške prilikom preuzimanja korisnika.");
        return undefined;
    }
};

export const getProjectUsersByTypeAPI = async (projectId: string, type: string, page: number = 1, pageSize: number = 10) => {
    try {
        return await axios.get<PaginatedResponseDTO<User>>(
            `${api}/GetProjectUsersByType/${type}/${projectId}?page=${page}&pageSize=${pageSize}`
        );
    }
    catch (error: any) {
        toast.error(error.response?.data || "Došlo je do greške prilikom preuzimanja korisnika.");
        return undefined;
    }
};

export const filterUsersAPI = async (username: string, tags: Tag[], page: number = 1, pageSize: number = 10) => {
    try {
        const params: any = {
            ...(username ? { username } : {}),
            ...(tags && tags.length ? { tagsIds: tags.map(tag => tag.id).join(",") } : {}),
            page,
            pageSize
        };

        return await axios.get<PaginatedResponseDTO<User>>(`${api}/FilterUsers`, { params });
    }
    catch (error: any) {
        toast.error(error.response?.data || "Došlo je do greške prilikom pretrage korisnika.");
        return undefined;
    }
};

export const getUserByUsernameAPI = async (username: string) => {
    try {
        const response = await axios.get<User>(`${api}/GetUserByUsername/${username}`);
        return response.data;
    } catch (error: any) {
        toast.error(error.response?.data || "Došlo je do greške prilikom preuzimanja korisnika.");
        return undefined;
    }
};

export const followUserAPI = async (userId: string) => {
    try {
        return await axios.post<boolean>(`${api}/FollowUser/${userId}`);
    } catch (error: any) {
        toast.error(error.response?.data || "Došlo je do greške prilikom zapraćivanja korisnika.");
        return undefined;
    }
};

export const unfollowUserAPI = async (userId: string) => {
    try {
        return await axios.delete<boolean>(`${api}/UnfollowUser/${userId}`);
    } catch (error: any) {
        toast.error(error.response?.data || "Došlo je do greške prilikom otpraćivanja korisnika.");
        return undefined;
    }
};

export const checkIfUserFollowsAPI = async (userId: string) => {
    try {
        return await axios.get<boolean>(`${api}/CheckIfUserFollows/${userId}`);
    } catch (error: any) {
        toast.error(error.response?.data || "Došlo je do greške prilikom provere veze između korisnika.");
        return undefined;
    }
};

export const getFollowersAPI = async (userId: string, page: number = 1, pageSize: number = 10) => {
    try {
        return await axios.get<User[]>(`${api}/GetFollowers/${userId}`, {
            params: { page, pageSize }
        });
    } catch (error: any) {
        toast.error(error.response?.data || "Došlo je do greške prilikom učitavanja pratilaca.");
        return undefined;
    }
};

export const getFollowingAPI = async (userId: string, page: number = 1, pageSize: number = 10) => {
    try {
        return await axios.get<User[]>(`${api}/GetFollowing/${userId}`, {
            params: { page, pageSize }
        });
    } catch (error: any) {
        toast.error(error.response?.data || "Došlo je do greške prilikom učitavanja liste korisnika koje prati.");
        return undefined;
    }
};

export const getSuggestedUsersAPI = async () => {
    try {
        return await axios.get<User[]>(`${api}/GetSuggestedUsers`);
    } catch (error: any) {
        toast.error(error.response?.data || "Došlo je do greške prilikom preuzimanja predloženih korisnika.");
        return undefined;
    }
};

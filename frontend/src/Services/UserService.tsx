import axios from "axios";
import toast from "react-hot-toast";
import { AuthResponseDTO } from "../Interfaces/User/AuthResponseDTO";
import { User } from "../Interfaces/User/User";

const api = `${import.meta.env.VITE_API_URL}/User`;

export const loginAPI = async (email: string, password: string) => {
    try {
        const data = await axios.post<AuthResponseDTO>(api + "/Login", {
            email,
            password
        });

        return data;
    }
    catch (error: any) {
        toast.error(error.response.data);
        return undefined;
    }
}

export const registerAPI = async (email: string, username: string, password: string) => {
    try {
        const data = await axios.post<AuthResponseDTO>(api + "/register", {
            email: email,
            username: username,
            password: password
        });

        return data;
    }
    catch (error: any) {
        toast.error(error.response.data);
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
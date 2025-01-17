import axios from "axios";
import toast from "react-hot-toast";
import {PaginatedResponseDTO} from "../Interfaces/Pagination/PaginatedResponseDTO.ts";
import {Review} from "../Interfaces/Review/Review.ts";

const api = `${import.meta.env.VITE_API_URL}/Review`;

export const getReviewsFromUsernameAPI = async (
    username: string, 
    skip: number = 0, 
    limit: number = 10
): Promise<PaginatedResponseDTO<Review> | null> => {
    try {
        const params: any = {
            skip, 
            limit 
        };

        const url = `${api}/GetReviewsFromUsername/${username}`;

        const response = await axios.get<PaginatedResponseDTO<Review>>(url, { params });

        return response.data;
    } catch (error: any) {
        toast.error(error.response?.data || "Nema traženih recenzija za korisnika.");
        return null;
    }
};

export const getReviewsForUsernameAPI = async (
    username: string, 
    skip: number = 0, 
    limit: number = 10
): Promise<PaginatedResponseDTO<Review> | null> => {
    try {
        const params: any = {
            skip, 
            limit 
        };

        const url = `${api}/GetReviewsForUsername/${username}`;

        const response = await axios.get<PaginatedResponseDTO<Review>>(url, { params });

        return response.data;
    } catch (error: any) {
        toast.error(error.response?.data || "Nema traženih recenzija za korisnika.");
        return null;
    }
};

export const createReviewAPI = async (
    targetId: string, 
    reviewData: Review
): Promise<boolean | null> => {
    try {
        const url = `${api}/CreateReview/${targetId}`;
        const response = await axios.post<boolean>(url, reviewData);

        return response.data;
    } catch (error: any) {
        toast.error(error.response?.data || "Greška prilikom kreiranja recenzije.");
        return null;
    }
};


export const deleteReviewAPI = async (id: string): Promise<boolean | null> => {
    try {
        const url = `${api}/DeleteReview/${id}`;
        const response = await axios.delete<boolean>(url);
        return response.data;
    } catch (error: any) {
        toast.error(error.response?.data || "Greška prilikom brisanja recenzije.");
        return null;
    }
};

export const updateReviewAPI = async (
    id: string, 
    reviewData: Review
): Promise<boolean | null> => {
    try {
        const url = `${api}/UpdateReview/${id}`;
        const response = await axios.put<boolean>(url, reviewData);
        return response.data;
    } catch (error: any) {
        toast.error(error.response?.data || "Greška prilikom ažuriranja recenzije.");
        return null;
    }
};

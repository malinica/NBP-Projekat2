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

        const url = `${api}/GetReviewsForUsername/${username}`;

        const response = await axios.get<PaginatedResponseDTO<Review>>(url, { params });

        return response.data;
    } catch (error: any) {
        toast.error(error.response?.data || "Došlo je do greške prilikom preuzimanja recenzija.");
        return null;
    }
};

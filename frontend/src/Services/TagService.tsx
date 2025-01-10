import axios from "axios";
import toast from "react-hot-toast";
import {Tag} from "../Interfaces/Tag/Tag.ts";

const api = `${import.meta.env.VITE_API_URL}/Tag`;

export const getTagsByNameAPI = async (tagName:string) => {
    try {
        return await axios.get<Tag[]>(api+`/GetTagsByName/${tagName}`);
    }
    catch(error:any) {
        toast.error(error.response.data);
        return undefined;
    }
}

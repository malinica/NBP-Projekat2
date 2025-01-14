import {User} from "../User/User.ts";

export interface Review
{
    id: string; 
    rating: number;
    content: string; 
    createdAt: Date;
    updatedAt: Date;

    // Veze
    author?: User; 
    reviewee?: User; 
}

import styles from "./UserProfilePage.module.css";
import { v4 as uuidv4 } from 'uuid';
import { Pagination } from "../Pagination/Pagination";
import { useEffect, useState } from 'react';
import toast from "react-hot-toast";
import { Review } from "../../Interfaces/Review/Review";
import { useAuth } from "../../Context/useAuth";
import {useParams} from "react-router-dom";
import { User } from "../../Interfaces/User/User";
import {checkIfUserFollowsAPI, followUserAPI, getUserByUsernameAPI, unfollowUserAPI} from "../../Services/UserService";
import {getReviewsFromUsernameAPI,createReviewAPI, getReviewsForUsernameAPI} from "../../Services/ReviewService";


const UserProfilePage = () => {
    const {usernameFromParams} = useParams();
    const [profileUser,setProfileUser]=useState<User|null>(null);
    const [totalItemsCount, setTotalItemsCount] = useState<number>(0);
    const [reviews, setReviews] = useState<Review[] | null>(null);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);//da li pratim tog korisnika ili ne
    const [isRelationshipLoading, setIsRelationshipLoading] = useState<boolean>(true);
    const [typeForReviews,setTypeForReviews]=useState<boolean>(true);//true ako je reviews koje je korisnik dao, false ako je reviews koje je korisnik dobio
    const [reviewGrade,setReviewGrade]=useState<number|null>(null);
    const [reviewText,setReviewText]=useState<string|null>(null);
    const {user} = useAuth();

    useEffect(() => {
        loadUser();
    }, [usernameFromParams]);

    useEffect(() => {
        loadReviews(1, 10);
    }, [typeForReviews]);

    const handlePaginateChange = async (page: number, pageSize: number) => {
        await loadReviews(page, pageSize);
    }

    const handleSubmit = async () => {
        if(reviewGrade==null )
            toast.error("Unesite ocenu");
        else if (usernameFromParams!=null)
        {

            const reviewData: Review = {
                id: uuidv4(),
                rating: reviewGrade,
                content: reviewText? reviewText : "",
                createdAt: new Date(),
                updatedAt: new Date()
            };

            var result=await createReviewAPI(usernameFromParams,reviewData);
            if(result)
                toast.success("Uspesno ste dodali recenziju");
            else 
            toast.error("Greska prilikom dodavanja recenzije");
    }
}

    const handleReviewText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setReviewText(e.target.value);
      };

    const handleReviewGrade = (e: React.ChangeEvent<HTMLInputElement>) => {
        const price = parseInt(e.target.value, 10);
        
        if (isNaN(price) || price < 0 || price > 5) {
          setReviewGrade(null);
        } else {
          setReviewGrade(price);
        }
      };
      

    const loadUser = async () => {
        if (usernameFromParams != undefined) {
            const data = await getUserByUsernameAPI(usernameFromParams);
            if (!data) {
                toast.error("Ne postoji korisnik za prikaz!");
            } else {
                setProfileUser(data);
                try {
                    const userFollowsResponse = await checkIfUserFollowsAPI(data.id);
                    if(userFollowsResponse && userFollowsResponse.status === 200)
                        setIsFollowing(userFollowsResponse.data);
                }
                catch {
                    toast.error("Došlo je do greške prilikom očitavanja veze ka korisniku.")
                }
                finally {
                    setIsRelationshipLoading(false);
                }
            }
        }
    };

    const loadReviews = async (page: number, pageSize: number) => {
        if (usernameFromParams) {
            const fetchReviews = typeForReviews 
                ? getReviewsFromUsernameAPI(usernameFromParams, (page - 1) * pageSize, pageSize)
                : getReviewsForUsernameAPI(usernameFromParams, (page - 1) * pageSize, pageSize);
    
            try {
                const data = await fetchReviews;
                if (!data) {
                    toast.error("Ne postoje recenzije korisnika za prikaz!");
                    setReviews(null);
                    setTotalItemsCount(0);
                } else {
                    setReviews(data.data);
                    setTotalItemsCount(data.totalLength);
                }
            } catch (error) {
                toast.error("Došlo je do greške pri učitavanju recenzija.");
                setReviews(null);
                setTotalItemsCount(0);
            }
        }
    };
    

    const handleFollowUser = async () => {
        try {
            const response = await followUserAPI(profileUser!.id);
            if (response && response.status === 200) {
                toast.success("Korisnik je uspešno zapraćen.");
                setIsFollowing(true);
            }
        } catch {
            toast.error("Došlo je do greške prilikom zapraćivanja korisnika.");
        }
    };

    const handleUnfollowUser = async () => {
        try {
            const response = await unfollowUserAPI(profileUser!.id);
            if (response && response.status === 200) {
                setIsFollowing(false);
                toast.success("Korisnik je uspešno otpraćen.");
            }
        } catch {
            toast.error("Došlo je do greške prilikom otpraćivanja korisnika.");
        }
    };


    return (
        <div>
            {profileUser ? (
                <div>
                    <h1>Profil korisnika</h1>
                    <p><strong>Username:</strong> {profileUser.username}</p>
                    <p><strong>Email:</strong> {profileUser.email}</p>
                    <p><strong>Uloga:</strong> {profileUser.role}</p>
                    {profileUser.profileImage ? (
                        <img src={`${import.meta.env.VITE_SERVER_URL}/${user?.profileImage}`} alt={profileUser.id}
                             className={`${styles.slika}`}/>
                    ) : (
                        <p>Profilna slika nije dostupna</p>
                    )}

<div>
      {user==null ? (
        <p>Logujte se da biste ocenili korisnika.</p>
      ) : usernameFromParams != user!.username ? (
        <>
          <input
            type="number"
            min="0"
            max="5"
            onChange={handleReviewGrade}
            placeholder="Ocena (0-5)"
            style={{ display: "block", margin: "10px 0" }}
          />
          <textarea
            onChange={handleReviewText}
            placeholder="Unesite komentar"
            rows={5}
            cols={30}
            style={{ display: "block", margin: "10px 0" }}
          />
           <button 
                onClick={handleSubmit} 
                style={{ marginTop: "10px" }}
            >
                Ocenite
            </button>
        </>
      ) : null}
    </div>

                    {user?.id !== profileUser?.id &&
                        <>
                            {isRelationshipLoading ? (
                                <button className="btn btn-secondary" disabled>Učitavanje...</button>
                            ) : isFollowing ? (
                                <button
                                    className="btn btn-danger"
                                    onClick={handleUnfollowUser}>
                                    Otprati
                                </button>
                                ): (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleFollowUser}>
                                    Zaprati
                                </button>
                            )}
                        </>}


                    <label htmlFor="reviewType">Tip recenzija: </label>
                    <select
                        id="reviewType"
                        value={typeForReviews ? 'given' : 'received'}
                        onChange={(e) => setTypeForReviews(e.target.value === 'given')}
                    >
                        <option value="given">Recenzije koje je postavio korisnik</option>
                        <option value="received">Recenzije koje je dobio korisnik</option>
                    </select>

                    {totalItemsCount > 0 ? (
    <div className={`my-4`}>
        <Pagination totalLength={totalItemsCount} onPaginateChange={handlePaginateChange}/>
    </div>
) : (
    <div className="my-4 text-center text-gray-500">
        Nema recenzija za prikaz
    </div>
)}

                </div>

            ) : (
                <p>Korisnik nije pronađen.</p>
            )}
        </div>
    );
};
export default UserProfilePage;

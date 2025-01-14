import styles from "./UserProfilePage.module.css";
import { Pagination } from "../Pagination/Pagination";
import { useEffect, useState } from 'react';
import toast from "react-hot-toast";
import { Review } from "../../Interfaces/Review/Review";
import { useAuth } from "../../Context/useAuth";
import {useParams} from "react-router-dom";
import { User } from "../../Interfaces/User/User";
import {getUserByUsernameAPI} from "../../Services/UserService";
import {getReviewsFromUsernameAPI} from "../../Services/ReviewService";


const UserProfilePage = () => {
    const {usernameFromParams} = useParams();
    const [profileUser,setProfileUser]=useState<User|null>(null);
    const [totalItemsCount, setTotalItemsCount] = useState<number>(0);
    const [reviews, setReviews] = useState<Review[] | null>(null);
    const [typeForReviews,setTypeForReviews]=useState<boolean>(true);//true ako je reviews koje je korisnik dao, false ako je reviews koje je korisnik dobio
    const {user} = useAuth();

    useEffect(() => {loadUser();}, [usernameFromParams]);
    useEffect(() => { loadReviews(1, 10); }, [typeForReviews]);

    const handlePaginateChange = async (page: number, pageSize: number) => {
        await loadReviews(page, pageSize);
      }
    const loadUser = async () => {
        if (usernameFromParams!=undefined)
        {

            const data = await getUserByUsernameAPI(
                usernameFromParams);
                if (!data) 
                    {
                        toast.error("Ne postoji korisnik za prikaz!");
                    } 
                    else 
                    setProfileUser(data);
            }
        };

        const loadReviews = async (page: number, pageSize: number) => {
            if (typeForReviews && usernameFromParams!=undefined)
            {
                const data = await getReviewsFromUsernameAPI(usernameFromParams,(page-1)*pageSize,pageSize)
                    if (!data) 
                        {
                            toast.error("Ne postoje recenzije korisnika za prikaz!");
                            setReviews(null);
                            setTotalItemsCount(0);
                        } 
                        else 
                        {
                            setReviews(data.data);
                            setTotalItemsCount(data.totalLength);
                        }
                    
                }
            else 
            {
                //OVDE TREBA DODATI DRUGI API ZA RECENZIJE KOJE JE DOBIO KORISNIK
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
        <img src={`${import.meta.env.VITE_SERVER_URL}/${user?.profileImage}`} alt={profileUser.id} className={`${styles.slika}`} />
                            
    
    ) : (
                            <p>Profilna slika nije dostupna</p>
                        )}

<label htmlFor="reviewType">Tip recenzija: </label>
        <select
          id="reviewType"
          value={typeForReviews ? 'given' : 'received'}
          onChange={(e) => setTypeForReviews(e.target.value === 'given')}
        >
          <option value="given">Recenzije koje je postavio korisnik</option>
          <option value="received">Recenzije koje je dobio korisnik</option>
        </select>

{totalItemsCount > 0 &&
          <div className={`my-4`}>
            <Pagination totalLength={totalItemsCount} onPaginateChange={handlePaginateChange} />
          </div>}
                    </div>
                    
                ) : ( 
                    <p>Korisnik nije pronađen.</p>
                )}
            </div>
        );
    };
export default UserProfilePage;

import styles from "./UserProfilePage.module.css";
import { v4 as uuidv4 } from 'uuid';
import { Pagination } from "../Pagination/Pagination";
import {ChangeEvent, useEffect, useState} from 'react';
import toast from "react-hot-toast";
import { Review } from "../../Interfaces/Review/Review";
import { useAuth } from "../../Context/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import { User } from "../../Interfaces/User/User";
import {
    checkIfUserFollowsAPI,
    followUserAPI,
    getUserByUsernameAPI,
    unfollowUserAPI,
    updateUserAPI
} from "../../Services/UserService";
import { getReviewsFromUsernameAPI, createReviewAPI, getReviewsForUsernameAPI } from "../../Services/ReviewService";
import { FollowersFollowingModal } from "../FollowersFollowingModal/FollowersFollowingModal.tsx";
import Rating from '@mui/material/Rating';
import {ImageCropModal} from "../ImageCropModal/ImageCropModal.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit} from "@fortawesome/free-solid-svg-icons";
import {TagPicker} from "../TagPicker/TagPicker.tsx";
import {Chip} from "@mui/material";
import {Tag} from "../../Interfaces/Tag/Tag.ts";
import {
    addTagToUserAPI,
    removeTagFromUserAPI
} from "../../Services/TagService.tsx";
import ReviewCard from "../ReviewCard/ReviewCard.tsx";
import {faUser} from "@fortawesome/free-solid-svg-icons";


const UserProfilePage = () => {
    const { usernameFromParams } = useParams();
    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [totalItemsCount, setTotalItemsCount] = useState<number>(0);
    const [reviews, setReviews] = useState<Review[] | null>(null);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);//da li pratim tog korisnika ili ne
    const [isRelationshipLoading, setIsRelationshipLoading] = useState<boolean>(false);
    const [typeForReviews, setTypeForReviews] = useState<boolean>(false);//true ako je reviews koje je korisnik dao, false ako je reviews koje je korisnik dobio
    const [reviewGrade, setReviewGrade] = useState<number | null>(null);
    const [reviewText, setReviewText] = useState<string | null>(null);
    const [isFollowersModalOpened, setIsFollowersModalOpened] = useState(false);
    const [activeTab, setActiveTab] = useState<"followers" | "following">("followers");
    const [isCropModalOpen, setCropModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [pageNumber,setPageNumber]=useState<number>(1);
    const [reviewsPerPage,setReviewsPerPage]=useState<number>(10);





    const navigate = useNavigate();

    const { user } = useAuth();

    useEffect(() => {
        loadUser();
    }, [usernameFromParams]);
    useEffect(() => {
        loadReviews(pageNumber, reviewsPerPage);
    }, [typeForReviews]);

    const handlePaginateChange = async (page: number, pageSize: number) => {
        await loadReviews(page, pageSize);
        setPageNumber(page);
        setReviewsPerPage(pageSize);
    }

    const handleSubmit = async () => {
        if (reviewGrade == null)
            toast.error("Unesite ocenu");
        else if (usernameFromParams != null) {

            const reviewData: Review = {
                id: uuidv4(),
                rating: reviewGrade,
                content: reviewText ? reviewText : "",
                createdAt: new Date(),
                updatedAt: new Date()
            };

            

            const result = await createReviewAPI(usernameFromParams, reviewData);
            if (result)
                {

                    toast.success("Uspesno ste dodali recenziju");
                    setReviewText("");
                    setReviewGrade(null);
                    loadReviews(pageNumber, reviewsPerPage);
                }

            else
                toast.error("Greska prilikom dodavanja recenzije");
        }
    }


    const handleOnDelete = () => {
        if (pageNumber === 1) {
          loadReviews(pageNumber, reviewsPerPage);
        } else {
          if (((pageNumber - 1) * reviewsPerPage + 1) === totalItemsCount) {
            loadReviews(pageNumber - 1, reviewsPerPage);
            setPageNumber(pageNumber - 1);
          }
          else
          loadReviews(pageNumber,reviewsPerPage);
        }
      };
      

  
    const handleReviewText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setReviewText(e.target.value);
    };

    const loadUser = async () => {
        if (usernameFromParams != undefined) {
            const data = await getUserByUsernameAPI(usernameFromParams);
            if (!data) {
                toast.error("Ne postoji korisnik za prikaz!");
            } else {
                setProfileUser(data);
                setNewUsername(data.username);

                if(user?.id == profileUser?.id)
                    return;

                try {
                    setIsRelationshipLoading(true);
                    const userFollowsResponse = await checkIfUserFollowsAPI(data.id);
                    if (userFollowsResponse && userFollowsResponse.status === 200)
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
            } catch {
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

    const openModal = (tab: "followers" | "following") => {
        setActiveTab(tab);
        setIsFollowersModalOpened(true);
    };

    const closeModal = () => {
        setIsFollowersModalOpened(false);
    };

    const handleNavigate = (userId: string) => {
        navigate(`/my-projects-page/${userId}`);
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setSelectedImage(URL.createObjectURL(file));
            setCropModalOpen(true);
        }
        event.target.value = "";
    };

    const handleSaveCroppedImage = async (croppedImage: Blob) => {
        try {
            const formData = new FormData();
            formData.append("profileImage", croppedImage, "profile-image.png");
            const response = await updateUserAPI(formData);
            if (response && response.status === 200) {
                toast.success("Uspešno ažurirana slika.");
                setProfileUser((prev:User|null) => {
                    if (!prev)
                        return null;

                    return {
                        ...prev,
                        profileImage: response.data.profileImage
                    }
                })
            }
        }
        catch {
            toast.error("Došlo je do greške prilikom ažuriranja slike.");
        }
        finally {
            setCropModalOpen(false);
        }
    };

    const handleSaveUsername = async () => {
        if (!newUsername.trim()) {
            toast.error("Korisničko ime ne može biti prazno.");
            return;
        }

        const usernameRegex = /^[a-zA-Z0-9._]+$/;
        if(!usernameRegex.test(newUsername.trim())){
            toast.error("Korisničko ime nije u validnom formatu. Dozvoljena su mala i velika slova abecede, brojevi, _ i .");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("username", newUsername);
            const response = await updateUserAPI(formData);
            if (response && response.status === 200) {
                toast.success("Korisničko ime uspešno ažurirano.");
                const currentUser = JSON.parse(localStorage.getItem("user")!);
                currentUser.username = newUsername;
                localStorage.setItem("user", JSON.stringify(currentUser));
                navigate(`/profile-page/${response.data.username}`);
                if(user)
                    user.username = response.data.username;
                setProfileUser((prev) => prev ? { ...prev, username: newUsername } : null);
                setIsEditingUsername(false);
            }
        } catch {
            toast.error("Došlo je do greške prilikom ažuriranja korisničkog imena.");
        }
    };

    const handleAddTag = async (tag: Tag) => {
        if (!profileUser) return;

        try {
            const response = await addTagToUserAPI(tag.id);
            if (response && response.status === 200 && response.data) {
                setProfileUser((prev) => prev ? {...prev, tags: [...prev.tags, tag]} : prev);
                toast.success("Tag uspešno dodat!");
            }
        } catch {
            toast.error("Greška pri dodavanju taga.");
        }
    };

    const handleRemoveTag = async (tagId: string) => {
        if (!profileUser) return;

        try {
            const response = await removeTagFromUserAPI(tagId);
            if (response && response.status === 200 && response.data) {
                setProfileUser((prev) => prev ?
                                        {...prev, tags: prev.tags.filter((tag) => tag.id !== tagId)} :
                                        prev);
                toast.success("Tag uspešno uklonjen!");
            }
        } catch {
            toast.error("Greška pri uklanjanju taga.");
        }
    };

    return (
        <div className={`container-fluid d-flex justify-content-center`}>
            <div className={`container m-4 bg-light-green rounded-3`}>
                {profileUser ? (
                    <div className={`m-4`}>
                        <h1 className={`text-violet text-center`}>Profil korisnika</h1>
                        <div className={`d-flex flex-column align-items-start`}>
                            {profileUser?.profileImage ? (
                                <img src={`${import.meta.env.VITE_SERVER_URL}/${profileUser?.profileImage}`}
                                    alt={profileUser.id}
                                    className={`${styles.slika} rounded-circle my-3`}/>
                            ) : (
                                <div className={`rounded-circle bg-success d-flex justify-content-center align-items-center me-3  mb-3 ${styles.slika1}`}>
                                    <FontAwesomeIcon icon={faUser} className={`text-white`} size="2x" />
                                </div>
                            )}

                            {user?.id == profileUser.id && (<>
                                <label htmlFor={`fileInput`} className={`text-white text-center rounded-3 border-0 py-2 px-2 mb-2 ${styles.slova2} ${styles.dugme1} ${styles.linija_ispod_dugmeta}`}>Promeni Sliku</label>
                                <input type="file" id={`fileInput`} hidden accept="image/*"
                                    onChange={handleFileChange}/>

                                {selectedImage && (
                                    <ImageCropModal
                                        isOpen={isCropModalOpen}
                                        onClose={() => setCropModalOpen(false)}
                                        onSave={handleSaveCroppedImage}
                                        imageSrc={selectedImage}
                                    />
                                )}
                            </>)}
                        </div>

                        <div className={`d-flex align-items-center`}>
                            {isEditingUsername ? (
                                <>
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className={`form-control`}
                                    />
                                    <button className={`text-white text-center rounded-3 border-0 py-2 px-2 ms-2 ${styles.slova} ${styles.dugme2} ${styles.linija_ispod_dugmeta}`} onClick={handleSaveUsername}>Sačuvaj</button>
                                    <button className={`text-white text-center rounded-3 border-0 py-2 px-2 ms-2 ${styles.slova} ${styles.dugme3} ${styles.linija_ispod_dugmeta}`}
                                            onClick={() => setIsEditingUsername(false)}>Otkaži
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className={`text-dark-green mb-0 me-2`}><strong>Username:</strong> {profileUser.username}</p>
                                    <button className={`btn ms-2`} onClick={() => setIsEditingUsername(true)}>
                                        <FontAwesomeIcon icon={faEdit}/>
                                    </button>
                                </>
                            )}
                        </div>
                        <p className={`text-green mt-2`}><strong>Email:</strong> {profileUser.email}</p>
                        <p className={`text-green`}><strong>Uloga:</strong> {profileUser.role}</p>

                        <div className={`mb-3`}>
                            {user && profileUser.id == user?.id
                                ?
                                (<>
                                    <TagPicker selectedTags={profileUser.tags} maxNumberOfTags={10} onAddTag={handleAddTag}
                                            onRemoveTag={handleRemoveTag}/>
                                </>)
                                :
                                (<>
                                    {profileUser.tags.map((tag) => (
                                        <Chip key={tag.id} className={`ms-2`} label={tag.name}
                                            color="success"/>
                                    ))}
                                </>)}
                        </div>

                        <div>
                            {user == null ? (
                                <p className={`text-center text-muted`}>Logujte se da biste ocenili korisnika.</p>
                            ) : usernameFromParams != user!.username ? (
                                <>
                                    <Rating
                                        name="simple-controlled"
                                        value={reviewGrade}
                                        onChange={(_, newValue) => {
                                            setReviewGrade(newValue);
                                        }}
                                    />
                                    <textarea
                                        onChange={handleReviewText}
                                         value={reviewText || ''} 
                                        placeholder="Unesite komentar"
                                        rows={5}
                                        cols={30}
                                        className={`d-block my-2 rounded-1`}
                                    />
                                    <button
                                        onClick={handleSubmit}
                                        className={`text-white text-center rounded-3 border-0 py-2 px-2 mt-2 mb-3 ${styles.slova2} ${styles.dugme1} ${styles.linija_ispod_dugmeta}`}
                                    >
                                        Ocenite
                                    </button>
                                    <button className={`text-white text-center rounded-3 border-0 py-2 px-2 mb-3 ms-2 ${styles.slova2} ${styles.dugme5} ${styles.linija_ispod_dugmeta}`} onClick={() => handleNavigate(profileUser.id)}>
                                        Korisnikovi projekti
                                    </button>
                                </>
                            ) : null}
                        </div>


                        <div>
                            <button className={`text-white text-center rounded-3 border-0 py-2 px-2 mt-2 mb-3 ${styles.slova2} ${styles.dugme4} ${styles.linija_ispod_dugmeta}`} onClick={() => openModal("followers")}>Pratioci</button>
                            <button className={`text-white text-center rounded-3 border-0 py-2 px-2 mt-2 mb-3 ms-2 ${styles.slova2} ${styles.dugme4} ${styles.linija_ispod_dugmeta}`} onClick={() => openModal("following")}>Praćenja</button>

                            <FollowersFollowingModal
                                isOpen={isFollowersModalOpened}
                                onClose={closeModal}
                                userId={profileUser.id}
                                activeTab={activeTab}
                            />
                        

                            {user?.id !== profileUser?.id &&
                                <>
                                    {isRelationshipLoading ? (
                                        <button className="btn btn-secondary" disabled>Učitavanje...</button>
                                    ) : isFollowing ? (
                                        <button
                                            className={`text-white text-center rounded-3 border-0 py-2 px-2 ms-2 ${styles.slova2} ${styles.dugme3} ${styles.linija_ispod_dugmeta}`}
                                            onClick={handleUnfollowUser}>
                                            Otprati
                                        </button>
                                    ) : (
                                        <button
                                            className={`text-white text-center rounded-3 border-0 py-2 px-2 ms-2 ${styles.slova2} ${styles.dugme2} ${styles.linija_ispod_dugmeta}`}
                                            onClick={handleFollowUser}>
                                            Zaprati
                                        </button>
                                    )}
                                </>}

                            </div>

                        <label className={`text-violet me-2 `} htmlFor="reviewType">Tip recenzija: </label>
                        <select
                            id="reviewType"
                            value={typeForReviews ? 'given' : 'received'}
                            onChange={(e) => setTypeForReviews(e.target.value === 'given')}
                            className={`rounded text-violet`}
                        >
                            <option value="given">Recenzije koje je postavio korisnik</option>
                            <option value="received">Recenzije koje je dobio korisnik</option>
                        </select>


                        {totalItemsCount > 0 ? (
                            <div>
                            <div>
                            {reviews!.map((review) => (
                            <ReviewCard key={review.id} review={review} onDelete={handleOnDelete} />
                            ))}
                        </div>
                            <div className={`my-4`}>
                                <Pagination totalLength={totalItemsCount} onPaginateChange={handlePaginateChange} currentPage={pageNumber} perPage={reviewsPerPage}/>
                            </div>
                            </div>
                        ) : (
                            <div className="my-4 text-center text-gray-500">
                                Nema recenzija za prikaz
                            </div>
                        )}

                    </div>

                ) : (
                    <p className={`text-center text-muted`}>Korisnik nije pronađen.</p>
                )}
            </div>
        </div>
    );
};
export default UserProfilePage;

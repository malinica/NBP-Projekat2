import {ChangeEvent, useEffect, useState} from "react";
import {filterUsersAPI, getSuggestedUsersAPI} from "../../Services/UserService";
import { User } from "../../Interfaces/User/User";
import UserCard from "../UserCard/UserCard";
import {TagPicker} from "../TagPicker/TagPicker.tsx";
import styles from "../SearchProjectsPage/SearchProjectsPage.module.css";
import {Tag} from "../../Interfaces/Tag/Tag.ts";
import toast from "react-hot-toast";
import {Pagination} from "../Pagination/Pagination.tsx";

const SearchUserPage = () => {
    const [username, setUsername] = useState("");
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [viewMode, setViewMode] = useState<"search"|"suggested">("suggested");

    useEffect(() => {
        loadSuggestedUsers();
    }, []);

    const handlePaginateChange = async (page: number, pageSize: number) => {
        await filterUsers(page, pageSize);
    }

    const handleButtonSearchClick = async () => {
        if(viewMode === "suggested")
            setViewMode("search");

        await filterUsers(1,10);
    };

    const filterUsers = async (page:number, pageSize: number) => {
        try {
            setIsLoading(true);
            const response = await filterUsersAPI(username, selectedTags, page, pageSize);
            if(response && response.status === 200) {
                setUsers(response.data.data);
                setTotalUsersCount(response.data.totalLength);
            }
        }
        catch {
            toast.error("Došlo je do greške prilikom pretrage korisnika.");
        }
        finally {
            setIsLoading(false);
        }
    };

    const loadSuggestedUsers = async () => {
        try {
            setIsLoading(true);
            const response = await getSuggestedUsersAPI();
            if(response && response.status === 200) {
                setUsers(response.data);
                setTotalUsersCount(0);
            }
        }
        catch {
            toast.error("Došlo je do greške prilikom učitavanja predloženih korisnika.");
        }
        finally {
            setIsLoading(false);
        }
    }

    const handleAddTag = (tag:Tag) => {
        setSelectedTags(prevTags => [...prevTags, tag]);
    };

    const handleRemoveTag = (tagId: string) => {
        setSelectedTags(prevTags => prevTags.filter(tag => tag.id !== tagId));
    };

    const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    };

    return (
        <div className={`container-fluid bg-light-lilac`}>
            <div className={`row mx-2 my-4 py-2 rounded-3 bg-light-green`}>
                <div className={`col-xxl-3 col-xl-3 col-lg-4 col-md-5 col-sm-12 my-2 px-2 py-3 rounded-3 d-flex flex-column`}>

                    <div className={`mb-3 mx-2`}>
                        <TagPicker selectedTags={selectedTags} onAddTag={handleAddTag}
                                    onRemoveTag={handleRemoveTag}/>
                    </div>

                    <label className={`text-dark-green ms-2 me-4`}>Unesite korisničko ime: </label>
                    <div className={`d-flex flex-column ms-2 me-2 my-2`}>
                        <input
                            className={`form-control rounded-2`}
                            value={username}
                            onChange={handleUsernameChange}
                        ></input>
                    </div>

                    <button
                        className={`btn-md m-2 text-white text-center rounded py-2 px-2 mt-4 ${styles.fields} ${styles.dugme} ${styles.linija_ispod_dugmeta}`}
                        type="button"
                        id="buttonSearch"
                        onClick={handleButtonSearchClick}
                    >Pretraži
                    </button>
                </div>

                <div className={`col-xxl-9 col-xl-9 col-lg-8 col-md-7 col-sm-12 my-2`}>
                    <h2 className={`my-5 text-center text-dark-green`}>
                        {viewMode === "search" ? "Rezultati pretrage" : "Osobe koje možda poznajete"}
                    </h2>
                    {isLoading ?
                        (<>
                            <p className={`text-center`}>Učitavanje korisnika...</p>
                        </>) :
                        (<>
                            {users && users.length > 0 ? (
                                users.map((user) => (
                                    <div key={user.id} className={`row mb-3`}>
                                        <div className={`col`}>
                                            <UserCard user={user}/>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={`col-12`}>
                                    <p className={`text-center text-muted`}>Nema korisnika za prikaz.</p>
                                </div>
                            )}
                        </>)}
                </div>

                {totalUsersCount > 0 &&
                    <div className={`my-4`}>
                        <Pagination totalLength={totalUsersCount} onPaginateChange={handlePaginateChange} />
                    </div>}
            </div>
        </div>
    );
};

export default SearchUserPage;

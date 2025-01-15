import {useEffect, useState} from "react";
import {User} from "../../Interfaces/User/User.ts";
import {getProjectUsersByTypeAPI} from "../../Services/UserService.tsx";
import {Pagination} from "../Pagination/Pagination.tsx";
import {toast} from 'react-hot-toast'
import styles from "./ProjectUsers.module.css";
import UserCard from "../UserCard/UserCard.tsx";
import {useAuth} from "../../Context/useAuth.tsx";
import {
    acceptUserToProjectAPI,
    cancelProjectApplicationAPI, cancelInvitationToProjectAPI,
    removeUserFromProjectAPI, inviteUserToProjectAPI
} from "../../Services/ProjectService.tsx";
import {UserPicker} from "../UserPicker/UserPicker.tsx";

type Props = {
    projectId: string;
    authorId: string;
}

export const ProjectUsers = ({projectId, authorId}: Props) => {
    const [activeTab, setActiveTab] = useState<"accepted" | "applied" | "invited" | "toInvite">("accepted");
    const [users, setUsers] = useState<User[]>([]);
    const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const {user: currentUser} = useAuth();

    useEffect(() => {
        loadUsers(1, 10, "accepted");
    }, [projectId]);

    const handleTabChange = async (tab: string) => {
        if (tab != "accepted" && tab != "applied" && tab != "invited" && tab!="toInvite")
            return;

        setActiveTab(tab);
        if(tab=="toInvite") {
            setUsers([]);
            setTotalUsersCount(0);
        }
        else
            await loadUsers(1, 10, tab);
    }

    const loadUsers = async (page: number, pageSize: number, type: string) => {
        try {
            setIsLoading(true);
            const response = await getProjectUsersByTypeAPI(projectId, type, page, pageSize);
            if (response && response.status === 200) {
                setUsers(response.data.data);
                setTotalUsersCount(response.data.totalLength);
            }
        } catch {
            toast.error("Došlo je do greške prilikom učitavanja korisnika.")
        } finally {
            setIsLoading(false);
        }
    }

    const handlePaginateChange = async (page: number, pageSize: number) => {
        await loadUsers(page, pageSize, activeTab);
    }

    const handleAcceptUser = async (userId: string) => {
        try {
            const response = await acceptUserToProjectAPI(projectId, userId);
            if (response && response.status === 200 && response.data) {
                toast.success("Korisnik je uspešno prihvaćen na projekat.");
                setUsers(prev => prev.filter(user => user.id != userId));
            }
        } catch {
            toast.error("Došlo je do greške prilikom prihvatanja korisnika.");
        }
    }

    const handleRemoveUser = async (userId: string) => {
        let response;
        switch (activeTab) {
            case "accepted":
                response = await removeUserFromProjectAPI(projectId, userId);
                break;
            case "applied":
                response = await cancelProjectApplicationAPI(projectId, userId);
                break;
            case "invited":
                response = await cancelInvitationToProjectAPI(projectId, userId);
                break;
        }
        if (response && response.status === 200 && response.data) {
            setUsers(prev => prev.filter(user => user.id != userId));
        }
    }


    const getTitle = (activeTab: string) => {
        switch (activeTab) {
            case "accepted":
                return "Korisnici na projektu";
            case "applied":
                return "Prijavljeni korisnici";
            case "invited":
                return "Pozvani korisnici";
            case "toInvite":
                return "Pozovite korisnike";
        }
    }

    const handleInviteUser = async (user: User) => {
        try {
            const response = await inviteUserToProjectAPI(projectId, user.id);
            if (response && response.status === 200 && response.data) {
                toast.success("Korisnik je uspešno pozvan na projekat.");
            }
        }
        catch(error) {
            toast.error("Došlo je do greške prilikom slanja pozivnice korisniku.")
            console.error(error);
        }
    }

    return (
        <div className={`project-users`}>
            {isLoading
                ?
                (<>
                    <p className={`text-center text-muted`}>Učitavanje korisnika...</p>
                </>)
                : (<>
                    {currentUser?.id === authorId && <div className={`mb-3`}>
                        <button className={`btn mr-2 ${activeTab === "accepted" ? "btn-success" : "btn-muted"}`}
                                onClick={() => handleTabChange("accepted")}>
                            Članovi
                        </button>
                        <button className={`btn mr-2 ${activeTab === "applied" ? "btn-success" : "btn-muted"}`}
                                onClick={() => handleTabChange("applied")}>
                            Prijavljeni
                        </button>
                        <button className={`btn mr-2 ${activeTab === "invited" ? "btn-success" : "btn-muted"}`}
                                onClick={() => handleTabChange("invited")}>
                            Pozvani
                        </button>
                        <button className={`btn ${activeTab === "toInvite" ? "btn-success" : "btn-muted"}`}
                                onClick={() => handleTabChange("toInvite")}>
                            Pozovite korisnike
                        </button>
                    </div>}
                    <h3 className={`text-green mb-4`}>{getTitle(activeTab)}</h3>

                    {activeTab == "toInvite" && <div className={`my-3`}><UserPicker onInviteUser={handleInviteUser} /></div>}

                    {users && users.length > 0 ?
                        (<>
                            <ul className={`list-group`}>
                            {users.map(user => (
                                    <div key={user.id} className={`d-flex align-items-center justify-content-between`}>
                                        <div className={`flex-grow-1 mb-2`}>
                                            <UserCard user={user} key={user.id}/>
                                        </div>
                                        {currentUser?.id === authorId && <>
                                            {activeTab === "applied" &&
                                                <button className={`rounded-3 bg-blue p-3 ms-4 border-0 text-light h-50 ${styles.dugme}`}
                                                        onClick={() => handleAcceptUser(user.id)}>
                                                    Prihvati
                                                </button>}
                                            <button className={`rounded-3 bg-blue p-3 ms-4 border-0 text-light h-50 ${styles.dugme1}`} 
                                                        onClick={() => handleRemoveUser(user.id)}>
                                                    Ukloni
                                            </button>
                                        </>}
                                    </div>
                                ))}
                            </ul>
                        </>) :
                        (<>
                            {activeTab != "toInvite" && <p className={`text-center text-muted`}>Nema korisnika.</p>}
                        </>)}
                </>)}

            {totalUsersCount > 0 &&
                <div className={`my-4`}>
                    <Pagination totalLength={totalUsersCount} onPaginateChange={handlePaginateChange}/>
                </div>}
        </div>
    );
};
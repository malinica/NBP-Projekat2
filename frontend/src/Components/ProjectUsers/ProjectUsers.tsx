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
    removeUserFromProjectAPI
} from "../../Services/ProjectService.tsx";

type Props = {
    projectId: string;
    authorId: string;
}

export const ProjectUsers = ({projectId, authorId}: Props) => {
    const [activeTab, setActiveTab] = useState<"accepted" | "applied" | "invited">("accepted");
    const [users, setUsers] = useState<User[]>([]);
    const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const {user: currentUser} = useAuth();

    useEffect(() => {
        loadUsers(1, 10, "accepted");
    }, [projectId]);

    const handleTabChange = async (tab: string) => {
        if (tab != "accepted" && tab != "applied" && tab != "invited")
            return;

        setActiveTab(tab);
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
                        <button className={`btn ${activeTab === "accepted" ? "btn-success mr-2" : "btn-muted mr-2"}`}
                                onClick={() => handleTabChange("accepted")}>
                            Članovi
                        </button>
                        <button className={`btn ${activeTab === "applied" ? "btn-success mx-2 " : "btn-muted mx-2"}`}
                                onClick={() => handleTabChange("applied")}>
                            Prijavljeni
                        </button>
                        <button className={`btn ${activeTab === "invited" ? "btn-success" : "btn-muted"}`}
                                onClick={() => handleTabChange("invited")}>
                            Pozvani
                        </button>
                    </div>}
                    <h3 className={`text-green mb-4`}>{getTitle(activeTab)}</h3>

                    {users && users.length > 0 ?
                        (<>
                            <ul className={`list-group`}>
                                {users.map(user => (
                                    <div key={user.id} className={`d-flex`}>
                                        <UserCard user={user} key={user.id}/>
                                        {currentUser?.id === authorId && <>
                                            {activeTab === "applied" &&
                                                <button className={`rounded-3 bg-blue p-3 ms-4 border-0 text-light ${styles.dugme}`}
                                                        onClick={() => handleAcceptUser(user.id)}>
                                                    Prihvati
                                                </button>}
                                            <button className={`rounded-3 bg-blue p-3 mx-4 border-0 text-light ${styles.dugme1}`} 
                                                        onClick={() => handleRemoveUser(user.id)}>
                                                    Ukloni
                                            </button>
                                        </>}
                                    </div>
                                ))}
                            </ul>
                        </>) :
                        (<>
                            <p className={`text-center text-muted`}>Nema korisnika.</p>
                        </>)}
                </>)}

            {totalUsersCount > 0 &&
                <div className="my-4">
                    <Pagination totalLength={totalUsersCount} onPaginateChange={handlePaginateChange}/>
                </div>}
        </div>
    );
};
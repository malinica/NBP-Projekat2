import {useEffect, useState} from "react";
import {User} from "../../Interfaces/User/User.ts";
import {getProjectUsersByType} from "../../Services/UserService.tsx";
import {Pagination} from "../Pagination/Pagination.tsx";
import {toast} from 'react-hot-toast'
import UserCard from "../UserCard/UserCard.tsx";
import {useAuth} from "../../Context/useAuth.tsx";

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
        loadUsers(1,10, "accepted");
    }, [projectId]);

    const handleTabChange = async (tab: string) => {
        if(tab!="accepted" && tab!="applied" && tab!="invited")
            return;

        setActiveTab(tab);
        await loadUsers(1,10, tab);
    }

    const loadUsers = async (page: number, pageSize: number, type: string) => {
        try {
            setIsLoading(true);
            const response = await getProjectUsersByType(projectId, type, page, pageSize);
            if(response && response.status === 200) {
                setUsers(response.data.data);
                setTotalUsersCount(response.data.totalLength);
            }
        }
        catch {
            toast.error("Došlo je do greške prilikom učitavanja korisnika.")
        }
        finally {
            setIsLoading(false);
        }
    }

    const handlePaginateChange = async (page: number, pageSize: number) => {
        await loadUsers(page, pageSize, activeTab);
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
        <div className="project-users">
            {isLoading
                ?
                (<>
                    <p className={`text-center`}>Učitavanje korisnika...</p>
                </>)
                : (<>
                    {currentUser?.id === authorId && <div className="btn-group mb-3">
                        <button className={`btn ${activeTab === "accepted" ? "btn-primary" : "btn-secondary"}`}
                                onClick={() => handleTabChange("accepted")}>
                            Članovi
                        </button>
                        <button className={`btn ${activeTab === "applied" ? "btn-primary" : "btn-secondary"}`}
                                onClick={() => handleTabChange("applied")}>
                            Prijavljeni
                        </button>
                        <button className={`btn ${activeTab === "invited" ? "btn-primary" : "btn-secondary"}`}
                                onClick={() => handleTabChange("invited")}>
                            Pozvani
                        </button>
                    </div>}
                    <h3>{getTitle(activeTab)}</h3>
                    <ul className="list-group">
                        {users.map(user => (
                            <div key={user.id} className={`d-flex`}>
                                <UserCard user={user} key={user.id}/>
                                {currentUser?.id === authorId && <>
                                    {activeTab === "applied" && <button className={`bg-green`}>
                                        Prihvati
                                    </button>}
                                    <button className={`bg-lilac`}>
                                        Ukloni
                                    </button>
                                </>}
                            </div>
                        ))}
                    </ul>
                </>)}

            {totalUsersCount > 0 &&
                <div className="my-4">
                    <Pagination totalLength={totalUsersCount} onPaginateChange={handlePaginateChange}/>
                </div>}
        </div>
    );
};
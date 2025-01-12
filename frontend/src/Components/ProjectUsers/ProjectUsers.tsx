import {useEffect, useState} from "react";
import {User} from "../../Interfaces/User/User.ts";
import {getProjectUsersByType} from "../../Services/UserService.tsx";
import {Pagination} from "../Pagination/Pagination.tsx";
import {toast} from 'react-hot-toast'

type Props = {
    projectId: string;
}

export const ProjectUsers = ({projectId}: Props) => {
    const [activeTab, setActiveTab] = useState<"accepted" | "applied" | "invited">("accepted");
    const [users, setUsers] = useState<User[]>([]);
    const [totalUsersCount, setTotalUsersCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

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

    return (
        <div className="project-users">
            {isLoading
                ?
                (<>
                    <p>Učitavanje...</p>
                </>)
                : (<>
                    <div className="btn-group mb-3">
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
                    </div>
                    <ul className="list-group">
                        {users.map(user => (
                            <li key={user.id} className="list-group-item">
                                {user.username} ({user.email})
                            </li>
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
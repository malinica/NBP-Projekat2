import {useEffect, useState} from "react";
import {User} from "../../Interfaces/User/User.ts";
import {getFollowersAPI, getFollowingAPI} from "../../Services/UserService.tsx";
import UserCard from "../UserCard/UserCard.tsx";
import styles from './FollowersFollowingModal.module.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    activeTab: "followers" | "following";
}

export const FollowersFollowingModal = ({ isOpen, onClose, userId, activeTab } : Props) => {
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [canLoadMore, setCanLoadMore] = useState<boolean>(true);
    const pageSize = 10;

    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen, activeTab]);

    const loadData = async () => {
        const response = activeTab === "followers"
            ? await getFollowersAPI(userId, 1, pageSize)
            : await getFollowingAPI(userId, 1, pageSize);

        if (response?.status === 200) {
            setUsers(response.data);
            if(response.data.length < pageSize)
                setCanLoadMore(false);
        }
    };

    const loadMore = async () => {
        const nextPage = page + 1;
        setPage(nextPage);

        const response = activeTab === "followers"
            ? await getFollowersAPI(userId, nextPage, pageSize)
            : await getFollowingAPI(userId, nextPage, pageSize);

        if (response?.status === 200) {
            setUsers(prev => [...prev, ...response.data]);
            if(response.data.length < pageSize)
                setCanLoadMore(false);
        }
    };

    if(!isOpen) return null;

    return (
        <div className={`modal d-block`} style={{backgroundColor: "rgba(0, 0, 0, 0.5)"}}>
            <div className={`modal-dialog`}>
                <div className={`modal-content`}>
                    <div className={`modal-header`}>
                        <h2>{activeTab === "followers" ? "Pratioci" : "Praćenja"}</h2>
                        <button type="button" className={`btn-close`} onClick={onClose}></button>
                    </div>
                    <div className={`modal-body ${styles.modal_body}`}>
                        {users && users.length > 0 ?
                            (<>
                                <ul className={`list-unstyled`}>
                                    {users.map(user => (
                                        <div className="my-2" key={user.id}>
                                            <UserCard user={user}/>
                                        </div>
                                    ))}
                                </ul>
                                {canLoadMore && <button onClick={loadMore}>Učitaj još</button>}
                            </>) :
                            (<>
                                <p>Korisnik {activeTab == "followers" ? "nema pratioce." : "ne prati nijednog korisnika."}</p>
                            </>)}
                    </div>
                </div>
            </div>
        </div>);
};
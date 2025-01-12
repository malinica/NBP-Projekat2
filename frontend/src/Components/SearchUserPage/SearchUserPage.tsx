import { useEffect, useState } from "react";
import { getAllUsersAPI } from "../../Services/UserService";
import { User } from "../../Interfaces/User/User";
import UserCard from "../UserCard/UserCard";

const SearchUserPage = () => {
    const [users, setUsers] = useState<User[] | undefined>(undefined);

    const fetchUsers = async () => {
        const data = await getAllUsersAPI();
        setUsers(data);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className={`container-fluid bg-light-lilac`}>
            <div className={`container my-4 py-2 rounded-3 bg-light-green`}>
                <h1 className={`my-5 text-center text-dark-green`}>Programeri</h1>
                    {users && users.length > 0 ? (
                        users.map((user) => (
                            <div key={user.id} className={`row mb-3`}>
                                <div className={`col`}>
                                    <UserCard user={user} />
                                </div>
                        </div>
                    ))
                    ) : (
                        <div className={`col-12`}>
                            <p className={`text-center text-muted`}>Nema korisnika za prikaz.</p>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default SearchUserPage;

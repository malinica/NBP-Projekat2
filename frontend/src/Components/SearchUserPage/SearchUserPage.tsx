import { useEffect, useState } from "react";
import { getAllUsersAPI } from "../../Services/UserService";
import { User } from "../../Interfaces/User/User";

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
                <div className={`row`}>
                    {users && users.length > 0 ? (
                        users.map((user) => (
                            <div key={user.id} className={`col-md-4 mb-3`}>
                                <div className={`card`}>
                                    <div className={`card-body text-center`}>
                                        <h5 className={`text-violet`}>{user.username}</h5>
                                        <p className={`text-lilac`}>{user.email}</p>
                                    </div>
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
        </div>
    );
};

export default SearchUserPage;

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
        <div className="container my-4">
            <h1 className="my-5 text-center">Programeri</h1>
            <div className="row">
                {users && users.length > 0 ? (
                    users.map((user) => (
                        <div key={user.id} className="col-md-4 mb-3">
                            <div className="card">
                                <div className="card-body text-center">
                                    <h5 className="card-title">{user.username}</h5>
                                    <p className="card-text">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <p className="text-center">Nema korisnika za prikaz.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchUserPage;

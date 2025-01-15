import {useEffect, useState} from "react";
import {toast} from "react-hot-toast";
import {Autocomplete, TextField} from "@mui/material";
import styles from './UserPicker.module.css';
import {User} from "../../Interfaces/User/User.ts";
import {filterUsersAPI} from "../../Services/UserService.tsx";

type Props = {
    onInviteUser: (user: User) => void;
}

export const UserPicker = ({onInviteUser} : Props) => {
    const [, setInputValue] = useState("");
    const [options, setOptions] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        handleSearch('');
    }, []);

    const handleInviteUser = () => {
        if (selectedUser) {
            onInviteUser(selectedUser);
            setSelectedUser(null);
            setInputValue("");
        }
    }

    const handleSearch = async (username: string) => {
        try {
            const response = await filterUsersAPI(username, [], 1, 10);
            if(response && response.status === 200) {
                setOptions(response.data.data);
            }
        }
        catch(error) {
            toast.error("Došlo je do greške prilikom pretrage korisnika.");
            console.error(error);
        }
    };

    return (
        <div className={`my-3 d-flex`}>
            <div className={`me-3`} style={{width: "300px"}}>
                <Autocomplete
                    options={options}
                    getOptionLabel={(option) => option.username}
                    filterOptions={(x) => x}
                    onInputChange={async (_, newInputValue) => {
                        setInputValue(newInputValue);
                        await handleSearch(newInputValue);
                    }}
                    onChange={(_, newValue) => setSelectedUser(newValue)}
                    renderInput={(params) => <TextField {...params} label="Pronađi korisnika" variant="outlined" fullWidth/>}
                />
            </div>

            <button
                className={`btn-lg text-white text-center rounded-3 border-0 py-2 px-2 flex-shrink-0 ${styles.slova} ${styles.dugme1} ${styles.linija_ispod_dugmeta}`}
                onClick={handleInviteUser}
                disabled={!selectedUser}
                type="button"
            >
                Pozovi Korisnika
            </button>

        </div>
    );
};
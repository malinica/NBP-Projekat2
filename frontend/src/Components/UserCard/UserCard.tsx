import { User } from "../../Interfaces/User/User";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faLink, faUser} from "@fortawesome/free-solid-svg-icons";
import styles from "./UserCard.module.css";
import {Link} from "react-router-dom";

type Props = { 
    user:User;
}

const UserCard = ({ user }:Props) => {

    return (
        <div className={`card`}>
            <div className={`card-body d-flex align-items-center`}>
                {user.profileImage ? (
                        <img 
                            src={user.profileImage} 
                            alt={`${user.username}'s profile`} 
                            className={`rounded-circle me-3 ${styles.slika}`} 
                        />
                    ) : (
                        <div 
                            className={`rounded-circle bg-success d-flex justify-content-center align-items-center me-3 ${styles.slika}`} 
                        >
                            <FontAwesomeIcon icon={faUser} className={`text-white`} size="2x" />
                        </div>
                    )}
                <div>
                    <h5 className={`text-violet`}>{user.username}</h5>
                    <p className={`text-lilac`}>{user.email}</p>
                    <Link to={`/profile-page/${user.username}`}>
                        <FontAwesomeIcon icon={faLink} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UserCard;
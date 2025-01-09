import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Link} from "react-router-dom";
import styles from './Navbar.module.css'
import {useAuth} from "../../Context/useAuth.tsx";
import {useLocation} from "react-router";
import {faBars, faUser} from "@fortawesome/free-solid-svg-icons";
import {Dropdown} from "react-bootstrap";

export const Navbar = () => {
    const {isLoggedIn, logout, user} = useAuth();

    const location = useLocation();

    const handleLogout = () => {
        logout();
    };

    const getLinkClass = (path: string) => {
        return location.pathname === path
            ? `${styles.link} ${styles['link-hover']} ${styles.active}`
            : `${styles.link} ${styles['link-hover']}`;
    };

    return (
        <>
            <nav className={`navbar navbar-expand-xl bg-baby-blue`} id="mainNav">
                <div className={`container text-center`}>
                    <Link className={`navbar-brand`} to="/">
                        <img className={`${styles.logo}`} src="src/assets/logo.png" alt="logo"/>
                    </Link>
                    <button className={`navbar-toggler`} type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarResponsive">
                        <FontAwesomeIcon icon={faBars}/>
                    </button>
                    <div className={`collapse navbar-collapse justify-content-xl-end`} id="navbarResponsive">
                        <ul className={`navbar-nav justify-content-center flex-wrap`}>
                            <li className="my-2 text-end">
                                <Link to={"/"} className={` ${getLinkClass("#onama")}`}>O NAMA</Link>
                            </li>

                            {isLoggedIn()
                                ?
                                <li className={`ms-3 text-end`}>
                                    <Dropdown>
                                        <Dropdown.Toggle className={styles['user-dropdown']} variant="light"
                                                         id="dropdown-basic">
                                            <FontAwesomeIcon icon={faUser}/> {user!.username.toUpperCase()}
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu align={'end'}>
                                            <Dropdown.Divider/>
                                            <Dropdown.Item onClick={handleLogout}
                                                           className={styles['custom-dropdown-item1']}>ODJAVI
                                                SE</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </li>
                                :
                                <>
                                    <li className={`my-2 text-end`}><Link to="/login"
                                                                          className={`${getLinkClass("/login")} ${styles.link} ${styles['link-hover']}`}>PRIJAVA</Link>
                                    </li>
                                    <li className={`my-2 text-end`}><Link to="/register"
                                                                          className={`${getLinkClass("/register")} ${styles.link} ${styles['link-hover']}`}>REGISTRACIJA</Link>
                                    </li>
                                </>
                            }
                        </ul>
                    </div>

                </div>
            </nav>

        </>
    );
};
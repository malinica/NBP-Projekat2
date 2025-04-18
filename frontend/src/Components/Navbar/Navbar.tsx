import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import styles from './Navbar.module.css'
import { useAuth } from "../../Context/useAuth.tsx";
import { useLocation, useNavigate } from "react-router";
import { faBars, faUser } from "@fortawesome/free-solid-svg-icons";
import { Dropdown } from "react-bootstrap";


export const Navbar = () => {
    const navigate = useNavigate();
    const { isLoggedIn, logout, user } = useAuth();

    const location = useLocation();

    const handleLogout = () => {
        logout();
    };
    const handleProfileRedirect = () => {
        if (user) {
            navigate(`/profile-page/${user.username}`);
        }
    };

    const getLinkClass = (path: string) => {
        return location.pathname === path
            ? `${styles.link} ${styles['link-hover']} ${styles.active}`
            : `${styles.link} ${styles['link-hover']}`;
    };

    return (
        <>
            <nav className={`navbar navbar-expand-xl bg-light-lilac`} id="mainNav">
                <div className={`container text-center`}>
                    <div className={`${styles.navbarBrandContainer}`}>
                        <Link className={`navbar-brand`} to="/">
                            <img className={`${styles.logo}`} src="src/assets/logo2.png" alt="logo" />
                        </Link>
                        <Link className={`${styles.title}`} to="/">
                            <span className={`${styles.proText}`}>Pro</span>
                            <span className={`${styles.connectText}`}>Connect</span>
                        </Link>
                    </div>

                    <button className={`navbar-toggler`} type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarResponsive">
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                    <div className={`collapse navbar-collapse justify-content-xl-end`} id="navbarResponsive">
                        <ul className={`navbar-nav justify-content-center flex-wrap`}>
                            <li className={`my-2 text-end`}>
                                <Link to={"/"} className={` ${getLinkClass("#onama")}`}>O NAMA</Link>
                            </li>

                            {isLoggedIn()
                                ?
                                <>
                                    <li className={`my-2 text-end`}>
                                        <Link to={"/create-project"} className={`${getLinkClass("/create-project")}`}>KREIRAJ PROJEKAT</Link>
                                    </li>
                                    <li className={`my-2 text-end`}>
                                        <Link to={"/search-projects-page"} className={`${getLinkClass("/search-projects-page")}`}>PROJEKTI</Link>
                                    </li>
                                    <li className={`my-2 text-end`}>
                                        <Link to={`/my-projects-page/${user?.id}`} className={`${getLinkClass(`/my-projects-page/${user?.id}`)}`}>MOJI PROJEKTI</Link>
                                    </li>
                                    <li className={`my-2 text-end`}>
                                        <Link to={"/search-user-page"} className={`${getLinkClass("/search-user-page")}`}>KORISNICI</Link>
                                    </li>
                                    {user?.role == 'Admin' &&
                                        <li className={`my-2 text-end`}>
                                            <Link to={"/tags"} className={`${getLinkClass("/tags")}`}>TAGOVI</Link>
                                        </li>
                                    }
                                    <li className={`ms-3 text-end`}>
                                        <Dropdown>
                                            <Dropdown.Toggle className={styles['user-dropdown']} variant="light"
                                                id="dropdown-basic">
                                                <FontAwesomeIcon icon={faUser} /> {user!.username.toUpperCase()}
                                            </Dropdown.Toggle>

                                            <Dropdown.Menu align={'end'}>
                                                <Dropdown.Item onClick={handleProfileRedirect} className={styles['custom-dropdown-item1']}>MOJ PROFIL</Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Item onClick={handleLogout} className={styles['custom-dropdown-item1']}>ODJAVI SE</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </li>
                                </>
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
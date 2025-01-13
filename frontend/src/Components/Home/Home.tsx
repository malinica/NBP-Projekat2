import styles from "./Home.module.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from 'react';
import { faSearch, faUsers, faTasks } from "@fortawesome/free-solid-svg-icons";
import pocetna from "../../Assets/pocetna2.png";

const Home = () => {

    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
          window.removeEventListener("scroll", handleScroll);
        };
      }, []);

    const handleScroll = () => {
        if (window.scrollY > 20) {
          setShowButton(true);
        } else {
          setShowButton(false);
        }
      };

    const scrollToTop = () => {
        window.scrollTo({top: 0, behavior: "smooth"});
    };

    return (
        <div className={`container-fluid p-0 bg-light-lilac`}>
            <div className={`container d-flex justify-content-between flex-grow-1`}>
                <div className={`row container-fluid d-flex justify-content-center my-4`}>
                    <div className={`col-xxl-3 col-xl-4 col-lg-4 col-md-12 col-sm-12 text-center mx-5 mt-5`}>
                        <h1 className={`text-green`}>Tvoj projekat zaslužuje sjajne saradnike!</h1>
                        <p className={`lead text-violet fw-normal my-4`}>
                        Bilo da ti treba front-end, back-end ili full-stack programer, naš cilj je da ti pomognemo da pronađeš najbolje ljude za svoj tim. Započni svoj projekat i poveži se sa talentima već danas!
                        </p>
                        <Link
                                to="/search-user-page"
                                className={`btn-lg text-white text-center rounded py-2 px-3 ${styles.slova1} ${styles.dugme2} ${styles.linija_ispod_dugmeta}`}
                            >
                                Pronađi Saradnika
                        </Link>
                    </div>
                    <div className={`col-sm-12 col-md-12 col-lg-6 col-xl-6 col-xxl-7 d-flex justify-content-cetner mx-5`}>
                        <img src={pocetna} alt="pocetna slika" className={`img-fluid mt-4 ml-5 ${styles.slika}`}/>
                    </div>
                </div>
            </div>

            <hr className={`text-dark-green mx-5`}></hr>

            <div className={`container my-5 d-flex justify-content-center`}>
                <div className={`row justify-content-center text-center`}>
                    <div className={`col-md-3`}>
                        <FontAwesomeIcon icon={faUsers} className={`text-lime-green fs-1`} />            
                        <h5 className={`mt-3 text-green`}>Povezivanje sa stručnjacima</h5>
                        <p className={`text-violet`}>Pronađite talentovane programere za svoj projekat u nekoliko klikova.</p>
                        <Link
                                to=""
                                className={`btn-lg text-white text-center rounded py-2 px-2 ${styles.slova} ${styles.dugme1} ${styles.linija_ispod_dugmeta}`}
                            >
                                Pronađi Saradnike
                        </Link>
                    </div>
                    <div className={`col-md-3`}>
                        <FontAwesomeIcon icon={faTasks} className={`text-lime-green fs-1`} />
                        <h5 className={`mt-3 text-green`}>Efikasna organizacija</h5>
                        <p className={`text-violet`}>Kreirajte projekte, dodajte članove tima i organizujte zadatke.</p>
                        <Link
                                to="/"
                                className={`btn-lg text-white text-center rounded py-2 px-2 ${styles.slova} ${styles.dugme1} ${styles.linija_ispod_dugmeta}`}
                            >
                                Kreiraj Projekat
                        </Link>
                    </div>
                    <div className={`col-md-3`}>
                        <FontAwesomeIcon icon={faSearch} className={`text-lime-green fs-1`} />
                        <h5 className={`mt-3 text-green`}>Brza pretraga</h5>
                        <p className={`text-violet`}>Koristite napredne filtere za brzo pronalaženje projekata.</p>
                        <Link
                                to="/search-projects-page"
                                className={`btn-lg text-white text-center rounded py-2 px-2 ${styles.slova} ${styles.dugme1} ${styles.linija_ispod_dugmeta}`}
                            >
                                Brza Pretraga
                        </Link>
                    </div>
                </div>
            </div>

            <hr className={`text-dark-green mx-5`}></hr>

            <div className={`text-center bg-light-lilac py-5`}>
                <h2 className={`text-violet`}>Spremni za sledeći korak?</h2>
                <p className={`text-green`}>Registrujte se i pronađite savršene saradnike za svoje projekte već danas!</p>
                <Link to="/register" className={`btn-lg text-white text-center rounded py-2 px-2 ${styles.slova} ${styles.dugme1} ${styles.linija_ispod_dugmeta}`}>Registruj Se</Link>
            </div>

            <button onClick={scrollToTop} className={`bg-dark-green text-white ${styles.pocetak} ${showButton ? 'd-block' : 'd-none'}`} title="Idi na pocetak">^</button>
        </div>
    );
}

export default Home;
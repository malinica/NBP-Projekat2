import {Link} from "react-router-dom";

export const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div
            className={`footer container-fluid py-2 text-center text-white bg-steel-blue`}
        >
            <div className={`container navbar navbar-expand-lg justify-content-center`}>
                <ul className={`navbar-nav mt-2 mb-1`}>
                    <li className={`nav-item`}>
                        <a href="#onama" className={`text-white mx-2 text-decoration-none`} onClick={scrollToTop}>
                            O NAMA
                        </a>
                    </li>
                    <li className={`nav-item`}>
                        <Link to="/search-page/1" className={`text-white mx-2 text-decoration-none`}
                              onClick={scrollToTop}>
                            Nesto
                        </Link>
                    </li>
                    <li className={`nav-item`}>
                        <Link to="/login" className={`text-white mx-2 text-decoration-none`} onClick={scrollToTop}>
                            PRIJAVA
                        </Link>
                    </li>
                    <li className={`nav-item`}>
                        <Link to="/register" className={`text-white mx-2 text-decoration-none`} onClick={scrollToTop}>
                            REGISTRACIJA
                        </Link>
                    </li>
                </ul>
            </div>

            <hr className={`text-orange`}/>
            <p className={`text-center pt-2`}>&copy;App Name</p>
        </div>
    );
};
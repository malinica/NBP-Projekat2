import styles from "./SearchProjectsPage.module.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useState } from 'react';
import { useAuth } from "../../Context/useAuth";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import {searchProjectsAPI} from "../../Services/ProjectService";
import { ProjectPage } from "../ProjectPage/ProjectPage";
import { Project } from "../../Interfaces/Project/Project";
import { useEffect } from "react";

type Props = {};
const SearchProjectsPage = () => {
    const { id } = useParams();
    const [currentPageNumber, setCurrentPageNumber] = useState<number>(id ? parseInt(id, 10) : 1);
    const [projectsPerPage, setProjectsPerPage] = useState<number>(10);
    const [projectsPageArray, setProjectsPerPageArray] = useState<number[]>([5, 10, 15,]);
    const [serachName, setSearchName] = useState<string>("");
    const [tags, setTags] = useState<string[]>([]);
    const [dateFrom,setDateFrom]=useState<Date|null>(null);
    const [dateTo,setDateTo]=useState<Date|null>(null);
    const [projects,setProjects]=useState<Project[]|null>([]);
    
    useEffect(() => {
        loadProjects();
    }, []);
    
    useEffect(()=>{loadProjects();},[currentPageNumber,projectsPerPage]);
    

    const handleButtonSearchClick = () => {
        loadProjects();
    }
    const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value ? new Date(e.target.value) : null;
        setDateFrom(newDate);
      };
      
      const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value ? new Date(e.target.value) : null;
        setDateTo(newDate);
      };
    
    const handleSearchTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchName(e.target.value);
      };

      const changePageNumber = (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
      ) => {
        const valueString = e.currentTarget.getAttribute("data-value");
        const valueNumber = valueString !== null ? parseInt(valueString, 10) : 1;
        setCurrentPageNumber(valueNumber);
        window.history.pushState({}, '', `http://localhost:5173/search-page/${valueNumber}`);
    };
  
    const changePageNumberPerPage = (
        e: React.MouseEvent<HTMLAnchorElement>
      ) => {
        const selectedValue = e.currentTarget.getAttribute("data-value");
        if (selectedValue !== null && Number(selectedValue) !== projectsPerPage) {
          setProjectsPerPage(Number(selectedValue));
        }
      };

      const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const isChecked = e.target.checked;
  
        if (isChecked) {
          setTags((prev) => [...prev, value]);
        } else {
            setTags((prev) => prev.filter((cat) => cat !== value));
        }
      };

      const loadProjects = async () => {
  const data = await searchProjectsAPI(
    serachName,
    tags,
    dateFrom ?? undefined, 
    dateTo ?? undefined,
    (currentPageNumber - 1) * projectsPerPage,
    projectsPerPage
);

setProjects(data ?? null);
};


      return (
        <div className={`container`}>
          <div className={`row`}>
            <div className={`col-xxl-3 col-xl-3 col-lg-4 col-md-5 col-sm-12 my-2 mr-2`}>
              <div className={`m-2 px-2 py-3 bg-steel-blue rounded-3 d-flex flex-column`}>
                <label className={`mx-2 text-cyan-blue`}>Odaberite tagove: </label>
                {Object.values(tags).map((tag) => (
                  <div key={tag} className={`m-2 text-coral`}>
                    <input
                      type="checkbox"
                      id={tag}
                      value={tag}
                      onChange={handleTagChange}
                    />
                    <label htmlFor={tag}>{tag}</label>
                  </div>
                ))}
    
                <label className={`mx-2 text-cyan-blue`}>Unesite naziv projekta: </label>
                <div className={`d-flex flex-column ms-2 me-2 my-2`}>
                  <input
                    className={`form-control rounded-2`}
                    value={serachName}
                    onChange={handleSearchTitleChange}
                  ></input>
                </div>
                

<label className="mx-2 text-cyan-blue">Odaberite početni datum: </label>
<div className="d-flex flex-column ms-2 me-2 my-2">
  <input
    type="date"
    className="form-control rounded-2"
    value={dateFrom ? dateFrom.toISOString().split('T')[0] : ''}
    onChange={handleDateFromChange}
  />
</div>

<label className="mx-2 text-cyan-blue">Odaberite krajnji datum: </label>
<div className="d-flex flex-column ms-2 me-2 my-2">
  <input
    type="date"
    className="form-control rounded-2"
    value={dateTo ? dateTo.toISOString().split('T')[0] : ''}
    onChange={handleDateToChange}
  />
</div>
    
                <button
                  className={`btn-md m-2 text-white text-center rounded py-2 px-2 ${styles.dugme1} ${styles.linija_ispod_dugmeta}`}
                  type="button"
                  id="buttonSearch"
                  onClick={handleButtonSearchClick}
                >Pretraži Aukcije</button>
              </div>
            </div>
    
           
    
    
            <div className={`d-flex justify-content-end`}>
              <div className={`my-2 dropdown`}>
                <button
                  className={`${styles.ivica} rounded px-2 py-2 dropdown-toggle bg-orange text-white text-decoration-none border-none`}
                  type="button"
                  id="dropdownMenuButton1"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Broj projekta po stranici: {projectsPerPage}
                </button>
                <ul className={`dropdown-menu`} aria-labelledby="dropdownMenuButton1">
                  {projectsPageArray.map((value) => (
                    <li key={value}>
                      <a
                        className={`dropdown-item`}
                        data-value={value}
                        onClick={(e) => changePageNumberPerPage(e)}
                      >
                        {value}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
    
    
            <nav className={`mt-2 me-2 d-flex justify-content-end`}>
                  <ul className={`pagination`}>
                    {currentPageNumber != 1 && (
                      <>
                        <li className={`page-item`}>
                          <a
                            className={`btn btn-sm text-white text-center rounded py-1 px-1 ${styles.dugme2} ${styles.linija_ispod_dugmeta}`}
                            data-value={currentPageNumber - 1}
                            onClick={(e) => {
                              changePageNumber(e);
                            }}
                          >
                            Prethodna
                          </a>
                        </li>
                      </>
                    )}
                              
                    {(
                      ((projects!=null) && projects.length==projectsPerPage)
                    ) && (
                      <>
                        <li className={`page-item`}>
                          <a
                            className={`btn btn-sm text-white text-center rounded py-1 px-1 ${styles.dugme2} ${styles.linija_ispod_dugmeta}`}
                            data-value={currentPageNumber + 1}
                            onClick={(e) => {
                              changePageNumber(e);
                            }}
                          >
                            Sledeća
                          </a>
                        </li>
                      </>
                    )}
                  </ul>
                </nav>
    
          </div>
        </div>
      );
};
export default SearchProjectsPage;

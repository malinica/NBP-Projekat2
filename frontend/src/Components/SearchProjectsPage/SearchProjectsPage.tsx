import styles from "./SearchProjectsPage.module.css";
import { useState } from 'react';
import toast from "react-hot-toast";
import {getRecommendedProjects, searchProjectsAPI} from "../../Services/ProjectService";
import { Project } from "../../Interfaces/Project/Project";
import { Pagination } from "../Pagination/Pagination";
import { useEffect } from "react";
import { TagPicker } from "../TagPicker/TagPicker";
import { Tag } from "../../Interfaces/Tag/Tag";
import ProjectItem from "../ProjectItem/ProjectItem";

const SearchProjectsPage = () => {
  const [totalProjectsCount, setTotalProjectsCount] = useState<number>(0);
  const [serachName, setSearchName] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [projects, setProjects] = useState<Project[] | null>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"search"|"suggested">("suggested");

  const handleAddTag = (tag: Tag) => {
    setSelectedTags((prev) => [...prev, tag]);
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.id !== tagId));
  };

    useEffect(() => {
        loadSuggestedProjects();
    }, []);

  const handleButtonSearchClick = async () => {
      if(viewMode === "suggested")
          setViewMode("search");

      await loadProjects(1,10);
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

  const loadProjects = async (page: number, pageSize: number) => {
    setIsLoading(true);
    const data = await searchProjectsAPI(
        serachName,
        selectedTags,
        dateFrom ?? undefined,
        dateTo ?? undefined,
        page,
        pageSize);
    if (!data) {
      toast.error("Nema podataka za prikaz!");
      setProjects(null);
      setTotalProjectsCount(0);
    } else {
      setProjects(data.data);
      setTotalProjectsCount(data?.totalLength ?? 0);
    }
    setIsLoading(false);
  };

  const handlePaginateChange = async (page: number, pageSize: number) => {
    await loadProjects(page, pageSize);
  }

  const loadSuggestedProjects = async () => {
    try {
      setIsLoading(true);
      const response = await getRecommendedProjects();
      if(response && response.status === 200) {
        setProjects(response.data);
        setTotalProjectsCount(0);
      }
    }
    catch {
      toast.error("Došlo je do greške prilikom učitavanja predloženih projekata.");
    }
    finally {
      setIsLoading(false);
    }
  }


  return (
    <div className={`container`}>
      <div className={`row`}>
        <div className={`col-xxl-3 col-xl-3 col-lg-4 col-md-5 col-sm-12 my-2 mr-2`}>
          <div className={`m-2 px-2 py-3 rounded-3 d-flex flex-column bg-green`}>
            <div className={`mb-3 mx-1`}>
              <TagPicker selectedTags={selectedTags} onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} />
            </div>

            <label className={`mx-2 text-dark-green`}>Unesite naziv projekta: </label>
            <div className={`d-flex flex-column ms-2 me-2 my-2`}>
              <input
                className={`form-control rounded-2`}
                value={serachName}
                onChange={handleSearchTitleChange}
              ></input>
            </div>


            <label className={`mx-2 text-dark-green`}>Odaberite početni datum: </label>
            <div className={`d-flex flex-column ms-2 me-2 my-2`}>
              <input
                type="date"
                className={`form-control rounded-2`}
                value={dateFrom ? dateFrom.toISOString().split('T')[0] : ''}
                onChange={handleDateFromChange}
              />
            </div>

            <label className={`mx-2 text-dark-green`}>Odaberite krajnji datum: </label>
            <div className={`d-flex flex-column ms-2 me-2 my-2`}>
              <input
                type="date"
                className={`form-control rounded-2`}
                value={dateTo ? dateTo.toISOString().split('T')[0] : ''}
                onChange={handleDateToChange}
              />
            </div>

            <button
              className={`btn-md m-2 text-white text-center rounded py-2 px-2 mt-4 ${styles.fields} ${styles.dugme} ${styles.linija_ispod_dugmeta}`}
              type="button"
              id="buttonSearch"
              onClick={handleButtonSearchClick}
            >Pretraži projekte</button>
          </div>
        </div>
          <div className={`col-xxl-9 col-xl-9 col-lg-8 col-md-7 col-sm-12 my-3`}>
              {viewMode === "suggested" &&
                  <h2 className={`mb-4 text-green text-center`}>Predloženi projekti</h2>}
              {isLoading ?
                  (<p className={`text-center`}>Učitavanje projekata...</p>)
                  :
                  (<>
                      {projects && projects.length > 0 ? (
                          projects.map((project) => (
                              <ProjectItem key={project.id} project={project}/>
                          ))
                      ) : (<>
                          <p className={`text-center text-muted`}>Nema projekata za prikazivanje.</p>
                          {viewMode==="suggested" && <p className={`text-center text-muted`}>
                              Zapratite druge korisnike ili dodajte tagove na svoj profil.</p>}
                      </>
                      )}
                  </>)}
          </div>

          {totalProjectsCount > 0 &&
              <div className={`my-4`}>
                  <Pagination totalLength={totalProjectsCount} onPaginateChange={handlePaginateChange}/>
              </div>}

      </div>
    </div>
  );
};
export default SearchProjectsPage;

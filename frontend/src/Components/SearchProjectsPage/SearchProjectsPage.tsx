import styles from "./SearchProjectsPage.module.css";
import { useState } from 'react';
import toast from "react-hot-toast";
import { searchProjectsAPI } from "../../Services/ProjectService";
import { Project } from "../../Interfaces/Project/Project";
import { Pagination } from "../Pagination/Pagination";
import { useEffect } from "react";
import { TagPicker } from "../TagPicker/TagPicker";
import { Tag } from "../../Interfaces/Tag/Tag";
import ProjectItem from "../ProjectItem/ProjectItem";

const SearchProjectsPage = () => {
  const [totalItemsCount, setTotalItemsCount] = useState<number>(0);
  const [serachName, setSearchName] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [projects, setProjects] = useState<Project[] | null>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const handleAddTag = (tag: Tag) => {
    setSelectedTags((prev) => [...prev, tag]);
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.id !== tagId));
  };
  useEffect(() => { loadProjects(1, 10); }, []);

  const handleButtonSearchClick = () => {
    loadProjects(1, 10);
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
    const data = await searchProjectsAPI(
      serachName,
      selectedTags,
      dateFrom ?? undefined,
      dateTo ?? undefined,
      page,
      pageSize);

    if (!data || data.length === 0) {
      toast.error("Nema podataka za prikaz!");
      setProjects(null);
    } else {
      setProjects(data);
    } setTotalItemsCount(data?.length ?? 0);
    window.history.pushState({}, '', `http://localhost:5173/search-projects-page/${page}`);
  };

  const handlePaginateChange = async (page: number, pageSize: number) => {
    await loadProjects(page, pageSize);
  }


  return (
    <div className={`container`}>
      <div className={`row`}>
        <div className={`col-xxl-3 col-xl-3 col-lg-4 col-md-5 col-sm-12 my-2 mr-2`}>
          <div className={`m-2 px-2 py-3 bg-steel-blue rounded-3 d-flex flex-column`}>

            <div className={`mb-3`}>
              <TagPicker selectedTags={selectedTags} onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} />
            </div>

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

        <div className="project-list">
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <ProjectItem key={project.id} project={project} />
            ))
          ) : (
            <p>Nema projekata za prikazivanje.</p>
          )}
        </div>

        {totalItemsCount > 0 &&
          <div className="my-4">
            <Pagination totalLength={totalItemsCount} onPaginateChange={handlePaginateChange} />
          </div>}

      </div>
    </div>
  );
};
export default SearchProjectsPage;

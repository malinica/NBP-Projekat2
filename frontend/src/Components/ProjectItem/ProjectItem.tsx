import React from "react";
import { useNavigate } from "react-router-dom";
import { Project } from "../../Interfaces/Project/Project.ts";
import styles from "./ProjectItem.module.css";

interface ProjectItemProps {
  project: Project;
}

export const ProjectItem: React.FC<ProjectItemProps> = ({ project }) => {
  const navigate = useNavigate();

  const handleViewMore = () => {
    navigate(`/projects/${project.id}`);

  };

  return (
    <div className={`row justify-content-center align-items-center rounded-3 bg-light-green mx-1 py-4 mb-4`}>
      <div className={`col-12 col-lg-6 col-md-6 d-flex justify-content-center align-items-center`}>
        <img src={`${import.meta.env.VITE_SERVER_URL}/${project.image}`} alt={project.title} className={`${styles.slika}`}/>
      </div>
      <div className={`col-lg-6 text-lg-start text-center mb-4`}>
        <h2 className={`text-dark-green`}>{project.title}</h2>
        <p className={`text-violet`}>{project.description}</p>
        <p className={`text-lilac`}>
          Kreirano: {new Date(project.createdAt).toLocaleDateString("sr-RS")}
        </p>
          
        <div className={``}>
      {project.tags && project.tags.filter((tag) => tag && tag.name).length > 0 ? (
        <p className={`text-green`}>Tagovi: {project.tags.filter((tag) => tag && tag.name).map((tag) => tag.name).join(" · ")}</p>
      ) : (
        <p className={`text-green`}>Nema tagova za ovaj projekat</p>
      )}
          <button onClick={handleViewMore} className={`rounded-3 border-0 p-3 mt-2 text-light ${styles.dugme}`}>
            Više informacija
          </button>
        </div>  
      </div>  
    </div>
  );
};

export default ProjectItem;

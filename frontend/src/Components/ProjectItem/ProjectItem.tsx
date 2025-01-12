import React from "react";
import { useNavigate } from "react-router-dom";
import { Project } from "../../Interfaces/Project/Project.ts";

interface ProjectItemProps {
  project: Project;
}

export const ProjectItem: React.FC<ProjectItemProps> = ({ project }) => {
  const navigate = useNavigate();

  const handleViewMore = () => {
    navigate(`/projects/${project.id}`, { state: { projectData: project } });

  };

  return (
    <div className="project-card">
      <img src={project.image} alt={project.title} className="project-image" />
      <h2 className="project-title">{project.title}</h2>
      <p className="project-description">{project.description}</p>
      <p className="project-author">
        {project.createdBy ? `Autor: ${project.createdBy.username}` : "Autor: Nepoznat"}
      </p>
      <p className="project-date">
        Kreirano: {new Date(project.createdAt).toLocaleDateString("sr-RS")}
      </p>
      <button onClick={handleViewMore} className="view-more-button">
        Više informacija
      </button>
    </div>
  );
};

export default ProjectItem;

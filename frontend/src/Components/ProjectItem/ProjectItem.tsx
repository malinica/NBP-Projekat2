import React from "react";
import { useNavigate } from "react-router-dom";
import { Project } from "../../Interfaces/Project/Project.ts";

interface ProjectItemProps {
  project: Project;
}

export const ProjectItem: React.FC<ProjectItemProps> = ({ project }) => {
  const navigate = useNavigate();

  const handleViewMore = () => {
    navigate(`/projects/${project.id}`);

  };

  return (
    <div className="project-card">
      <img src={`${import.meta.env.VITE_SERVER_URL}/${project.image}`} alt={project.title} className="project-image" />
      <h2 className="project-title">{project.title}</h2>
      <p className="project-description">{project.description}</p>
      <p className="project-date">
        Kreirano: {new Date(project.createdAt).toLocaleDateString("sr-RS")}
      </p>
        
      <div className="project-tags">
  {project.tags && project.tags.filter((tag) => tag && tag.name).length > 0 ? (
    <p>Tagovi: {project.tags.filter((tag) => tag && tag.name).map((tag) => tag.name).join(" · ")}</p>
  ) : (
    <p>Nema tagova za ovaj projekat</p>
  )}
</div>

        
      <button onClick={handleViewMore} className="view-more-button">
        Više informacija
      </button>
    </div>
  );
};

export default ProjectItem;

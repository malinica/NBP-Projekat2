import {useParams} from "react-router-dom";
import {Project} from "../../Interfaces/Project/Project.ts";
import {useEffect, useState} from "react";
import {getProjectByIdAPI} from "../../Services/ProjectService.tsx";
import {toast} from 'react-hot-toast'
import {getStatusBadgeClass} from "../../Helpers/Helpers.ts";
import {Chip} from "@mui/material";
import {useAuth} from "../../Context/useAuth.tsx";
import {TagPicker} from "../TagPicker/TagPicker.tsx";
import {Tag} from "../../Interfaces/Tag/Tag.ts";

export const ProjectPage = () => {
    const {projectId} = useParams();
    const {user} = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        loadProject();
    }, []);

    const loadProject = async () => {
        try {
            const response = await getProjectByIdAPI(projectId ?? "");
            if (response && response.status === 200) {
                setProject(response.data);
            }
        } catch {
            toast.error("Greška pri učitavanju projekta.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleAddTag = (tag: Tag) => {
        // setSelectedTags((prev) => [...prev, tag]);
    };

    const handleRemoveTag = (tagId: string) => {
        // setSelectedTags((prev) => prev.filter((tag) => tag.id !== tagId));
    };

    return (
        <div className={`container`}>
            {isLoading
                ?
                (<>
                    <p>Učitavanje projekta...</p>
                </>)
                :
                (<>
                    {project ?
                        (<>
                            <div className="card p-3 shadow">
                                <div className="row g-0">

                                    <div className="col-md-4">
                                        <img
                                            src={`${import.meta.env.VITE_SERVER_URL}/${project.image}`}
                                            className="img-fluid rounded-start"
                                            alt={project.title}
                                        />
                                    </div>

                                    <div className="col-md-8">
                                        <div className="card-body">
                                            <h2 className="card-title">{project.title}</h2>
                                            <p className="card-text">{project.description}</p>
                                            <span className={getStatusBadgeClass(project.status)}>
                                                {project.status}
                                            </span>
                                            <p>Autor: {project.createdBy?.username}</p>
                                            <hr/>
                                            <p className="text-muted">
                                                Kreirano: {new Date(project.createdAt).toLocaleDateString('sr')} <br/>
                                                Ažurirano: {new Date(project.updatedAt).toLocaleDateString('sr')}
                                            </p>
                                            {project.createdBy?.id == user?.id &&
                                                <div className="d-flex justify-content-start mt-3">
                                                    <button className="btn btn-primary me-2">Izmeni</button>
                                                    <button className="btn btn-danger">Obriši</button>
                                                </div>}
                                            <div>
                                                {user && project.createdBy?.id == user?.id
                                                    ?
                                                    (<>
                                                        <TagPicker selectedTags={project.tags} onAddTag={handleAddTag}
                                                                   onRemoveTag={handleRemoveTag}/>
                                                    </>)
                                                    :
                                                    (<>
                                                        {project.tags.map((tag) => (
                                                            <Chip key={tag.id} className={`ms-2`} label={tag.name}
                                                                  color="success"/>
                                                        ))}
                                                    </>)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>) :
                        (<>
                            <p>Nema podataka o projektu.</p>
                        </>)}
                </>)
            }
        </div>
    );
};
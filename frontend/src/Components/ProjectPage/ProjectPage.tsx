import {useParams} from "react-router-dom";
import {Project} from "../../Interfaces/Project/Project.ts";
import {useEffect, useState} from "react";
import {deleteProjectAPI, getProjectByIdAPI, updateProjectAPI} from "../../Services/ProjectService.tsx";
import {toast} from 'react-hot-toast'
import {getStatusBadgeClass} from "../../Helpers/Helpers.ts";
import {Chip} from "@mui/material";
import {useAuth} from "../../Context/useAuth.tsx";
import {TagPicker} from "../TagPicker/TagPicker.tsx";
import {Tag} from "../../Interfaces/Tag/Tag.ts";
import {addTagToProjectAPI, removeTagFromProjectAPI} from "../../Services/TagService.tsx";
import {useNavigate} from "react-router";
import styles from "./ProjectPage.module.css";
import {ProjectStatus} from "../../Enums/ProjectStatus.ts";
import {ProjectUsers} from "../ProjectUsers/ProjectUsers.tsx";

export const ProjectPage = () => {
    const {projectId} = useParams();
    const {user} = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedTitle, setEditedTitle] = useState("");
    const [editedDescription, setEditedDescription] = useState("");
    const [editedStatus, setEditedStatus] = useState(ProjectStatus.Opened);
    const [editedImage, setEditedImage] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        loadProject();
    }, []);

    const loadProject = async () => {
        try {
            const response = await getProjectByIdAPI(projectId ?? "");
            if (response && response.status === 200) {
                setProject(response.data);
                setEditedTitle(response.data.title);
                setEditedDescription(response.data.description);
                setEditedStatus(response.data.status);
            }
        } catch {
            toast.error("Greška pri učitavanju projekta.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleAddTag = async (tag: Tag) => {
        if (!project) return;

        try {
            const response = await addTagToProjectAPI(project.id, tag.id);
            if (response && response.status === 200) {
                setProject((prev) => prev ? {...prev, tags: [...prev.tags, tag]} : prev);
                toast.success("Tag uspešno dodat!");
            }
        } catch {
            toast.error("Greška pri dodavanju taga.");
        }
    };

    const handleRemoveTag = async (tagId: string) => {
        if (!project) return;

        try {
            const response = await removeTagFromProjectAPI(project.id, tagId);
            if (response && response.status === 200) {
                setProject((prev) => prev ? {...prev, tags: prev.tags.filter((tag) => tag.id !== tagId)} : prev);
                toast.success("Tag uspešno uklonjen!");
            }
        } catch {
            toast.error("Greška pri uklanjanju taga.");
        }
    };

    const handleDeleteProject = async () => {
        if (!project) return;

        try {
            const response = await deleteProjectAPI(projectId!);
            if (response && response.status === 204) {
                toast.success("Projekat uspešno obrisan.");
                navigate('..');
            }
        } catch {
            toast.error("Greška pri brisanju projekta.");
        }
    };

    const handleImageChange = (e:any) => {
        if (e.target.files.length > 0) {
            setEditedImage(e.target.files[0]);
        }
    };

    const handleSaveEdit = async () => {
        try {
            const updatedProjectDto = new FormData();
            updatedProjectDto.append("title", editedTitle);
            updatedProjectDto.append("description", editedDescription);
            updatedProjectDto.append("status", editedStatus);
            if(editedImage)
                updatedProjectDto.append("image", editedImage);

            const response = await updateProjectAPI(projectId!, updatedProjectDto);
            if(response && response.status===200) {
                toast.success("Uspešno ažuriranje projekta.");
                setEditedImage(null);
                setProject(prev => {
                    if(!prev) return null;

                    return {
                        ...prev,
                        title: response.data.title,
                        description: response.data.description,
                        status: response.data.status,
                        image: response.data.image
                    }
                })
            }
        }
        catch {
            toast.error("Greška pri ažuriranju projekta.");
        }
        finally {
            setIsEditing(false);
        }
    };

    return (
        <div className={`container`}>
            {isLoading
                ?
                (<>
                    <p className={`text-center text-muted`}>Učitavanje projekta...</p>
                </>)
                :
                (<>
                    {project ?
                        (<>
                            <div className={`card p-3 shadow my-5`}>
                                <div className={`row g-0`}>
                                    <div className={`col-md-4`}>
                                        <img
                                            src={`${import.meta.env.VITE_SERVER_URL}/${project.image}`}
                                            className={`img-fluid rounded`}
                                            alt={project.title}
                                        />
                                    </div>

                                    <div className={`col-md-8`}>
                                        <div className={`card-body py-0`}>
                                            {isEditing
                                                ?
                                                (<>
                                                    <input
                                                        type="text"
                                                        className="form-control mb-2"
                                                        value={editedTitle}
                                                        onChange={(e) => setEditedTitle(e.target.value)}
                                                    />

                                                    <textarea
                                                        className="form-control mb-2"
                                                        value={editedDescription}
                                                        onChange={(e) => setEditedDescription(e.target.value)}
                                                    />

                                                    <select
                                                        className="form-control mb-2"
                                                        value={editedStatus}
                                                        onChange={(e) => setEditedStatus(e.target.value as ProjectStatus)}
                                                    >
                                                        {Object.values(ProjectStatus).map((status) => (
                                                            <option key={status} value={status}>
                                                                {status}
                                                            </option>
                                                        ))}
                                                    </select>


                                                    <input
                                                        type="file"
                                                        className="form-control mb-2"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                    />

                                                    {editedImage && (
                                                        <img
                                                            src={URL.createObjectURL(editedImage)}
                                                            alt="Nova slika"
                                                            className="img-thumbnail mb-2"
                                                            style={{maxWidth: "200px"}}
                                                        />
                                                    )}

                                                    <div className="d-flex justify-content-start mt-3">
                                                        <button
                                                            className={`btn text-white text-center rounded py-1 px-2 mx-1 ${styles.dugme2}`}
                                                            onClick={handleSaveEdit}
                                                        >
                                                            Sačuvaj
                                                        </button>
                                                        <button
                                                            className={`btn text-white text-center rounded py-1 px-2 mx-1 ${styles.dugme1}`}
                                                            onClick={() => setIsEditing(false)}
                                                        >
                                                            Otkaži
                                                        </button>
                                                    </div>
                                                </>)
                                                :
                                                (<>
                                                    <h2 className={`text-violet`}>{project.title}</h2>
                                                    <p className={`card-text mb-2`}>{project.description}</p>
                                                    <span className={getStatusBadgeClass(project.status)}>
                                                        {project.status}
                                                    </span>
                                                    {project.createdBy?.id == user?.id &&
                                                        <div className={`d-flex justify-content-start mt-3`}>
                                                            <button
                                                                className={`btn text-white text-center rounded py-1 px-2 ${styles.slova} ${styles.dugme2} ${styles.linija_ispod_dugmeta}`}
                                                                onClick={() => setIsEditing(true)}>Izmeni
                                                            </button>
                                                            <button
                                                                className={`btn text-white text-center rounded py-1 px-2 mx-2 ${styles.slova} ${styles.dugme1} ${styles.linija_ispod_dugmeta}`}
                                                                onClick={handleDeleteProject}>Obriši
                                                            </button>
                                                        </div>}
                                                </>)}
                                            <hr/>
                                            <p className={`my-0 text-green`}>Autor: {project.createdBy?.username}</p>
                                            <p className={`text-dark-green`}>
                                                Kreirano: {new Date(project.createdAt).toLocaleDateString('sr')} <br/>
                                                Ažurirano: {new Date(project.updatedAt).toLocaleDateString('sr')}
                                            </p>
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
            <ProjectUsers projectId={projectId ?? ""} />
        </div>
    );
};
import {useParams} from "react-router-dom";
import {Project} from "../../Interfaces/Project/Project.ts";
import {useEffect, useState} from "react";
import {
    acceptInvitationToProjectAPI,
    applyForProjectAPI, cancelInvitationToProjectAPI,
    cancelProjectApplicationAPI,
    deleteProjectAPI,
    getProjectByIdAPI,
    getUserProjectRelationshipAPI, removeUserFromProjectAPI,
    updateProjectAPI
} from "../../Services/ProjectService.tsx";
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
import {UserProjectRelationship} from "../../Enums/UserProjectRelationship.ts";

export const ProjectPage = () => {
    const {projectId} = useParams();
    const {user} = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [userProjectRelationship, setUserProjectRelationship] = useState<UserProjectRelationship|null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedTitle, setEditedTitle] = useState("");
    const [editedDescription, setEditedDescription] = useState("");
    const [editedStatus, setEditedStatus] = useState(ProjectStatus.Opened);
    const [editedImage, setEditedImage] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
            loadProject();

    }, [projectId]);

    const loadProject = async () => {
        try {
            const projectResponse = await getProjectByIdAPI(projectId ?? "");
            if (projectResponse && projectResponse.status === 200) {
                setProject(projectResponse.data);
                setEditedTitle(projectResponse.data.title);
                setEditedDescription(projectResponse.data.description);
                setEditedStatus(projectResponse.data.status);
            }
            const relationshipResponse = await getUserProjectRelationshipAPI(projectId ?? "");
            if (relationshipResponse && relationshipResponse.status === 200) {
                setUserProjectRelationship(relationshipResponse.data as UserProjectRelationship);
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

    const handleApplyForProject = async () => {
        try {
            const response = await applyForProjectAPI(projectId!, user!.id);
            if (response && response.status === 200 && response.data) {
                toast.success("Uspešna prijava.");
                setUserProjectRelationship(UserProjectRelationship.AppliedTo)
            }
        }
        catch {
            toast.error("Došlo je do greške prilikom prijave.")
        }
    }

    const handleCancelProjectApplication = async () => {
        try {
            const response = await cancelProjectApplicationAPI(projectId!, user!.id);
            if (response && response.status === 200 && response.data) {
                toast.success("Uspešna odjava.");
                setUserProjectRelationship(UserProjectRelationship.NoRelationship);
            }
        }
        catch {
            toast.error("Došlo je do greške prilikom odjave.")
        }
    }

    const handleLeaveProject = async () => {
        try {
            const response = await removeUserFromProjectAPI(projectId!, user!.id);
            if (response && response.status === 200 && response.data) {
                toast.success("Uspešno ste napustili projekat.");
                setUserProjectRelationship(UserProjectRelationship.NoRelationship);
            }
        }
        catch {
            toast.error("Došlo je do greške prilikom napuštanja projekta.")
        }
    }

    const handleAcceptInvitation = async () => {
        try {
            const response = await acceptInvitationToProjectAPI(projectId!, user!.id);
            if (response && response.status === 200 && response.data) {
                toast.success("Uspešno ste prihvatili pozivnicu.");
                setUserProjectRelationship(UserProjectRelationship.AcceptedTo);
            }
        }
        catch {
            toast.error("Došlo je do greške prilikom prihvatanja pozivnice.")
        }
    }

    const handleDeclineInvitation = async () => {
        try {
            const response = await cancelInvitationToProjectAPI(projectId!, user!.id);
            if (response && response.status === 200 && response.data) {
                toast.success("Uspešno ste odbili pozivnicu.");
                setUserProjectRelationship(UserProjectRelationship.NoRelationship);
            }
        }
        catch {
            toast.error("Došlo je do greške prilikom prihvatanja pozivnice.")
        }
    }

    const handleUpdateProject = async () => {
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

    const actionButtons = {
        NO_RELATIONSHIP: <button onClick={handleApplyForProject}>Prijavi se</button>,
        ACCEPTED_TO: <button onClick={handleLeaveProject}>Napusti projekat</button>,
        APPLIED_TO: <button onClick={handleCancelProjectApplication}>Odjavi se</button>,
        INVITED_TO: <>
            <button onClick={handleAcceptInvitation}>Prihvati pozivnicu</button>
            <button onClick={handleDeclineInvitation}>Otkaži pozivnicu</button>
        </>
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
                                        {user?.id !== project?.createdBy!.id &&
                                            project.status === ProjectStatus.Opened &&
                                            userProjectRelationship
                                            && actionButtons[userProjectRelationship]}
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
                                                            onClick={handleUpdateProject}
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
                                                        <TagPicker selectedTags={project.tags} maxNumberOfTags={10} onAddTag={handleAddTag}
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
                    <ProjectUsers projectId={projectId ?? ""} authorId={project?.createdBy!.id ?? ""}/>
                </>)
            }
        </div>
    );
};
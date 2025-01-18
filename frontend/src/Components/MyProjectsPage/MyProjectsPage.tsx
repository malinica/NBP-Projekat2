import { useState, useEffect, ChangeEvent } from "react";
import { Project } from "../../Interfaces/Project/Project";
import ProjectItem from "../ProjectItem/ProjectItem";
import {
    searchProjectsCreatedByUserAPI,
    SearchProjectsCompletedByUserAPI,
    SearchProjectsUserWorkingOnAPI,
    SearchProjectsWhereUserAppliedToAPI, SearchProjectsWhereUserIsInvitedTo,
} from "../../Services/ProjectService";
import { useParams } from "react-router-dom";
import { useAuth } from "../../Context/useAuth";
import { Pagination } from "../Pagination/Pagination.tsx";
import { getUserByIdAPI } from "../../Services/UserService.tsx";

const MyProjectsPage = () => {
    const [searchStatus, setSearchStatus] = useState<string>("Opened");
    const [projectType, setProjectType] = useState<string>("myProjects");
    const [projects, setProjects] = useState<Project[] | null>([]);
    const [totalProjectsCount, setTotalProjectsCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { userId } = useParams<{ userId: string }>();
    const { user } = useAuth();
    const [ownerUsername, setOwnerUsername] = useState<string>("");

    const isCurrentUser = user?.id === userId;

    useEffect(() => {
        fetchOwnerUsername();
        fetchProjects(1, 10);
    }, [projectType, searchStatus, userId]);

    const fetchOwnerUsername = async () => {
        try {
            const user = await getUserByIdAPI(userId!);
            if (user) {
                setOwnerUsername(user.username);
            } else {
                setOwnerUsername("Nepoznat korisnik");
            }
        } catch (error) {
            console.error("Greška prilikom pribavljanja korisnika: ", error);
            setOwnerUsername("Nepoznat korisnik");
        }
    };

    const fetchProjects = async (page: number, pageSize: number) => {
        setIsLoading(true);
        try {
            let response;
            switch (projectType) {
                case "myProjects":
                    response = await searchProjectsCreatedByUserAPI(userId!, searchStatus, page, pageSize);
                    break;
                case "invitations":
                    response = await SearchProjectsWhereUserIsInvitedTo(userId!, page, pageSize);
                    break;
                case "completedProjects":
                    response = await SearchProjectsCompletedByUserAPI(userId!, page, pageSize);
                    break;
                case "workingOn":
                    response = await SearchProjectsUserWorkingOnAPI(userId!, page, pageSize);
                    break;
                case "appliedTo":
                    response = await SearchProjectsWhereUserAppliedToAPI(userId!, page, pageSize);
                    break;
                default:
                    response = null;
            }
            if (response && response.status === 200) {
                setProjects(response.data.data);
                setTotalProjectsCount(response.data.totalLength);
            }
        } catch (error) {
            console.error("Greška prilikom učitavanja projekata. ", error);
            setProjects(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSearchStatus(event.target.value);
    };

    const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setProjectType(event.target.value);
        if (event.target.value !== "myProjects") {
            setSearchStatus("Opened");
        }
    };

    const handlePaginateChange = async (page: number, pageSize: number) => {
        await fetchProjects(page, pageSize);
    }

    return (
        <div className={`container`}>
            <h1 className={`text-center my-4 text-green`}>Projekti korisnika {ownerUsername}</h1>
            <div className={`filter-section mb-4`}>
                <h4 className={`text-dark-green mb-3`}>Vrsta projekta:</h4>
                <select
                    id="type-filter"
                    value={projectType}
                    onChange={handleTypeChange}
                    className={`form-select form-select-lg mb-3`}
                >
                    <option value="myProjects">Kreirani projekti</option>
                    {isCurrentUser && (
                        <>
                            <option value="invitations">Projekti na kojima sam pozvan</option>
                            <option value="completedProjects">Projekti koje sam odradio</option>
                            <option value="workingOn">Projekti na kojima učestvujem</option>
                            <option value="appliedTo">Projekti za koje sam se prijavio</option>
                        </>
                    )}
                </select>
            </div>
            {projectType === "myProjects" && (
                <div className={`filter-section mb-4`}>
                    <h4 className={`text-dark-green mb-3`}>Status projekata:</h4>
                    <select
                        id="status-filter"
                        value={searchStatus}
                        onChange={handleStatusChange}
                        className={`form-select form-select-lg mb-3`}
                    >
                        <option value="Opened">Opened</option>
                        <option value="Closed">Closed</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
            )}
            <div className={``}>
                {isLoading ? (
                    <p className={`text-center text-muted`}>Učitavanje projekata...</p>
                ) : projects && projects.length > 0 ? (
                    projects.map((project) => (
                        <ProjectItem key={project.id} project={project} />
                    ))
                ) : (
                    <p className={`text-muted text-center`}>Nema projekata za prikazivanje.</p>
                )}
                {totalProjectsCount > 0 &&
                    <div className={`my-4`}>
                        <Pagination totalLength={totalProjectsCount} onPaginateChange={handlePaginateChange} />
                    </div>}
            </div>
        </div>
    );
};

export default MyProjectsPage;

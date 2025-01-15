import { useState, useEffect } from "react";
import { Project } from "../../Interfaces/Project/Project";
import ProjectItem from "../ProjectItem/ProjectItem";
import { useAuth } from "../../Context/useAuth";
import {
    searchProjectsCreatedByUserAPI,
    SearchProjectsCompletedByUserAPI,
    SearchProjectsUserWokringOnAPI,
    SearchProjectsWhereUserAppliedToAPI,
} from "../../Services/ProjectService";

const MyProjectsPage = () => {
    const [searchStatus, setSearchStatus] = useState<string>("Opened");
    const [projectType, setProjectType] = useState<string>("myProjects");
    const [projects, setProjects] = useState<Project[] | null>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { user } = useAuth();

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            let response;
            switch (projectType) {
                case "myProjects":
                    response = await searchProjectsCreatedByUserAPI(user!.id, searchStatus);
                    break;
                case "completedProjects":
                    response = await SearchProjectsCompletedByUserAPI(user!.id);
                    break;
                case "workingOn":
                    response = await SearchProjectsUserWokringOnAPI(user!.id);
                    break;
                case "appliedTo":
                    response = await SearchProjectsWhereUserAppliedToAPI(user!.id);
                    break;
                default:
                    response = null;
            }
            setProjects(response?.data || []);
        } catch (error) {
            console.error("Greška prilikom dobijanja projekata. ", error);
            setProjects(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [projectType, searchStatus]);

    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSearchStatus(event.target.value);
    };

    const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setProjectType(event.target.value);
        if (event.target.value !== "myProjects") {
            setSearchStatus("Opened");
        }
    };

    return (
        <div className={`container`}>
            <h1 className={`text-center my-4 text-green`}>Moji Projekti</h1>
            <div className={`filter-section mb-4`}>
                <h4 className={`text-dark-green mb-3`}>Vrsta projekta:</h4>
                <select
                    id="type-filter"
                    value={projectType}
                    onChange={handleTypeChange}
                    className={`form-select form-select-lg mb-3`}
                >
                    <option value="myProjects">Moji projekti</option>
                    <option value="completedProjects">Projekti koje sam odradio</option>
                    <option value="workingOn">Projekti na kojima učestvujem</option>
                    <option value="appliedTo">Projekti za koje sam se prijavio</option>
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
            </div>
        </div>
    );
};

export default MyProjectsPage;

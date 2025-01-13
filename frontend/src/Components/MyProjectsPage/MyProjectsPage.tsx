import { useState, useEffect } from "react";
import { Project } from "../../Interfaces/Project/Project";
import ProjectItem from "../ProjectItem/ProjectItem";
import { useAuth } from "../../Context/useAuth";
import { searchProjectsCreatedByUserAPI } from "../../Services/ProjectService";

const MyProjectsPage = () => {
    const [searchStatus, setSearchStatus] = useState<string>("Opened");
    const [projects, setProjects] = useState<Project[] | null>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { user } = useAuth()

    const fetchProjects = async (status: string) => {
        setIsLoading(true);
        try {
            const response = await searchProjectsCreatedByUserAPI(user!.id, status);
            setProjects(response?.data || []);
        } catch (error) {
            console.error("Greška prilikom dobijanja projekata. ", error);
            setProjects(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects(searchStatus);
    }, [searchStatus]);

    const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSearchStatus(event.target.value);
    };

    return (
        <div className="container">
            <h1 className="text-center my-4">Moji projekti</h1>
            <div className="filter-section mb-4">
                <h4>Status projekata:</h4>
                <select
                    id="status-filter"
                    value={searchStatus}
                    onChange={handleStatusChange}
                    className="form-select form-select-lg mb-3"
                >
                    <option value="Opened">Opened</option>
                    <option value="Closed">Closed</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>
            <div className="project-list">
                {isLoading ? (
                    <p>Učitavanje projekata...</p>
                ) : projects && projects.length > 0 ? (
                    projects.map((project) => (
                        <ProjectItem key={project.id} project={project} />
                    ))
                ) : (
                    <p>Nema projekata za prikazivanje.</p>
                )}
            </div>
        </div>
    );
};

export default MyProjectsPage;

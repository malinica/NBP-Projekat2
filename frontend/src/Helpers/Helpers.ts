import {ProjectStatus} from "../Enums/ProjectStatus.ts";

export const getStatusBadgeClass = (status: ProjectStatus) => {
    switch (status) {
        case ProjectStatus.Opened:
            return "badge bg-success";
        case ProjectStatus.Closed:
            return "badge bg-danger";
        case ProjectStatus.Completed:
            return "badge bg-primary";
        default:
            return "badge bg-secondary";
    }
};
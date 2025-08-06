import { Project } from '../types/project';

const PROJECTS_KEY = 'ql_generator_projects';
const ACTIVE_PROJECT_KEY = 'ql_generator_active_project';

export const getProjects = (): Project[] => {
    const data = localStorage.getItem(PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveProject = (project: Project): void => {
    const projects = getProjects();
    projects.push(project);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

export const getActiveProject = (): Project | null => {
    const data = localStorage.getItem(ACTIVE_PROJECT_KEY);
    return data ? JSON.parse(data) : null;
};

export const setActiveProject = (project: Project): void => {
    localStorage.setItem(ACTIVE_PROJECT_KEY, JSON.stringify(project));
};

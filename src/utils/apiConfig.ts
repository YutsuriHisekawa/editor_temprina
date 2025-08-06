import { Project } from '../types/project';

let currentConfig: {
    baseUrl: string;
    headers: Record<string, string>;
} | null = null;

export const initializeApiConfig = (project: Project) => {
    const urlParts = new URL(project.rootAddress);
    currentConfig = {
        baseUrl: `${project.rootAddress}/laradev`,
        headers: {
            'developer-token': project.developerToken,
            'host': urlParts.host,
            'laradev': project.backendPassword
        }
    };
};

export const getApiConfig = () => {
    if (!currentConfig) {
        throw new Error('API configuration not initialized');
    }
    return currentConfig;
};

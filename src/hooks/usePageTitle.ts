import { useEffect } from 'react';
import { getActiveProject } from '../utils/localStorage';

export const usePageTitle = () => {
    useEffect(() => {
        const project = getActiveProject();
        if (project) {
            document.title = `${project.name} - Developer`;
        } else {
            document.title = 'Developer';
        }
    }, []);
};

import { getApiConfig } from '../utils/apiConfig';

const getConfig = () => getApiConfig();

let fetchPromise: Promise<any> | null = null;

export const fetchLaravelFiles = async () => {
    if (fetchPromise) {
        return fetchPromise;
    }

    const config = getConfig();
    fetchPromise = fetch(`${config.baseUrl}/models`, {
        headers: config.headers
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .finally(() => {
            fetchPromise = null;
        });

    return fetchPromise;
};

export const fetchCoreFile = async (filename: string) => {
    try {
        const config = getConfig();
        const filenameWithoutExt = filename.replace(/\.[^/.]+$/, '');
        const response = await fetch(`${config.baseUrl}/cores/${filenameWithoutExt}`, {
            headers: config.headers
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.text();
    } catch (error) {
        console.error(`Error fetching core file ${filename}:`, error);
        throw error;
    }
};

export const fetchBladeFile = async (filename: string) => {
    try {
        const config = getConfig();
        const filenameWithoutExt = filename.replace('.blade.php', '');
        const response = await fetch(`${config.baseUrl}/blades/${filenameWithoutExt}`, {
            headers: config.headers
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.text();
    } catch (error) {
        console.error(`Error fetching blade file ${filename}:`, error);
        throw error;
    }
};

export const fetchJsFile = async (filename: string) => {
    try {
        const config = getConfig();
        const filenameWithoutExt = filename.replace('.js', '');
        const response = await fetch(`${config.baseUrl}/javascript/${filenameWithoutExt}`, {
            headers: config.headers
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.text();
    } catch (error) {
        console.error(`Error fetching JS file ${filename}:`, error);
        throw error;
    }
};

export const fetchModelAction = async (modelName: string, action: string) => {
    try {
        const config = getConfig();
        let url = '';
        const baseModelName = modelName.replace('.php', '');

        switch (action) {
            case 'migration':
                url = `${config.baseUrl}/migrations/${baseModelName}`;
                break;
            case 'alter':
                url = `${config.baseUrl}/alter/${baseModelName}`;
                break;
            case 'basic':
                url = `${config.baseUrl}/models/${baseModelName}?basic=true`;
                break;
            case 'custom':
                url = `${config.baseUrl}/models/${baseModelName}?custom=true`;
                break;
            default:
                url = `${config.baseUrl}/models/${baseModelName}`;
        }

        const response = await fetch(url, {
            headers: {
                ...config.headers,
                'Accept': 'text/plain'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${action} for ${modelName}`);
        }

        return await response.text();
    } catch (error) {
        console.error(`Error fetching ${action} for ${modelName}:`, error);
        throw error;
    }
};

export const saveFile = async (fileId: string, content: string) => {
    try {
        const config = getConfig();
        let url = '';
        const [type, ...rest] = fileId.split('-');
        const name = rest.join('-'); // Handle filenames that might contain hyphens

        console.log('Saving file:', { type, name, fileId }); // Debug log

        switch (type) {
            case 'core':
                url = `${config.baseUrl}/cores/${name}`;
                break;
            case 'blade':
                url = `${config.baseUrl}/blades/${name}`;
                break;
            case 'js':
                url = `${config.baseUrl}/javascript/${name}`; // Fixed: changed from js to javascript
                break;
            case 'model':
                if (name.includes('-')) {
                    const [modelName, action] = name.split('-');
                    switch (action) {
                        case 'migration':
                            url = `${config.baseUrl}/migrations/${modelName}`;
                            break;
                        case 'alter':
                            url = `${config.baseUrl}/alter/${modelName}`;
                            break;
                        case 'basic':
                            url = `${config.baseUrl}/models/${modelName}?basic=true`;
                            break;
                        case 'custom':
                            url = `${config.baseUrl}/models/${modelName}?custom=true`;
                            break;
                        default:
                            throw new Error(`Invalid model action: ${action}`);
                    }
                } else {
                    url = `${config.baseUrl}/models/${name}`;
                }
                break;
            default:
                throw new Error(`Invalid file type: ${type}`);
        }

        if (!url) throw new Error(`Could not generate URL for file: ${fileId}`);

        console.log('Saving to URL:', url); // Debug log

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                ...config.headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: content
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to save file: ${errorText}`);
        }
    } catch (error) {
        console.error('Error saving file:', { fileId, error });
        throw error;
    }
};

export const createFile = async (filename: string) => {
    try {
        const config = getConfig();
        const response = await fetch(`${config.baseUrl}/migrations`, {
            method: 'POST',
            headers: {
                ...config.headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                modul: filename
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create file');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating file:', error);
        throw error;
    }
};

export const executeMigration = async (modelName: string) => {
    try {
        const config = getConfig();
        const filenameWithoutExt = modelName.replace('.php', '');
        const response = await fetch(`${config.baseUrl}/migrate/${filenameWithoutExt}`, {
            headers: config.headers
        });

        if (!response.ok) {
            throw new Error('Migration failed');
        }
        // No return value needed
        await response.text();
    } catch (error) {
        console.error('Migration error:', error);
        throw error;
    }
};

export const executeMigrationDown = async (modelName: string) => {
    try {
        const config = getConfig();
        const filenameWithoutExt = modelName.replace('.php', '');
        const response = await fetch(`${config.baseUrl}/migrate/${filenameWithoutExt}?down=true`, {
            method: 'GET',
            headers: config.headers
        });

        if (!response.ok) {
            throw new Error('Migration rollback failed');
        }
        // No return value needed
        await response.text();
    } catch (error) {
        console.error('Migration rollback error:', error);
        throw error;
    }
};

export const executeAlterTable = async (modelName: string) => {
    try {
        const config = getConfig();
        const filenameWithoutExt = modelName.replace('.php', '');
        const response = await fetch(`${config.baseUrl}/migrate/${filenameWithoutExt}?alter=true`, {
            headers: config.headers
        });

        if (!response.ok) {
            throw new Error('Alter table failed');
        }
        // No return value needed
        await response.text();
    } catch (error) {
        console.error('Alter table error:', error);
        throw error;
    }
};

export const fetchLast10Rows = async (modelName: string) => {
    try {
        const config = getConfig();
        const response = await fetch(`${config.baseUrl}/queries10rows/${modelName}?json=true`, {
            headers: config.headers
        });

        if (!response.ok) {
            throw new Error('Failed to fetch last 10 rows');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching last 10 rows:', error);
        throw error;
    }
};

export const executeTruncate = async (modelName: string) => {
    try {
        const config = getConfig();
        const filenameWithoutExt = modelName.replace('.php', '');
        const response = await fetch(`${config.baseUrl}/truncate/${filenameWithoutExt}`, {
            headers: config.headers
        });

        if (!response.ok) {
            throw new Error('Failed to truncate table');
        }

        return await response.text();
    } catch (error) {
        console.error('Truncate error:', error);
        throw error;
    }
};

export const connectToBackend = async (baseUrl: string, token: string, password: string) => {
    try {
        const url = `${baseUrl}/laradev/connect`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password,
                token
            })
        });

        if (!response.ok) {
            throw new Error('Connection failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Connection error:', error);
        throw error;
    }
};

export const executeFirstDeploy = async () => {
    const config = getConfig();
    const response = await fetch(`${config.baseUrl}/databases?db_autocreate=true&db_migrate=true&db_fresh=true&db_seed=true`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`First deploy failed: ${response.statusText}`);
    }

    return await response.json();
};

export const generateBasicModel = async () => {
    const config = getConfig();
    const response = await fetch(`${config.baseUrl}/models`, {
        method: 'GET',
        headers: {
            ...config.headers,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to generate model: ${response.statusText}`);
    }

    return await response.json();
};

export const executeBackupProject = async () => {
    const config = getConfig();
    const response = await fetch(`${config.baseUrl}/run-backup`, {
        method: 'GET',
        headers: {
            ...config.headers,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Backup failed: ${response.statusText}`);
    }

    return await response.json();
};

export const executeGenerateMigration = async () => {
    const config = getConfig();
    const response = await fetch(`${config.baseUrl}/laradev/migration`, {
        method: 'GET',
        headers: {
            ...config.headers,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Migration generation failed: ${response.statusText}`);
    }

    return await response.json();
};

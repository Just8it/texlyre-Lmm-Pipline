
import { type SecretEntry, type SecretValue } from '../contexts/SecretsContext';

// Singleton service to allow non-React access to secrets
class SecretsService {
    private static instance: SecretsService;
    private secretsCache: Map<string, SecretValue> = new Map();
    private userPassword: string | null = null;
    private userId: string | null = null;

    private constructor() { }

    public static getInstance(): SecretsService {
        if (!SecretsService.instance) {
            SecretsService.instance = new SecretsService();
        }
        return SecretsService.instance;
    }

    // Called by SecretsProvider to keep the service in sync
    public syncState(
        userId: string | null,
        password: string | null,
        cache: Map<string, SecretValue>
    ) {
        this.userId = userId;
        this.userPassword = password;
        this.secretsCache = cache;
    }

    public getSecret(
        pluginId: string,
        secretKey: string,
        scope: 'global' | 'project' = 'global',
        projectId?: string | null
    ): SecretValue | null {
        // Generate ID logic must match SecretsContext
        // id = scope === 'project' && projectId ? `${pluginId}:${scope}:${projectId}:${secretKey}` : `${pluginId}:${scope}:${secretKey}`;

        // We duplicate the ID generation logic here for simplicity, or we should export it from Context.
        // For safety, let's duplicate it:
        const id = scope === 'project' && projectId
            ? `${pluginId}:${scope}:${projectId}:${secretKey}`
            : `${pluginId}:${scope}:${secretKey}`;

        return this.secretsCache.get(id) || null;
    }
}

export const secretsService = SecretsService.getInstance();

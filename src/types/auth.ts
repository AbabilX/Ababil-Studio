export type TokenSource = 'manual' | 'extracted' | 'imported';

export interface AuthToken {
    id: string;
    name: string;
    value: string;
    source?: TokenSource;
    createdAt: number;
    updatedAt: number;
}

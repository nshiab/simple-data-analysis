export const loaded: string[] = [];
export const calls: { method: string; value: unknown; path?: string }[] = [];
export const bucketObjects = new Map<string, Uint8Array>();

export function buildCorsHeaders(origin: string | null): Record<string, string> {
    return {
        'Access-Control-Allow-Origin': origin ?? '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin',
    };
}

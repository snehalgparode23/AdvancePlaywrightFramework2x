/**
 * AI provider configuration — shared by the RCA and flaky analyzers.
 *
 * The analyzers are optional: they only run when an LLM API key is present.
 * `hasApiKey()` checks the common provider variables so the reporter can skip
 * AI work (and its cost) in local/CI runs without keys.
 */

const PROVIDER_KEYS = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GEMINI_API_KEY',
    'GOOGLE_API_KEY',
    'AZURE_OPENAI_API_KEY',
];

export function hasApiKey(): boolean {
    return PROVIDER_KEYS.some((name) => Boolean(process.env[name]));
}

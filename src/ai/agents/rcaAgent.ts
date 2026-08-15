/**
 * RCA (Root Cause Analysis) agent for failed Playwright tests.
 *
 * Consumed by `CustomReporter.ts`: when a test fails, the reporter asks this
 * agent for a verdict (severity, priority, root cause, fix suggestions) and
 * renders it on the "AI Verdict" tab of the TTA report.
 *
 * The current implementation is a heuristic analyzer that works offline — it
 * inspects the error message/stack for known Playwright failure patterns and
 * produces structured, deterministic verdicts. When an LLM API key is present
 * the module could forward the same inputs to a model; the return type stays
 * the same either way.
 */

export type RcaSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface RcaVerdict {
    severity: RcaSeverity;
    priority: string;
    rootCause: string;
    fixes: string[];
}

export interface FailureInput {
    title: string;
    file: string;
    error: string;
    stack?: string;
}

const PATTERNS: { match: RegExp; severity: RcaSeverity; priority: string; rootCause: string; fixes: string[] }[] = [
    {
        match: /timeout|timed out|waiting for/i,
        severity: 'high',
        priority: 'P1',
        rootCause:
            'A Playwright action (navigation, locator, or expect) exceeded the configured timeout.',
        fixes: [
            'Check whether the page/network is slower than usual in the target environment.',
            'Verify the locator targets a stable selector — prefer data-test attributes.',
            'If the app legitimately takes longer, raise the action/expect timeout for this test.',
            'Confirm no background XHR/socket keeps the page from reaching the expected state.',
        ],
    },
    {
        match: /selector|locator|strict mode|resolved to|element not found|no element|intercepted|not visible|not attached/i,
        severity: 'high',
        priority: 'P1',
        rootCause:
            'The locator did not resolve to exactly one element in the expected state.',
        fixes: [
            'Inspect the screenshot/video: is the element present but hidden, or missing?',
            'Make the locator more specific (scope to a container, use getByRole/getByText).',
            'Resolve strict-mode violations by narrowing the locator to a single element.',
            'Check for dynamic IDs — prefer stable data-test attributes.',
        ],
    },
    {
        match: /navigation|net::|ERR_|failed to|refused|dns|tls|404|500/i,
        severity: 'critical',
        priority: 'P0',
        rootCause: 'Navigation or network failure while loading a page or resource.',
        fixes: [
            'Verify the target environment is up and the base URL is reachable.',
            'Check for proxy/VPN interference or blocked requests in the test environment.',
            'Confirm the URL is correct and not wrapped in extra characters (e.g. markdown).',
            'Re-run in isolation to rule out transient network issues.',
        ],
    },
    {
        match: /expect|to be|to equal|to contain|assert/i,
        severity: 'medium',
        priority: 'P2',
        rootCause: 'An assertion failed — the actual application state differs from the expected state.',
        fixes: [
            'Compare the expected vs actual values in the error message.',
            'Check whether recent application changes affected the asserted behavior.',
            'Update the assertion or the test data if the expected value changed.',
        ],
    },
];

export async function analyzeFailure(input: FailureInput): Promise<RcaVerdict> {
    const haystack = `${input.error}\n${input.stack ?? ''}`;

    for (const p of PATTERNS) {
        if (p.match.test(haystack)) {
            return {
                severity: p.severity,
                priority: p.priority,
                rootCause: p.rootCause,
                fixes: p.fixes,
            };
        }
    }

    return {
        severity: 'low',
        priority: 'P3',
        rootCause: 'Unrecognized failure — no known pattern matched the error output.',
        fixes: [
            'Review the full error message and stack trace in the report.',
            'Capture a screenshot/trace on failure to inspect the app state.',
            'Reproduce locally to identify the underlying cause.',
        ],
    };
}

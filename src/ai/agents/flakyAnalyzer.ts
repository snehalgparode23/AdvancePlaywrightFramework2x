/**
 * Flaky test analyzer for the TTA reporter.
 *
 * Compares this build's per-test statuses with the previous build's snapshot
 * and reports which tests changed status (flaky), which are consistently
 * failing, and optionally an LLM-generated summary when an API key is set.
 */

export interface BuildSummary {
    runId: string;
    /** Map of full test title -> status ('passed' | 'failed' | 'skipped' | 'timedOut'). */
    tests: Record<string, string>;
}

export interface FlakyResult {
    flaky: string[];
    failing: string[];
    counts: { flaky: number; failing: number; total: number };
    summary?: string;
}

/**
 * Diff two build summaries.
 *
 * A test is "flaky" when its status differs between the two builds and it is
 * not failing in both. A test is "failing" when it failed/timed out in the
 * latest build. `hasApiKey` currently gates a future LLM summary call.
 */
export async function analyzeFlaky(
    prev: BuildSummary,
    curr: BuildSummary,
    _hasApiKey: boolean,
): Promise<FlakyResult> {
    const allTests = new Set<string>([...Object.keys(prev.tests), ...Object.keys(curr.tests)]);

    const flaky: string[] = [];
    const failing: string[] = [];

    for (const title of allTests) {
        const prevStatus = prev.tests[title];
        const currStatus = curr.tests[title];

        const currFailed = currStatus === 'failed' || currStatus === 'timedOut';
        if (currFailed) {
            failing.push(title);
        }

        if (prevStatus !== undefined && currStatus !== undefined && prevStatus !== currStatus) {
            flaky.push(title);
        }
    }

    const summary = _hasApiKey
        ? `AI summary disabled — wire an LLM call here to summarize the ${flaky.length} flaky and ${failing.length} failing test(s).`
        : undefined;

    return {
        flaky,
        failing,
        counts: { flaky: flaky.length, failing: failing.length, total: allTests.size },
        summary,
    };
}

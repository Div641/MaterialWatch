export const processInBatches = async (
    items,
    batchSize,
    asyncProcessor,
    delayMs=1500
) => {
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        const batchResults = await Promise.all(
            batch.map(asyncProcessor)
        );

        results.push(...batchResults);

        // Throttle delay between batches to respect API rate limits
        if (i + batchSize < items.length && delayMs > 0) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }

    return results;
};
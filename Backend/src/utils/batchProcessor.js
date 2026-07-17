export const processInBatches = async (
    items,
    batchSize,
    asyncProcessor
) => {
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        const batchResults = await Promise.all(
            batch.map(asyncProcessor)
        );

        results.push(...batchResults);
    }

    return results;
};
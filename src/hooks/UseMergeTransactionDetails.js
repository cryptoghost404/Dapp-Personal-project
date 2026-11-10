export function UseMergeTransactionDetails(history, details) {
  // Find Alchemy details using the transaction hash
  const detailsMap = new Map(
    details.map(tx => [tx.hash.toLowerCase(), tx])
  );

  // Attach Alchemy details to each Tatum activity
  return history.map(activity => ({
    ...activity,
    alchemyDetails:
      detailsMap.get(activity.hash.toLowerCase()) || null,
  }));
}
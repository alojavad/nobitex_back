function normalizeQuotes(quoteData) {
  const normalized = {};
  for (const [currency, values] of Object.entries(quoteData)) {
    normalized[currency] = {
      ...values,
      last_updated: values.last_updated ? new Date(values.last_updated) : null,
    };
  }
  return normalized;
}

module.exports = { normalizeQuotes };
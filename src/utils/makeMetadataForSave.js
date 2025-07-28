export const filterMetadata = (metadata, keysToKeep) => {
  const filtered = {}
  for (const key in metadata) {
    if (keysToKeep.includes(key)) {
      filtered[key] = metadata[key]
    }
  }
  return filtered
}

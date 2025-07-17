import { validKeys } from "../config"

export const makeMetadataForSave = metadata => {
  const filteredMetadata = {}
  for (const key in metadata) {
    if (validKeys.includes(key)) {
      filteredMetadata[key] = metadata[key]
    }
  }
  return filteredMetadata
}

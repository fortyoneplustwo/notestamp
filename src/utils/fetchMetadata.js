import { defaultMediaConfig } from "@/config"

export const fetchMetadata = (type, id) => {
  const metadata = defaultMediaConfig.find(m => m.type === type)
  if (!metadata) throw Error("No configuration found for provided media type")

  if (!id) {
    return {
      title: "",
      ...metadata,
    }
  }
}

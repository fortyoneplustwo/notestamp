import { defaultMediaConfig } from "@/config"

export const getProjectConfig = type => {
  const metadata = defaultMediaConfig.find(m => m.type === type)
  if (!metadata) throw Error("No configuration found for provided media type")

  return {
    title: "",
    ...metadata,
  }
}

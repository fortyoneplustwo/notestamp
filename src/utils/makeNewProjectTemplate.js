import { configs } from "virtual:media/config"

export const makeNewProjectTemplate = moduleId => {
  const metadata = configs[moduleId]
  if (!metadata) throw Error("No configuration found for provided media type")

  return {
    title: "",
    type: moduleId,
    ...metadata,
  }
}

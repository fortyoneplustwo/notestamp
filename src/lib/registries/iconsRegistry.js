const modules = import.meta.glob(
  `@/components/MediaRenderer/media/*/icon.jsx`,
  { import: "default", eager: true }
)

const iconsResolveData = Object.entries(modules).map(([key, val]) => {
  const splitPath = key.split("/")
  const moduleId = splitPath[splitPath.length - 2]
  return [moduleId, val]
})

const registry = new Map(iconsResolveData)

export default registry

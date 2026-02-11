const mediaModulesRegistry = import.meta.glob(`./media/*/index.jsx`, {
  import: "default",
})

export default mediaModulesRegistry


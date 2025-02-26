/** Custom response object that mimics
 * the one received from javascript's fetch()
 */
class FsFetchResponse {
  constructor(data = undefined, ok = false) {
    this.data = data
    this.ok = ok
  }

  async json() {
    try {
      return JSON.parse(this.data)
    } catch (e) {
      throw new Error("Invalid JSON format")
    }
  }

  async blob() {
    try {
      if (this.data instanceof Blob) {
        return this.data
      } else {
        throw new Error()
      }
    } catch (e) {
      throw new Error("Invalid blob")
    }
  }
}

/** A project is valid if:
 * it is a directory,
 * the directory contains a json file called "metadata",
 * the metadata's keys are all valid keys,
 */
const isValidProject = async (dir) => {
  if (dir.kind !== "directory") {
    return false
  }
  try {
    for await (const file of dir.values()) {
      if (file.name === "metadata" && file.kind === "file") {
        const metadataFile = await file.getFile()
        const metadataString = await metadataFile.text()
        const metadata = JSON.parse(metadataString)
        const validKeys = ["title", "label", "type", "mimetype", "src", "lastModified"]
        for (const key in metadata) {
          if (!validKeys.includes(key)) {
            return false
          }
        }
        metadata.lastModified = new Date(metadataFile.lastModified)
        return metadata // Metadata file found and is valid
      }
    }
    return false // No metadata file found
  } catch (e) {
    console.error(`Invalid project: ${e}`)
    return false
  }
}

/**
 * Writes file inside of the directory that dirHandle points to 
 */
const writeFile = async (file, dirHandle) => {
  const fileHandle = await dirHandle.getFileHandle(file.name, { create: true })
  const writableStream = await fileHandle.createWritable()
  await writableStream.write(file)
  await writableStream.close()
}

export const fsFetch = async (endpoint, params=null) => {
  console.log("fsFetch: ", endpoint, params)
  try {
    switch (endpoint) {
      case "listProjects":
        const validProjects = []
        const promises = []
        for await (const entry of params?.cwd?.values()) {
          promises.push(isValidProject(entry).then(metadata =>
            metadata && validProjects.push(metadata)
          ))
        }
        await Promise.all(promises) // Check for validity in parallel
        const data = JSON.stringify({ projects: validProjects })
        return new FsFetchResponse(data, true)

      case "getProjectMetadata":
        for await (const entry of params?.cwd?.values()) {
          if (entry.name === params?.projectId) {
            const metadata = await isValidProject(entry)
            if (metadata) {
              return new FsFetchResponse(JSON.stringify(metadata), true)
            } else {
              return new FsFetchResponse() // Metadata invalid
            }
          }
        }
        return new FsFetchResponse() // Project not found

      case "getProjectMedia":
        for await (const entry of params?.cwd?.values()) {
          if (entry.name === params?.projectId) {
            const metadata = await isValidProject(entry)
            if (metadata) {
              const mediaFileHandle = await entry.getFileHandle(
                `${metadata.title}.${metadata.mimetype.split("/")[1]}`
              )
              const mediaFile = await mediaFileHandle.getFile()
              return new FsFetchResponse(mediaFile, true)
            } else {
              return new FsFetchResponse() // Metadata invalid
            }
          }
        }
        return new FsFetchResponse() // Project not found
        
      case "getProjectNotes":
        for await (const entry of params?.cwd?.values()) {
          if (entry.name === params?.projectId) {
            const metadata = await isValidProject(entry)
            if (metadata) {
              const notesFileHandle = await entry.getFileHandle(
                `${metadata.title}.stmp`
              )
              const notesFile = await notesFileHandle.getFile()
              return new FsFetchResponse(notesFile, true)
            } else {
              return new FsFetchResponse() // Metadata invalid
            }
          }
        }
        return new FsFetchResponse() // Project not found

      case "saveProject":
        const metadataFile = params?.metadata &&
          new File(
            [JSON.stringify(params.metadata)],
            "metadata",
            { type: "application/json" },
          )
        const notesFile = params?.notes &&
          new File(
            [JSON.stringify(params.notes)],
            `${params.metadata.title}.stmp`,
            { type: "application/json" },
          )
        const mediaFile = params?.media &&
          new File(
            [params.media],
            `${params.metadata.title}.${params.metadata.mimetype.split("/")[1]}`,
            { type: params.metadata.mimetype },
          )

        const newProjectDirHandle = await params?.cwd?.getDirectoryHandle(
          params?.metadata.title,
          { create: true }
        )
        const filesToSave = [metadataFile, notesFile] // These files must always be saved
        mediaFile && filesToSave.push(mediaFile) // Media is optional depending on metadata.type
        const writePromises = filesToSave?.map((file) => writeFile(file, newProjectDirHandle))
        await Promise.all(writePromises)
        return new FsFetchResponse(JSON.stringify({ msg: "save success" }), true)

      case "deleteProject":
        for await (const entry of params?.cwd?.values()) {
          if (entry.name === params?.projectId) {
            const metadata = await isValidProject(entry)
            if (metadata) {
              await params?.cwd?.removeEntry(params?.projectId, { recursive: true }) 
              return new FsFetchResponse(JSON.stringify({ msg: "deleted" }), true)
            } else {
              return new FsFetchResponse() // Metadata invalid
            }
          }
        }
        return new FsFetchResponse() // Project not found

      default:
        throw new Error("Invalid endpoint")
      }
  } catch (error) {
    console.error(`Failed to fetch from file system ${endpoint}, ${params}:\n${error}`)
  }
}


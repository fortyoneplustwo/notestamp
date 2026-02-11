import { toMarkdown } from "@/components/Editor/utils/toMarkdown"

/**
 * A project is valid if:
 * it is a directory,
 * the directory contains a json file called "metadata",
 * the metadata's keys are all valid keys,
 */
const isValidProject = async dir => {
  if (dir.kind !== "directory") {
    return false
  }
  try {
    for await (const file of dir.values()) {
      if (file.name === ".metadata.json" && file.kind === "file") {
        const metadataFile = await file.getFile()
        const metadataString = await metadataFile.text()
        const metadata = JSON.parse(metadataString)
        const validKeys = [
          "title",
          "label",
          "type",
          "mimetype",
          "src",
          "lastModified",
        ]
        for (const key in metadata) {
          if (!validKeys.includes(key)) {
            return false
          }
        }
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

/**
 * Response options
 */
const status200 = {
  headers: {
    "Content-Type": "application/json",
  },
}

const status500 = {
  status: 500,
  statusText: "Internal Server Error",
}

const status404 = {
  status: 404,
  statusText: "Not found",
}

export const localFetch = async (endpoint, params = null) => {
  console.log("fsFetch: ", endpoint, params)
  try {
    switch (endpoint) {
      case "listProjects": {
        const validProjects = []
        const promises = []
        for await (const entry of params?.cwd?.values() || []) {
          promises.push(
            isValidProject(entry).then(
              metadata => metadata && validProjects.push(metadata)
            )
          )
        }
        await Promise.all(promises) // Check for validity in parallel

        const sortByLastModified = params?.sorting?.find(
          sorting => sorting.id === "lastModified"
        )
        const sortedProjects = validProjects.sort((a, b) =>
          (sortByLastModified ? sortByLastModified.desc : true)
            ? new Date(b.lastModified) - new Date(a.lastModified)
            : new Date(a.lastModified) - new Date(b.lastModified)
        )

        let filteredProjects = sortedProjects.filter(project =>
          params?.searchParam
            ? project.title.includes(params.searchParam)
            : true
        )

        if (params?.columnFilters && params.columnFilters.length > 0) {
          const filterByType = params.columnFilters.find(
            filter => filter.id === "type"
          )
          if (filterByType) {
            filteredProjects = filteredProjects.filter(project =>
              filterByType.value ? project.type === filterByType.value : true
            )
          }
        }

        const chunkSize = 20
        const chunk = filteredProjects.slice(
          params?.pageParam,
          params?.pageParam + chunkSize
        )

        const data = JSON.stringify({
          projects: chunk,
          nextOffset:
            params?.pageParam + chunkSize < filteredProjects.length
              ? params?.pageParam + chunkSize
              : null,
        })
        return new Response(data, status200)
      }

      case "getProjectMetadata":
        for await (const entry of params?.cwd?.values() || []) {
          if (entry.name === params?.projectId) {
            const metadata = await isValidProject(entry)
            if (metadata) {
              return new Response(JSON.stringify(metadata), status200)
            } else {
              return new Response(null, status500)
            }
          }
        }
        return new Response(null, status404)

      case "getDuplicate":
        for await (const entry of params?.cwd?.values() || []) {
          if (entry.name === params?.projectId) {
            return new Response(
              JSON.stringify({ isDuplicate: true }),
              status200
            )
          }
        }
        return new Response(JSON.stringify({ isDuplicate: false }), status200)

      case "getProjectMedia":
        for await (const entry of params?.cwd?.values() || []) {
          if (entry.name === params?.projectId) {
            const metadata = await isValidProject(entry)
            if (metadata) {
              const mediaFileHandle = await entry.getFileHandle(
                `${metadata.title}.${metadata.mimetype.split("/")[1]}`
              )

              const mediaFile = await mediaFileHandle.getFile()
              return new Response(mediaFile, {
                ...status200,
                headers: { "Content-Type": metadata.mimetype },
              })
            } else {
              return new Response(null, status500)
            }
          }
        }
        return new Response(null, status404)

      case "getProjectNotes":
        for await (const entry of params?.cwd?.values() || []) {
          if (entry.name === params?.projectId) {
            const metadata = await isValidProject(entry)
            if (metadata) {
              const notesFileHandle = await entry.getFileHandle(
                `.${metadata.title}.json`
              )
              const notesFile = await notesFileHandle.getFile()
              return new Response(notesFile, status200)
            } else {
              return new Response(null, status500)
            }
          }
        }
        return new Response(null, status404)

      case "saveProject": {
        const metadataFile =
          params?.metadata &&
          new File([JSON.stringify(params.metadata)], ".metadata.json", {
            type: "application/json",
          })
        const notesFile =
          params?.notes &&
          new File(
            [JSON.stringify(params.notes)],
            `.${params.metadata.title}.json`,
            { type: "application/json" }
          )
        let mdFile
        if (params?.notes) {
          try {
            mdFile = new File(
              [toMarkdown(params.notes)],
              `${params.metadata.title}.md`,
              { type: "text/markdown" }
            )
          } catch (error) {
            console.error(error)
            mdFile = new File(
              ["Oops! There was an error converting your notes to Markdown."],
              `${params.metadata.title}`,
              { type: "text/markdown" }
            )
          }
        }
        const mediaFile =
          params?.media &&
          new File(
            [params.media],
            `${params.metadata.title}.${params.metadata.mimetype.split("/")[1]}`,
            { type: params.metadata.mimetype }
          )

        const newProjectDirHandle = await params?.cwd?.getDirectoryHandle(
          params?.metadata.title,
          { create: true }
        )
        const filesToSave = [metadataFile, notesFile, mdFile] // These files must always be saved
        mediaFile && filesToSave.push(mediaFile) // Media is optional depending on metadata.type
        const writePromises = filesToSave?.map(file =>
          writeFile(file, newProjectDirHandle)
        )
        await Promise.all(writePromises)
        return new Response(JSON.stringify({ msg: "save success" }), status200)
      }

      case "deleteProject":
        for await (const entry of params?.cwd?.values() || []) {
          if (entry.name === params?.projectId) {
            const metadata = await isValidProject(entry)
            if (metadata) {
              await params?.cwd?.removeEntry(params?.projectId, {
                recursive: true,
              })
              return new Response(JSON.stringify({ msg: "deleted" }), status200)
            } else {
              return new Response(null, status500)
            }
          }
        }
        return new Response(null, status404)

      default:
        throw new Error("Invalid endpoint")
    }
  } catch (error) {
    console.error(
      `Failed to fetch from file system ${endpoint}, ${params}:\n${error}`
    )
  }
}

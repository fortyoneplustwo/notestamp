export const backendFetch = async (endpoint, params=null) => {
  const domain ="http://localhost:8000"

  try {
    switch (endpoint) {
      case "getUserData":
        return await fetch(domain + "/auth/user", {
          method: "GET",
          credentials: "include",
          headers: {
            "Accept": "application/json"
          }
        })

      case "getProjectMetadata":
        return await fetch(domain + 
          "/project/get/" +
          encodeURIComponent(params?.projectId ?? ""), {
            method: "GET",
            credentials: "include",
            headers: {
              "Accept": "application/json"
            }
          })

      case "listProjects":
        return await fetch(domain + "/project/list", {
          credentials: "include",
        })

      case "saveProject":
        const metadataEncoded = JSON.stringify(params.metadata)
        const notesFile = params?.notes &&
          new File(
            [JSON.stringify(params.notes)],
            "notesFile.json",
            { type: "application/json" },
          )
        const mediaFile = params?.media &&
          new File(
            [params.media],
            "mediaFile",
            { type: params.metadata.mimeType },
          )

        const formData = new FormData()
        formData.append('mediaFile', mediaFile)
        formData.append('notesFile', notesFile)
        formData.append('metadata', metadataEncoded)

        return await fetch(`${domain}/project/save`, {
            method: "POST",
            credentials: "include",
            body: formData
          })

      case "deleteProject":
        return await fetch(domain +
          "/project/delete/" +
          encodeURIComponent(params?.projectId ?? ""), {
            method: "DELETE",
            credentials: "include",
          })

      case "register":
        const registerFormData = new FormData()
        registerFormData.append("username", params?.username)
        registerFormData.append("password", params?.password)

        return await fetch(domain + "/auth/register", {
            method: "POST",
            body: registerFormData,
          }) 

      case "login":
        const loginFormData = new FormData()
        loginFormData.append("username", params?.username)
        loginFormData.append("password", params?.password)

        return await fetch(domain + "/auth/login", {
            method: "POST",
            credentials: "include",
            body: loginFormData,
          })

      case "logout":
        return await fetch(domain + "/auth/logout", {
            method: "POST",
            credentials: "include",
          })

      default:
        throw new Error("Invalid endpoint")
    }
  } catch (error) {
    console.error(`Failed to fetch from server:\n${error}`)
  }
}

export const apiFetch = async (endpoint, params?) => {
  const domain ="http://localhost:8080"

  try {
    switch (endpoint) {
      case "getUserData":
        return await fetch(domain + "/user/get", {
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

      case "getProjects":
        return await fetch(domain +
          "/project/list/"
        )

      case "saveProject":
        const formData = new FormData()
        formData.append('mediaFile', params?.media)
        formData.append('notesFile', params?.notes)
        formData.append('metadata', params?.metadata)

        return await fetch(`${domain}/project/save`, {
            method: "POST",
            credentials: "include",
            body: formData
          })

      case "deleteProject":
        return await fetch(domain +
          "/project/delete" +
          encodeURIComponent(params?.projectId ?? ""), {
            method: "GET",
            credentials: "include",
          })

      case "register":
        return await fetch(domain + "/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: params?.email,
              password: params?.passsword
            })
          }) 

      case "login":
        return await fetch(domain + "auth/login", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: params?.email,
              password: params?.password
            })
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
    console.error(`Failed to fetch from from backend: ${error}`)
  }
}

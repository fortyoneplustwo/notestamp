const api = 'http://localhost:8080' 


export const getProjectData = async title => {
  if (!title) return null

  const queryParams = {
    name: title
  }
  const url = new URL(api + '/home/open')
  url.search = new URLSearchParams(queryParams)

  const options = {
    method: "GET",
    credentials: "include",
  };
  
  try {
    const response = await fetch(url, options)    
    if (response.ok) {
      const { metadata, content } = await response.json()
      return { metadata: metadata, content: content }
    }
    else {
      // Handle HTTP errors
      return (null)
    }
  } catch(error) {
    console.error(error)
    return null
  }
}

export const deleteProject = async title => {
  if (!title) return null

  const queryParams = {
    name: title
  }
  const url = new URL(api + '/home/delete')
  url.search = new URLSearchParams(queryParams)

  const options = {
    method: "DELETE",
    credentials: "include",
  };

  try {
    const response = await fetch(url, options)    
    if (response.ok) {
      const newDir = await response.json()
      console.log('updated dir', newDir)
      return newDir
    }
    else {
      // hanlde errors (might have to login again)
      return null
    }
  } catch(error) {
    console.error(error)
    return null
  }
}


export const loginWithCredentials = async (username, password) => {
  if (!username || !password) return null

  const payload = {
    username: username,
    password: password
  }
  const options = {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  };

  try {
    const response = await fetch(api + "/auth/signin", options)  
    if (response.ok) {
      const user = await response.json()
      return  user ? user : null
    }
    else {
      if (response.status === 401) return null
      else if (response.status === 400) return null
    }
  } catch(error) {
    console.error(error)
    return null
  }
}

export const registerWithCredentials = async (username, password) => {
  if (!username || !password) return null

  const credentials = {
    username: username,
    password: password
  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(credentials)
  };

  try {
    const response = await fetch(api + "/auth/register", options)  
    if (response.ok) {
      return 1 // return arbitrary non-null data
    }
    else {
      if (response.status === 400) return null
      else if (response.status === 409) return null
    }
  } catch(error) {
    console.error(error)
    return null
  }
}

export const logOut = async () => {
  const options = {
    method: "DELETE",
    credentials: "include",
  };
  try {
    const response = await fetch(api + '/auth/signout', options)    
    if (response.ok) {
      return 1
    }
    else {
      // hanlde errors (might have to login again)
      return (null)
    }
  } catch(error) {
    console.error(error)
    return null
  }
}

export const saveProject = async (metadata, content) => {
  if (!metadata || !content) return null

  const payload = {
    metadata: metadata,
    content: content
  }
  const options = {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  };

  try {
    const response = await fetch(api + "/home/upload", options)  
    if (response.ok) {
      const dir = await response.json()
      console.log('updated dir', dir)
      return dir
    }
    else {
      if (response.status === 401) return null
      else if (response.status === 400) return null
    }
  } catch(error) {
    console.error(error)
    return null
  }
}


import './App.css'
import TextEditor from './components/TextEditor.js'
import React, { useState, useRef, useEffect } from 'react'
import { EventEmitter } from './components/EventEmitter.js'
import './Button.css'
import WelcomeMessage from './components/WelcomeMessage'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import * as api from './api'
import Modal from './components/Modal'
import MediaRenderer from './components/MediaRenderer'
import Nav from './components/Nav'
import MediaTitleBar from './components/MediaTitleBar'
import { myMediaComponents } from './components/NonCoreMediaComponents'
import { Icon } from './components/Toolbar'

const App = () => {

  //////////////////////////
  ///  State variables  ////
  //////////////////////////

  const mediaControllerRef = useRef(null)
  const textEditorRef = useRef(null)
  const attachMediaController = controller => mediaControllerRef.current = controller

  // User session data. Updated only after a successful login
  const [user, setUser] = useState(null)
  const [projectSnapshot, setProjectSnapshot] = useState(null)
  const [requestedProject, setRequestedProject] = useState(null)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [showLoginButton, setShowLoginButton] = useState(true)
  const [showLogoutButton, setShowLogoutButton] = useState(false)
  const saveModalRef = useRef(null)
  const unsavedChangesModalRef = useRef(null)

  // Non-user-specific variables
  const [showMedia, setShowMedia] = useState(null)
  const [mediaRendererProps, setMediaRendererProps] = useState(null)
  const [editorContent, setEditorContent] = useState('')
  const [mediaComponents, setMediaComponents] = useState([
    { label: 'YouTube Player', type: 'youtube', path: './YoutubePlayer.js' },
    { label: 'Audio Player', type: 'audio', path: './AudioPlayer.js' },
    { label: 'Sound Recorder', type: 'recorder', path: './AudioRecorder.js' },
    { label: 'PDF Reader', type: 'pdf', path: './PdfReader.js' }
  ])

  ////////////////////////////////
  ///  Initialization  ///////////
  ////////////////////////////////

  // Import non-core components
  useEffect(() => {
    setMediaComponents([...mediaComponents, ...myMediaComponents])
  }, [])

  /////////////////////////////////
  ///  METHODS  (user session) ////
  /////////////////////////////////

  const handleLoggedIn = user => {
    setUser({
      email: user.email,
      directory: user.directory
    })
    setShowLoginForm(false)
    setShowLogoutButton(true)
  }

  const handleOpenProject = async title => {
    try {
      const result = await api.getProjectData(title)
      if (result === null) {
        throw new Error('Error fetching project')
      } else {
        const { metadata, content } = result
        setRequestedProject({ 
          metadata: {...metadata},
          content: content,
        })
        setShowMedia(() => {
          setMediaRendererProps({ ...metadata })
          return true 
        })
        textEditorRef.current.setContent(content)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleStageChanges = () => {
    const metadata = mediaControllerRef.current ? mediaControllerRef.current.getMetadata() : null
    if (!metadata) return
    setProjectSnapshot({ metadata: { ...metadata }, content: editorContent })
  }

  const handleSaveProject = filename => {
    if (!filename) return
    saveModalRef.current.close()
    api.saveProject({ 
      ...projectSnapshot.metadata,
      title: filename
    }, editorContent)
      .then(dir => {
        if (dir) setUser({
          ...user,
          directory: dir
        })
      })
    setRequestedProject({ 
      metadata: {...projectSnapshot.metadata}, 
      content: projectSnapshot.content 
    })
  }

  const handleDeleteProject = title => {
    api.deleteProject(title)
      .then(newDir => {
        if (newDir) {
          setUser({
            ...user,
            directory: newDir
          })
        }
      })
  }

  const handleLogOut = () => {
    api.logOut()
      .then(result => {
        if (result) {
          // reset user session data
          setShowLoginButton(true)
          setShowLogoutButton(false)
          setUser(null)
          setRequestedProject({
            metadata: { title: '', type: '', src: '' },
            content: ''
          })
          setProjectSnapshot(null)
          handleBackToHomepage()
        }
      })
  }

  ////////////////////////////////////
  ///  METHODS (no login required) ///
  ////////////////////////////////////

  const handleCancelLogin = () => {
    setShowLoginForm(false)  
    setShowLoginButton(true)
  }

  const handleLoginBtnClicked = () => {
    setShowLoginForm(true)
    setShowLoginButton(false)
  }

  const handleEditorContentChange = content => {
    setEditorContent(content)
  }

  const handleBackToHomepage = () => {
    setShowMedia((_) => {
      if (user && requestedProject) {
        const currMetadata = mediaControllerRef.current 
          ? mediaControllerRef.current.getMetadata() 
          : null 
        const currContent = editorContent

        let projectModified = false
        if (currMetadata) {
          if (requestedProject['content'] !== currContent) projectModified = true
          for (const key in requestedProject.metadata) {
            if (requestedProject.metadata[key] !== currMetadata[key]) projectModified = true
          }
        }

        if (projectModified) {
          unsavedChangesModalRef.current.showModal()
          return true
        }
      }
      return false
    }) 
  }

  const handleCreateNewProject = (label, type) => {
    setShowMedia(() => {
      setRequestedProject(null)
      setMediaRendererProps({ label: label, type: type, src: '' })
      return true
    })
  }

  // Called when a stamp in inserted. Return value must be an object.
  // {
  //    label: String or null       String rendered inside of the stamp
  //    value: Any or Null          Actual stamp value
  // }
  const getStampDataFromMedia = dateStampRequested => { 
    if (mediaControllerRef.current) {
      const stampData = mediaControllerRef.current.getState(dateStampRequested)
      return stampData ? stampData : { label: null, value: null }
    } else {
      return { label: null, value: null }
    }
  }
  
  ////////////////////////
  ///  EVENT LISTENERS ///
  ////////////////////////

  // Dispatched from a media component (usually one that captures media e.g. sound recorder)
  // to open the captured media in a different media component (e.g. audio player)
  EventEmitter.subscribe('open-media-with-src', data => { 
    setMediaRendererProps({
      label: 'Audio Player',
      type: data.type,
      src: data.src
    })
    setShowMedia(true)
  })

  EventEmitter.subscribe('stamp-clicked', data => {
    const stampValue = data[1]
    if (mediaControllerRef.current) mediaControllerRef.current.setState(stampValue)
  })

  ////////////////
  ///  JSX  //////
  ////////////////

  return (
    <div className='app-container'>
      <header>
          <span className='logo'>notestamp</span>
          <span className='nav-bar'>
            { showMedia
              ? <MediaTitleBar
                  label={mediaRendererProps.label}
                  title={requestedProject?requestedProject.metadata.title:''}
                  onClose={handleBackToHomepage}
                  onSave={() => {
                    handleStageChanges()
                    saveModalRef.current.showModal()
                  }}
                  user={user}
                />
              : <Nav items={mediaComponents} onClick={handleCreateNewProject} />
            }
          </span>
          <span>
            { showLoginButton &&
              <button className='nav-btn'
                style={{ marginRight: '10px' }}
                onClick={handleLoginBtnClicked}
              >
              <Icon style={{ fontSize: 'medium', marginRight: '5px' }}>person</Icon>
                Sign in
              </button>
            }
            { showLogoutButton &&
              <button className='nav-btn'
                style={{ marginRight: '10px' }}
                onClick={handleLogOut}
              >
              <Icon style={{ fontSize: 'medium', marginRight: '5px' }}>logout</Icon>
                Sign out
              </button>
            }
          </span>
      </header>

      <main>
        <div className='left-pane'>
          <Modal ref={saveModalRef}>
            <form onSubmit={e => {
              e.preventDefault()
              handleSaveProject(e.target.elements.filename.value)
            }}>
              <p>Save as</p>
              <input style={{ margin: '5px 5px 5px 0' }}
                type='text' 
                name='filename' 
                defaultValue={requestedProject?requestedProject.metadata.title:''}
              />
              <button type='submit'>save</button>
            </form>
          </Modal>
          <Modal ref={unsavedChangesModalRef}>
            <p>Save changes made to this file?</p>
            <br></br>
            <span style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '5px'}}>
              <button onClick={() => {
                handleStageChanges()
                unsavedChangesModalRef.current.close()
                saveModalRef.current.showModal()
              }}>
                Yes
              </button>
              <button onClick={() => {
                unsavedChangesModalRef.current.close()
                setShowMedia(false)
              }}>
                No
              </button>
            </span>
          </Modal>

          <div className='left-pane-content-container'>
            { !showMedia && !showLoginForm && !user && 
                <WelcomeMessage />
            }
            { !showMedia && !showLoginForm && user &&
                <Dashboard directory={user.directory} 
                  onOpenProject={handleOpenProject} 
                  onDeleteProject={handleDeleteProject}
                />
            }
            { showLoginForm &&
                <Login onCancel={handleCancelLogin} 
                  successCallback={handleLoggedIn}
                />
            }
            { showMedia && <MediaRenderer ref={attachMediaController} {...mediaRendererProps} /> }
          </div>
        </div>

        <div className='right-pane'>
          <div className='editor-container'>
            <TextEditor ref={textEditorRef}
              getStampData={getStampDataFromMedia} 
              onContentChange={handleEditorContentChange}
            />
          </div>
        </div>
      </main>
    </div>  
  )
}

export default App 


const FileSyncInstructions = () => (
  <>
    <div className="h-full w-full overflow-auto p-[10%]">
      <p>
        <strong>File Sync Mode</strong> allows you to save projects to a designated directory on your device. All projects saved in that directory will appear in this pane, enabling you to open and manage them directly within the app. 
      </p>
      <br></br>
      <p>Instructions:</p>
      <p>
        <li>Click the <code>Open directory</code> button above and select a folder.</li>
        <li>Grant the app permission to edit files.</li>
        <li>Create a new project by clicking one of the buttons in the navigation bar or open an existing project by selecting it from the list.</li>
      </p>
      <br></br>
      <p>
        <strong className="text-yellow-500">
          Note:&nbsp;
        </strong>
        This feature leverages the recently launched <a href="https://developer.mozilla.org/en-US/docs/Web/API/File_System_API" className="text-blue-600">File System Access API</a> which works best in Chrome.
      </p>
      <br></br>
      <p>
        <strong className="text-red-500">
          Warning:&nbsp;
        </strong>
        Avoid editing the saved files directly on your device. Instead, manage your projects exclusively through the app by using the File Sync feature to ensure proper functionality.
      </p>
    </div>
  </>

)

export default FileSyncInstructions

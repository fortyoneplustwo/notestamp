const FileSyncInstructions = () => (
  <>
    <div className="h-full w-full overflow-auto p-[10%]">
      <p>
        <span className="text-[orangered] font-bold">File Sync</span> enables
        seamless project management by linking a designated directory on your
        device to the app. Projects saved in this folder automatically appear in
        the app, allowing you to open, edit, and manage them effortlessly.
      </p>
      <br />
      <p>
        Simply click the <code>Open Directory</code> button to select a folder
        and grant the app permission to edit files.
      </p>
      <br></br>
      <p>
        <strong className="text-red-500">Warning:&nbsp;</strong>
        Avoid editing the saved files directly on your device. Instead, manage
        your projects exclusively through the app by using{" "}
        <strong>File Sync</strong> to ensure proper functionality.
      </p>
    </div>
  </>
)

export default FileSyncInstructions

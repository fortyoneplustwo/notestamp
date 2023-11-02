import React from 'react'

const FileUpload = React.forwardRef((props, ref) => {
  const { onSubmit, type } = props

  return (
    <dialog ref={ref}>
      <form onChange={event => { onSubmit(event.target.files[0], ref) }}>
        <input type="file" accept={type} />
      </form>   
      <p style={{ fontSize: 'x-small'}}>Press ESC key to close</p>
    </dialog>
  )
})

export default FileUpload

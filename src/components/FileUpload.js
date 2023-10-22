import React from 'react'

const FileUpload = React.forwardRef((props, ref) => {
  const { onSubmit } = props

  return (
    <dialog ref={ref}>
      <form onChange={event => { onSubmit(event.target.files[0], ref) }}>
        <input type="file" accept='.stmp' />
      </form>   
      <p style={{ fontSize: 'x-small'}}>Press ESC key to close</p>
    </dialog>
  )
})

export default FileUpload

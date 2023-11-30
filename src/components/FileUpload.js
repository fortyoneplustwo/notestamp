import React from 'react'
import CloseButton from './CloseButton'

const FileUpload = React.forwardRef((props, ref) => {
  const { onSubmit, type } = props

  return (
    <dialog ref={ref}>
      <div style={{ display: 'flex', justifyContent: 'right', marginBottom: '0.5em' }}>
        <CloseButton handler={() => {ref.current.close()}}/>
      </div>
      <form onChange={event => { onSubmit(event.target.files[0], ref) }}>
        <input type="file" accept={type} />
      </form>   
    </dialog>
  )
})

export default FileUpload

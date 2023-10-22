import React, { useMemo, useCallback, useRef } from 'react'
import { isKeyHotkey } from 'is-hotkey'
import { Editable, withReact, useSlate } from 'slate-react'
import * as SlateReact from 'slate-react'
import {
  Editor,
  Transforms,
  Range,
  createEditor,
} from 'slate'
import { withHistory } from 'slate-history'
import isHotkey from 'is-hotkey'
import { EventEmitter } from './EventEmitter.js'
import { Toolbar, Button, Icon } from './Toolbar.js'
import FileUpload from './FileUpload.js'

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code'
}

const badgeCSS = {
  fontFamily: 'Helvetica',
  fontWeight: 'bold',
  backgroundColor:'transparent',
  color: 'tomato',
  textAlign: 'center',
  paddingRight: '10px',
  paddingTop:'0px',
  fontSize: '0.65em',
  cursor: 'pointer',
  userSelect: 'none',
  height: '100%'
}

const InlinesExample = ({ editorStyle, onCreateBadge, textContentRequest }) => {
  const fileUploadModalRef = useRef(null)
  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  const editor = useMemo(() => withInlines(withReact(withHistory(createEditor()))), [])
  

  const initialValue = useMemo(
    () => 
      JSON.parse(localStorage.getItem('content')) || [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
    []
  )

  const handleOpenFile = (file, modal) => {
    modal.current.close() 
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const newNodes = JSON.parse(e.target.result)
          // fix: focus the editor to ensure all nodes get removed
          Transforms.select(editor, {
            anchor: Editor.start(editor, []),
            focus: Editor.end(editor, []),
          })
          Transforms.removeNodes(editor)
          // if editor is empty remove the default empty paragraph node
          if (editor.children.length > 0 
            && editor.children[0].type === 'paragraph' 
            && editor.children[0].children[0].text === '') {
            Transforms.removeNodes(editor, { at: [0] })
          }
          Transforms.insertNodes(editor, newNodes)
        } catch (error) {
          console.error('Error parsing JSON:', error)
        }
      }
      reader.readAsText(file)
    }
  }

// override copy event to copy only text nodes
const handleCopy = event => {
  event.preventDefault();
  const { selection } = editor
  if (selection) {
    let textContent = ''
    for (const [node] of Editor.nodes(editor, { at: selection })) {
      if ('text' in node) textContent += node.text
    }
    event.clipboardData.setData('text/plain', textContent)
  }
}

// override paste function to prevent '\n' from inserting new paragraphs
const handlePaste = event => {
  event.preventDefault()
  const clipboardData = event.clipboardData
  const pastedText = clipboardData.getData('text/plain')
  Transforms.insertText(editor, pastedText)
}

  ////////////////////////////////
  ///  JSX  //////////////////////
  ////////////////////////////////

  return (
    <SlateReact.Slate editor={editor} initialValue={initialValue}
      onChange={value => {
        const isAstChange = editor.operations.some(op => 'set_selection' !== op.type)
        if (isAstChange) {
          const content = JSON.stringify(value)
          localStorage.setItem('content', content)
        }
      }}
    >
      <div style={{  display: 'flex', flexDirection: 'column', fontSize: '16px', width: '100%', height: '90%' }}>
        <FileUpload ref={fileUploadModalRef} onSubmit={handleOpenFile} />
        <Toolbar style={{ display: 'flex', flexDirection: 'row'}}>
          <MarkButton format='bold' icon="format_bold" description='Bold (Ctrl+B)' />
          <MarkButton format='italic' icon="format_italic" description="Italic (Ctrl+I)"/>
          <MarkButton format='underline' icon="format_underlined" description="Underline (Ctrl+U)"/>
          <MarkButton format='code' icon="code" description="Code (Ctrl+`)"/>
          <div style={{ width: '1px', backgroundColor: '#ccc'}}></div>
          <OpenFileButton icon="folder_open" description="Open document" modal={fileUploadModalRef} />
          <ActionButton action='copy' icon="content_copy" description="Copy all text to clipboard" />
          <ActionButton action='save' icon="download" description="Download document" />
          <div style={{ width: '1px', backgroundColor: '#ccc'}}></div>
          <form action="https://www.paypal.com/donate" method="post" target="_top">
            <input type="hidden" name="business" value="L7VEWD374RJ38" />
            <input type="hidden" name="no_recurring" value="0" />
            <input type="hidden" name="item_name" value="Help me dedicate more time to developing this application and keep it free." />
            <input type="hidden" name="currency_code" value="CAD" />
            <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
            <img alt="" border="0" src="https://www.paypal.com/en_CA/i/scr/pixel.gif" width="1" height="1" />
          </form>

        </Toolbar>
        <Editable
          style={editorStyle}
          placeholder="Write here."
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          spellCheck={true}
          autoFocus={true}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onKeyDown={(event) => { onKeyDown(event, onCreateBadge, editor) }}
        />
      </div>
    </SlateReact.Slate>
  )
}



////////////////////////////////
///  METHODS  //////////////////
////////////////////////////////

// Keyboard events
const onKeyDown = (event, onCreateBadge, editor) => {
  const { nativeEvent } = event
  const { selection } = editor
// handle formatting hotkeys. TODO reimplement this. it's really slow
  for (const hotkey in HOTKEYS) {
    if (isHotkey(hotkey, event)) {
      event.preventDefault()
      const mark = HOTKEYS[hotkey]
      if(mark === 'pre') Transforms.insertNodes(editor, { type: 'code', children: [{ text: ''}]})
      toggleMark(editor, mark)
    }
  }
  // on tab
   if (isHotkey('tab', nativeEvent)) {
    event.preventDefault()
    const marks = Editor.marks(editor)
    Transforms.insertText(editor, '\t') // tab = 2 spaces
    for(const mark in marks) if (marks[mark]) Editor.addMark(editor, mark, true)
    return
  } 
  // on shift enter: prevent insertion of new paragraph
  else if (isHotkey('shift+enter', nativeEvent)) {
    event.preventDefault()
    return
  }
  // on enter: insert badge
  else if (isKeyHotkey('enter', nativeEvent)) {
    const { label, value } = onCreateBadge()
    event.preventDefault()
    // save marks then restore after all transforms have been performed
    const marks = Editor.marks(editor)
    // abort insertion of badge if value not assigned
    if (!value) { 
      Transforms.insertText(editor, '\n')
      return
    } 
    const content = editor.children
    const editorIsEmpty = content.length === 1 
      && content[0].children.length === 1 
      && content[0].children[0].text === ''
    if (!editorIsEmpty) Transforms.insertText(editor, '\n')
    const caretPathBeforeInsert = editor.selection.focus.path
    Transforms.insertNodes(editor, { 
      type: 'badge', 
      label: label, 
      value: value,
      children: [{ text: '' }] 
    })
    // fix to place the caret after the newly inserted badge
    const caretPathAfterInsert = {
      path: [caretPathBeforeInsert[0], caretPathBeforeInsert[1] + 2], offset: 0
    }
    Transforms.select(editor, ({
        anchor: caretPathAfterInsert,
        focus: caretPathAfterInsert
      }
    ))
    // restore marks
    for (const mark in marks) if (marks[mark]) Editor.addMark(editor, mark, true) 
  }
  if (selection && Range.isCollapsed(selection)) {
    // on left
    if (isKeyHotkey('left', nativeEvent)) {
      event.preventDefault()
      Transforms.move(editor, { unit: 'offset', reverse: true })
      return
    } // on right
    else if (isKeyHotkey('right', nativeEvent)) {
      event.preventDefault()
      Transforms.move(editor, { unit: 'offset' })
      return
    }
    else return
  }
}

const downloadJSON = (jsonObject, fileName) => {
  const jsonString = JSON.stringify(jsonObject, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName || 'document.stmp'
  link.click()
  URL.revokeObjectURL(url)
}

const toggleAction = (editor, action) => {
  if (action === 'save') {
    const json = JSON.parse(localStorage.getItem('content'))
    downloadJSON(json, null) 
  }
  else if (action === 'copy') {
    const children = editor.children[0].children
    let textContent = ''
    for (const node of children) {
      if ('text' in node) textContent += node.text
    }
    navigator.clipboard.writeText(textContent)
  }
}

// toggle format (e.g. bold, italics) on selection
const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

// Returns an editor that supports inline elements
const withInlines = editor => {
  const {
    isInline,
    isElementReadOnly,
    isSelectable,
  } = editor
  // overriding these methods to define badge behaviour
  editor.isInline = element => 
    ['badge'].includes(element.type) || isInline(element)
  editor.isElementReadOnly = element => 
    element.type === 'badge' || isElementReadOnly(element)
  editor.isSelectable = element => 
    element.type !== 'badge' && isSelectable(element)
  return editor
}

////////////////////////////////
///  Components  ///////////////
////////////////////////////////

const OpenFileButton = ({ icon, description, modal }) => {
  return (
    <Button
      title={description}
      onMouseDown={() => {
        modal.current.showModal()
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const ActionButton = ({ action, icon, description}) => {
  const editor = useSlate()
  return (
    <Button
      title={description}
      onMouseDown={() => {
        toggleAction(editor, action)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const MarkButton = ({ format, icon, description }) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, format)}
      title={description}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const Element = props => {
  const { attributes, children, element } = props
  switch (element.type) {
    case 'badge':
      return <Badge {...props} />
    default:
      return <p {...attributes}>{children}</p>
  }
}

const Badge = ({ attributes, children, element }) => {
  return (
    <span
      {...attributes}
      contentEditable={false}
      onClick={() => { 
        EventEmitter.dispatch('badgeClicked', [element.label, element.value])
      }}
      style={badgeCSS}
    >
      {children}
      <InlineChromiumBugfix />
      {element.label}
      <InlineChromiumBugfix />
    </span>
  )
}

const Leaf = props => {
  let { attributes, children, leaf } = props
  if (leaf.bold) children = <strong>{children}</strong>
  if (leaf.code) children = <code style={{ color: 'grey'}}>{children}</code>
  if (leaf.italic) children = <em>{children}</em>
  if (leaf.underline) children = <u>{children}</u>
  return (
    <span
      // The following is a workaround for a Chromium bug where,
      // if you have an inline at the end of a block,
      // clicking the end of a block puts the cursor inside the inline
      // instead of inside the final {text: ''} node
      // https://github.com/ianstormtaylor/slate/issues/4704#issuecomment-1006696364
      style={{ paddingLeft: leaf.text === '' ? '0.1px' : 'null' }}
      {...attributes}
    >
      {children}
    </span>
  )
}

// Put this at the start and end of an inline component to work around this Chromium bug:
// https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
const InlineChromiumBugfix = () => (
  <span
    contentEditable={false}
    style={{ fontSize: 0 }}
  >
    {String.fromCodePoint(160) /* Non-breaking space */}
  </span>
)

export default InlinesExample

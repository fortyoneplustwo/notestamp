import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { isKeyHotkey } from 'is-hotkey'
import { Editable, withReact, useSlate } from 'slate-react'
import * as SlateReact from 'slate-react'
import {
  Editor,
  Transforms,
  createEditor,
  Text,
  Element as SlateElement
} from 'slate'
import { withHistory } from 'slate-history'
import isHotkey from 'is-hotkey'
import { EventEmitter } from './EventEmitter.js'
import { Toolbar, Button, Icon } from './Toolbar.js'
import Modal from './Modal.js'
import escapeHtml from 'escape-html'
import { jsPDF } from 'jspdf'
import '../Editor.css'

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
  'mod+k': 'playPause',
  'mod+j': 'rewindTenSecs',
  'mod+l': 'forwardTenSecs'
}
  const LIST_TYPES = ['numbered-list', 'bulleted-list']

const TextEditor = ({ user=null, content=null, onRequestStampData, onSave }) => {
  const [internalClipboard, setInternalClipboard] = useState([])
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

  ////////////////////////////////////////////////////////////////////
  // For logged in users only
  //
  // replace contents of editor with content (type: stmp)
  useEffect(() => {
    // TODO: save should only appear in color when a project has been modified
    if (content) {
      const newNodes = JSON.parse(content)
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
    }
  }, [content, editor])
  //////////////////////////////////////////////////////////////////

  // Paste contents of submitted .stmp file into the editor
  const handleOpenFile = file => {
    fileUploadModalRef.current.close() 
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

  // Override copy 
  // Copy nodes to internal clipboard and text to device clipboard
  const handleCopy = event => {
    event.preventDefault();
    const { selection } = editor
    if (selection) {
      const [paragraph] = editor.getFragment()
      const copiedTextNodes = paragraph.children.filter(node => 'text' in node)
      const copiedText = copiedTextNodes.reduce((text, node) => text += node.text, '')
      event.clipboardData.setData('text/plain', copiedText)
      setInternalClipboard(copiedTextNodes)
    }
  }

  // Override paste
  // Paste nodes from internal clipboard if the 
  // state of internal clipboard = state of device clipboard.
  // Otherwise paste contents actual clipboard
  const handlePaste = event => {
    event.preventDefault()
    const internalClipboardToText = internalClipboard.reduce((textAcc, node) => textAcc + node.text, '') 
    const deviceClipboardData = event.clipboardData.getData('Text')
    if (internalClipboardToText === deviceClipboardData) {
      for (const node of internalClipboard) {
        Transforms.insertNodes(editor, { ...node })
      }
    }
    else {
      Transforms.insertText(editor, deviceClipboardData.toString())
    }
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
      <div className='editor-container'>
        <Modal ref={fileUploadModalRef}>
          <form onChange={e => { handleOpenFile(e.target.files[0]) }}>
            <input type='file' accept='.stmp' />
          </form>
        </Modal>
        <Toolbar>
          <div className='toolbar-btn-container'>
            <MarkButton format='bold' icon="format_bold" description='Bold (Ctrl+B)' />
            <MarkButton format='italic' icon="format_italic" description="Italic (Ctrl+I)"/>
            <MarkButton format='underline' icon="format_underlined" description="Underline (Ctrl+U)"/>
            <MarkButton format='code' icon="code" description="Code (Ctrl+`)"/>
            <BlockButton format="numbered-list" icon="format_list_numbered" />
            <BlockButton format="bulleted-list" icon="format_list_bulleted" />
            <div className='toolbar-btn-separator'></div>
            <ActionButton action='upload' icon="folder_open" description="Open .stmp file" 
              onClick={() => { fileUploadModalRef.current.showModal() }} />
            <ActionButton action='copy' icon="content_copy" description="Copy all text to clipboard" />
            <ActionButton action='download' icon="download" description="Download project file (.stmp)" />
            <ActionButton action='pdf' icon="picture_as_pdf" description="Export to PDF document" />
            {user && <ActionButton action='save' icon="save" description="Save changes"
              onClick={onSave}/>}
          </div>
        </Toolbar>
        <Editable
          className='editor'
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder={'Press <Enter> to insert a stamp.\nPress <Shift + Enter> to escape stamping.'}
          spellCheck={true}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onKeyDown={(event) => { onKeyDown(event, onRequestStampData, editor) }}
        />
      </div>
    </SlateReact.Slate>
  )
}

////////////////////////////////
///  METHODS  //////////////////
////////////////////////////////

// Keyboard events
const onKeyDown = (event, onRequestStampData, editor) => {
  const { nativeEvent } = event
// Handle formatting hotkeys. TODO reimplement this. it's really slow
  for (const hotkey in HOTKEYS) {
    if (isHotkey(hotkey, event)) {
      event.preventDefault()
      const mark = HOTKEYS[hotkey]
      toggleMark(editor, mark)
    }
  }
  // on tab
  if (isHotkey('tab', nativeEvent)) {
    event.preventDefault()
    const marks = Editor.marks(editor)
    Transforms.insertText(editor, '\t')
    for(const mark in marks) if (marks[mark]) Editor.addMark(editor, mark, true)
    return
  } 
  // on shift + enter: insert a block of same type without a stamp
  else if (isHotkey('shift+enter', nativeEvent)) {
    event.preventDefault()
    const { selection } = editor
    const startPath = Editor.start(editor, selection);
    const [block] = Editor.parent(editor, startPath)
    const marks = Editor.marks(editor) // *
    Transforms.insertNodes(editor, { ...block, children: [{ text: '' }] })
    for (const mark in marks) if (marks[mark]) Editor.addMark(editor, mark, true) 
    return 
  }
  // on enter: insert stamp
  else if (isKeyHotkey('enter', nativeEvent)) {
    const { label, value } = onRequestStampData(new Date())
    event.preventDefault()

    // Get the block that wraps our current selection
    const { selection } = editor
    const startPath = Editor.start(editor, selection);
    const [block] = Editor.parent(editor, startPath)

    // save marks on current selection 
    const marks = Editor.marks(editor) // *
    
    // abort insertion of stamp if stamp value is null
    if (!value) { 
      Transforms.insertNodes(editor, { ...block, children: [{ text: '' }] })
      for (const mark in marks) if (marks[mark]) Editor.addMark(editor, mark, true) 
      return 
    } 

    // If current block contains either a stamp node or a non-empty text node
    // then insert a similar block with an empty text node
    const stampFound = block.children.reduce(
      (accumulator, node) => {
        return accumulator || ('type' in node ? node.type === 'stamp' : false)
      },
      false
    )
    const lastChild = block.children.length - 1 // lastChild always contains the text content
    if (stampFound || block.children[lastChild].text !== '') {
      Transforms.insertNodes(editor, { ...block, children: [{ text: '' }] })
    }

    // Proceed with stamp insertion
    const caretPathBeforeInsert = editor.selection.focus.path // **
    Transforms.insertNodes(editor, {
      type: 'stamp', 
      label: label, 
      value: value,
      children: [{ text: '' }] 
    })

    // ** (fix) After insertion the caret mysteriously disappears.
    // Force caret position to after newly inserted node.
    const path = [...caretPathBeforeInsert]
    path[path.length-1] = caretPathBeforeInsert[path.length-1] + 2
    const caretPathAfterInsert = {
      path: path, offset: 0
    }

    Transforms.select(editor, ({
        anchor: caretPathAfterInsert,
        focus: caretPathAfterInsert
      }
    ))

    // * (fix) restore marks
    for (const mark in marks) if (marks[mark]) Editor.addMark(editor, mark, true) 
    return
  }
}

// Recursive algorithm that consumes an editor and returns its text nodes as html
const toHtml = node => {
  if (Text.isText(node)) {
    let string = escapeHtml(node.text)
    string = string.replace(/\n/g, '<br>')
    string = string.replace(/\t/g, '&nbsp;&nbsp;')
    if (node.bold) {
      string = `<strong>${string}</strong>`
    } else if (node.italic) {
      string = `<em>${string}</em>`
    } else if (node.underline) {
      string = `<u>${string}</u>`
    } else if (node.code) {
      string = `<code>${string}</code>`
    }
    return string
  }
  const children = node.children.map(n => toHtml(n)).join('')
  switch (node.type) {
    case 'quote':
      return `<blockquote><p>${children}</p></blockquote>`
    case 'paragraph':
      return `<p>${children}</p>`
    case 'link':
      return `<a href="${escapeHtml(node.url)}">${children}</a>`
    default:
      return children
  }
}

// Download stmp file
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
const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(
    editor,
    format
  )
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type),
    split: true,
  })
  const newProperties = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  }
  Transforms.setNodes(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleAction = (editor, action) => {
  if (action === 'download') {
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
  else if (action === 'pdf') {
    const result = toHtml(editor)
    // Default export is a4 paper, portrait, using millimeters for units
    const doc = new jsPDF();
    doc.html(result, {
      callback: function(doc) {
          // Save the PDF
          doc.save('document.pdf');
      },
      x: 15,
      y: 15,
      width: 170, //target width in the PDF document
      windowWidth: 650, //window width in CSS pixels
    })
  }
}

// Toggle mark on current selection
const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor, format, blockType = 'type') => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    })
  )

  return !!match
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

// Returns an editor that supports inline elements
const withInlines = editor => {
  const {
    isVoid,
    isInline,
    isElementReadOnly,
    isSelectable,
  } = editor
  // overriding these methods to define stamp behaviour
  editor.isVoid = element => 
    ['stamp'].includes(element.type) || isVoid(element)
  editor.isInline = element => 
    ['stamp'].includes(element.type) || isInline(element)
  editor.isElementReadOnly = element => 
    element.type === 'stamp' || isElementReadOnly(element)
  editor.isSelectable = element => 
    element.type !== 'stamp' && isSelectable(element)
  return editor
}

////////////////////////////////
///  Components  ///////////////
////////////////////////////////

const ActionButton = ({ action, icon, description, ...props }) => {
  const editor = useSlate()
  return (
    <Button
      title={description}
      onClick={() => {
        toggleAction(editor, action)
      }}
      {...props}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const BlockButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(
        editor,
        format
      )}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format)
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
  const { children, element, attributes } = props
  switch (element.type) {
    case 'stamp':
      return <Stamp {...props} />
    case 'bulleted-list':
      return (
        <ul {...attributes}>
          {children}
        </ul>
      )
     case 'list-item':
      return (
        <li {...attributes}>
          {children}
        </li>
      )
    case 'numbered-list':
      return (
        <ol {...attributes}>
          {children}
        </ol>
      )
    default:
      return <Paragraph {...props}>{children}</Paragraph>
  }
}

const Paragraph = ({ attributes, children }) => {
  return (
    <p 
      {...attributes}
      style={{ margin: '0', padding: '0' }}
    >
      {children}
    </p>
  )
}

const Stamp = ({ attributes, children, element }) => {
  return (
    <span
      {...attributes}
      contentEditable={false}
      onClick={() => { 
        EventEmitter.dispatch('stamp-clicked', [element.label, element.value])
      }}
      className='badge'
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

export default TextEditor

import React, { useMemo, useCallback, useState, useImperativeHandle, useEffect } from 'react'
import { Editable, withReact, useSlate } from 'slate-react'
import * as SlateReact from 'slate-react'
import {
  Editor,
  Transforms,
  createEditor,
  Element as SlateElement,
  Point,
} from 'slate'
import { withHistory } from 'slate-history'
import isHotkey from 'is-hotkey'
import { Toolbar, Button, Icon } from './components/Toolbar.js'
import './style/Editor.css'
import { useProjectContext } from '../../context/ProjectContext.js'
import { downloadPdf } from './components/PdfDownloader.js'

const markButtonHotkeys = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
}

const blockButtonHotkeys = {
  'mod+shift+8': 'numbered-list',
  'mod+shift+9': 'bulleted-list',
}

const LIST_TYPES = ['numbered-list', 'bulleted-list']

const TextEditor = React.forwardRef(({ onStampInsert, onStampClick }, ref) => {
  const [internalClipboard, setInternalClipboard] = useState([])
  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  const { setEditorRef } = useProjectContext()

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

  const Stamp = ({ attributes, children, element }) => {
    return (
      <span
        {...attributes}
        contentEditable={false}
        onClick={() => onStampClick(element.label, element.value)}
        className="badge"
      >
        {children}
        <InlineChromiumBugfix />
        {element.label}
        <InlineChromiumBugfix />
      </span>
    )
  }

  const Element = props => {
    const { children, element, attributes } = props
    switch (element.type) {
      case 'stamp':
        return <Stamp {...props} />
      case 'bulleted-list':
        return (
          <ul 
            {...attributes}
            className="list-disc list-inside"
          >
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
          <ol 
            {...attributes}
            className="list-decimal list-inside"
          >
            {children}
          </ol>
        )
      default:
        return <Paragraph {...props}>{children}</Paragraph>
    }
  }

  const setEditorChildren = useCallback((children) => {
    // Select entire content to ensure all nodes get removed
    Transforms.select(editor, {
      anchor: Editor.start(editor, []),
      focus: Editor.end(editor, []),
    })

    Transforms.unwrapNodes(editor)
    Transforms.removeNodes(editor)
    Transforms.insertNodes(editor, children)
  }, [editor])


  useEffect(() => {
    setEditorRef(ref.current)

    return () => {
      setEditorRef(null)
    }
  }, [setEditorRef, ref])

  useImperativeHandle(ref, () => {
    return {
      setContent: contentString => {
        try {
          const children = JSON.parse(contentString)
          setEditorChildren(children)
        } catch (error) {
          console.error(`Invalid editor content:\n${error}`)
        }
      },
      getContent: () => {
        return editor.children
      }
    }
  }, [editor, setEditorChildren])

  /** 
   * Override copy:
   * Copy nodes to editor clipboard and text to device clipboard
   */
  const handleCopy = event => {
    event.preventDefault()
    const { selection } = editor
    if (selection) {
      const fragment = editor.getFragment()

      // Each item in copiedLines is an array that contains the text nodes of a single line
      const copiedLines = []
      for (const block of fragment) {
        if (block.type === 'paragraph') {
          const line = block.children.map(child => {
            return child
          })
          copiedLines.push(line)
        } else { // list block
          for (const listItem of block.children) {
            const line = listItem.children.map(child => {
              return child
            })
            copiedLines.push(line)
          }
        }
      }
      
      // join the copied lines into a single string
      const copiedLinesToString = copiedLines.reduce((acc, line) => {
        return acc 
          + (line.reduce((acc, textNode) => {
            return acc + textNode.text
          }, '')) 
          + '\n'
      }, '')

      event.clipboardData.setData('text/plain', copiedLinesToString)
      setInternalClipboard(copiedLines)
    }
  }

  /** 
   * Override paste:
   * Paste nodes from editor clipboard if editor clipboard = device clipboard
   * Otherwise paste contents of device clipboard
   */
  const handlePaste = event => {
    event.preventDefault()

    // convert editor clipboard to string
    const internalClipboardToText = internalClipboard.reduce((acc, line) => {
      return acc 
        + (line.reduce((acc, textNode) => {
          return acc + textNode.text
        }, '')) 
        + '\n'
    }, '')

    const deviceClipboardData = event.clipboardData.getData('Text')
    if (internalClipboardToText === deviceClipboardData) {
      for (let i = 0; i < internalClipboard.length; i++) {
        for (const textNode of internalClipboard[i]) {
          Transforms.insertNodes(editor, { ...textNode })
        }
        if (i < internalClipboard.length - 1) {
          Transforms.insertNodes(editor, { text: '\n'})
        }
      }
    }
    else {
      Transforms.insertText(editor, deviceClipboardData.toString())
    }
  }

  const dispatchKeyEvent = (event) => {
    switch (event.key) {
      case "Tab":
        event.preventDefault()
        handleInsertTab(event, editor)
        break
      case "Enter":
        if (event.shiftKey) {
          event.preventDefault()
          handleEscapeStamp(editor)
        } else {
          event.preventDefault()
          handleInsertStamp(onStampInsert, editor)
        }
        break
      case "Backspace":
        handleBackspace(editor, event)
        break
      default:
        for (let hotkey in markButtonHotkeys) {
          if (isHotkey(hotkey, event)) {
            event.preventDefault()
            toggleMark(editor, markButtonHotkeys[hotkey])
            return
          }
        }

        for (let hotkey in blockButtonHotkeys) {
          if (isHotkey(hotkey, event)) {
            event.preventDefault()
            toggleBlock(editor, blockButtonHotkeys[hotkey])
            return
          }
        }
    }
  }

  return (
    <div 
      className="border-none bg-transparent h-full"
      >
      <SlateReact.Slate editor={editor} initialValue={initialValue}
        onChange={value => {
          const isAstChange = editor.operations.some(op => 'set_selection' !== op.type)
          if (isAstChange) {
            const content = JSON.stringify(value)
            localStorage.setItem('content', content)
          }
        }}
      >
        <div className="flex flex-col h-full">
          <Toolbar>
            <div className='toolbar-btn-container'>
              <MarkButton 
                format='bold' 
                icon="format_bold" 
                description='Bold (Ctrl+B)' 
              />
              <MarkButton 
                format='italic' 
                icon="format_italic" 
                description="Italic (Ctrl+I)"
              />
              <MarkButton 
                format='underline' 
                icon="format_underlined" 
                description="Underline (Ctrl+U)"
              />
              <MarkButton 
                format='code' 
                icon="code" 
                description="Plain Text (Ctrl+`)"
              />
              <BlockButton 
                format="numbered-list" 
                icon="format_list_numbered" 
                description="Toggle numbered list (Ctrl+Shift+8)"
              />
              <BlockButton 
                format="bulleted-list" 
                icon="format_list_bulleted" 
                description="Toggle bulleted list (Ctrl+Shift+9)"
              />
              <div className='toolbar-btn-separator'></div>
              <ActionButton 
                action='pdf' 
                icon="picture_as_pdf" 
                description="Download as .pdf document"
              />
            </div>
          </Toolbar>
          <Editable
            className="overflow-x-hidden outline-none p-1 w-full h-full color-black bg-white"
            style={{ tabSize: "2" }}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder={'Press <enter> to insert a stamp.\nPress <shift + enter> to escape stamping.'}
            spellCheck={true}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onKeyDown={dispatchKeyEvent}
          />
        </div>
      </SlateReact.Slate>
    </div>
  )
})

const handleInsertTab = (event, editor) => {
    event.preventDefault()
    const marks = Editor.marks(editor)
    Transforms.insertText(editor, '\t')
    for(const mark in marks) if (marks[mark]) Editor.addMark(editor, mark, true)
    return
}

const handleInsertStamp = (getStampData, editor) => {
  const { label, value } = getStampData(new Date())

  // Get the block that wraps our current selection
  const { selection } = editor
  const startPath = Editor.start(editor, selection)
  const [block] = Editor.parent(editor, startPath)

  const marks = Editor.marks(editor) // Save marks applied on current selection
  
  // Abort insertion of stamp if stamp value is null
  if (!value) { 
    Transforms.insertNodes(editor, { ...block, children: [{ text: '' }] })
    for (const mark in marks) if (marks[mark]) Editor.addMark(editor, mark, true) 
    return 
  } 

  // If current block contains either a stamp node or a non-empty text node
  // then insert a block of similar type with an empty text node
  const stampFound = block.children.reduce(
    (accumulator, node) => {
      return accumulator || ('type' in node ? node.type === 'stamp' : false)
    },
    false
  )
  const textNode = block.children[block.children.length - 1]
  if (stampFound || textNode.text !== '') {
    Transforms.insertNodes(editor, { ...block, children: [{ text: '' }] })
  }

  // Proceed with stamp insertion
  const caretPathBeforeInsert = editor.selection.focus.path
  Transforms.insertNodes(editor, {
    type: 'stamp', 
    label: label, 
    value: value,
    children: [{ text: '' }] 
  })

  // Fix: After insertion the caret mysteriously disappears.
  // Force caret position to be positioned after the newly inserted node.
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

  // Fix: restore marks
  for (const mark in marks) if (marks[mark]) Editor.addMark(editor, mark, true) 
  return
}

// TODO: This is a temp solution with some caveats. Needs to be rewritten.
const handleBackspace = (editor, event) => {
  const { selection } = editor
  const startPath = Editor.start(editor, selection)
  const [block] = Editor.parent(editor, startPath)

  if (selection.isFocused && Point.compare(selection.anchor, selection.focus)) {
    console.log("triggered")
    return
  }

  // Fix: manually delete empty block to make sure caret appears at the 
  // end of previous block after delete operation 
  // Make sure not to delete last remaining block
  if (editor.children.length > 1 
    || (editor.children.length === 1 
      && block.type === 'list-item' 
      && editor.children[0].children.length > 1)) {
    if (block.children.length === 1 && block.children[0].text === '') {
      event.preventDefault()
      Transforms.removeNodes(editor, { at: startPath }) 
    }
  }
}

const handleEscapeStamp = (editor) => {
  const { selection } = editor
  const startPath = Editor.start(editor, selection);
  const [block] = Editor.parent(editor, startPath)
  const marks = Editor.marks(editor) // Save marks
  Transforms.insertNodes(editor, { ...block, children: [{ text: '' }] })
  // Fix: Restore marks
  for (const mark in marks) if (marks[mark]) Editor.addMark(editor, mark, true) 
  return 
}

/** 
 * Download the editor's content in JSON format 
 */
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

const handleDownloadNotesAsPdf = (request) => request()

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
    handleDownloadNotesAsPdf(async () => await downloadPdf(editor.children))
  }
}

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

/** 
 * Returns an editor that supports inline elements 
 */
const withInlines = editor => {
  const {
    isVoid,
    isInline,
    isElementReadOnly,
    isSelectable,
  } = editor
  // Overriding these methods to define stamp behaviour
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

/**
 * Components
 */
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

const BlockButton = ({ format, icon, description }) => {
  const editor = useSlate()
  return (
    <Button
      title={description}
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

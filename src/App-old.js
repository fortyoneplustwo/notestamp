import './App.css';
// Import React dependencies.
import React, { useState, useCallback } from 'react';
// Import the Slate editor factory.
import { createEditor, Transforms } from 'slate';
// Import the Slate components and React plugin.
import { Slate, Editable, withReact, useSelected } from 'slate-react'
import { isKeyHotkey } from 'is-hotkey'

const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }]
  }
]

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

const BadgeComponent = ({ attributes, children, element }) => {
  const selected = useSelected()

  return (
    <span
      {...attributes}
      contentEditable={false}
      style={{
        backgroundColor: 'green',
        color: 'white',
        padding: '2px 6px',
        borderRadius: '2px',
        fontSize: '0.9em',
        // ${selected && 'box-shadow: 0 0 0 3px #ddd;'}
      }}
      data-playwright-selected={selected}
    >
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </span>
  )
}

const Text = props => {
  const { attributes, children, leaf } = props
  return (
    <span
      // The following is a workaround for a Chromium bug where,
      // if you have an inline at the end of a block,
      // clicking the end of a block puts the cursor inside the inline
      // instead of inside the final {text: ''} node
      // https://github.com/ianstormtaylor/slate/issues/4704#issuecomment-1006696364
      style={{ paddingLeft: (leaf.text === '') ? '0.1px' : 'null' }}
      {...attributes}
    >
      {children}
    </span>
  )
}

const App = () => {

  const withInlines = editor => {
    const { isInline, isElementReadOnly, isSelectable } = editor;
    editor.isInline = element => ['badge'].includes(element.type) || isInline(element)
    editor.isElementReadOnly = element => element.type === 'badge' || isElementReadOnly(element)
    editor.isSelectable = element => element.type !== 'badge' && isSelectable(element)
    return editor
  }


  const [editor] = useState(() => withInlines(withReact(createEditor())));

   const renderElement = useCallback(props => {
    switch (props.element.type) {
      // case 'paragraph':
      //   return <p {...props.attributes}>{props.children}</p>
      case 'timestamp':
        return <span {...props.attributes} contentEditable={false}>{props.children} </span>
      case 'badge':
        return <BadgeComponent {...props} />
      default:
        return <p {...props.attributes}>{props.children}</p>
    }
  }, [])

  return (
    <>
    <Slate editor={editor} initialValue={initialValue} >
          <Editable 
            renderElement={renderElement}
            // renderLeaf={props => <Text {...props} />}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                console.log('pressed')
                Transforms.insertNodes(editor, 
                { type: 'badge', children: [{ text: '0:00' }] })
              }
            }}
          />
    </Slate>
    </>
  );
}

export default App;

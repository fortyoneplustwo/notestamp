# Description
A single page web application for desktop that syncs notes with media using stamps.

**Media Display**: Left pane showcases various media components including YouTube player, audio recorder, audio player, and PDF reader.  
**Note Editor:** Right pane features a rich text editor. Pressing <Enter> inserts a stamp at the beginning of a line.  
**Stamp Functionality**: Clicking on a stamp returns the media to its state when the stamp was inserted. For audio/video media, this is the timestamp; for PDF media, it's the page number.

# Motivation
- Develop a tool for efficient note-taking and transcription of university lectures.
- Establish an intuitive framework for extending the application with custom media components. This allows integration of alternative media platforms.
- Contribute to open-source software initiatives.

# Goals 
- Features that do not necessitate an internet connection should work even when the device is offline.
- The framework for implementing custom media components should balance simplicity and customizability.
- Core features must be accessible without having to register an account.

# Implementation
## Stack
React, Slate, React-PDF.

## Custom text editor
The application uses a custom rich text editor I built using [Slate](https://docs.slatejs.org/). It can support clickable timestamps alongside text.

Eventually I want the editor to support
- Header blocks
- Code blocks with syntax highlighting
- Collaborative editing

## Dynamic algorithm for the audio recorder 
The MediaStream Recording API I used to implement the recorder does not allow users to query the current time while recording. To circumvent this, 
I implemented a dynamic programming algorithm to compute the timestamp in O(1).

### Algorithm details
  - Keep track of 2 variables `dateWhenRecLastActive` and `dateWhenRecLastInactive`. Update them whenever the audio recorder is active (started/resumed) & inactive (paused/stopped).
  - Update the audio recording's duration, `recDuration`, each time the recorder goes inactive.
  - Mark the date, `dateStampRequested`, whenever the user attemps to insert a stamp. The timestamp can be computed using the following computation:

  ```javascript
   if (dateWhenRecLastActive > dateWhenRecLastInactive) {
    timestamp = recDuration + (dateStampRequested - dateWhenRecLastInactive)
  } else {
    timestamp = recDuration
  }
   ```

# Integrate your custom media component
- Create a React component file with a `forward ref` in `/src/components`
- Within your component, implement controller methods `getState`, `setState` and `getMetadata` inside a `useImperativeHandle` hook. These methods enable communication between the application and your media component.
- Define your custom component in `NonCoreMediaComponents.js`.

## Step 1: Implement the following methods within your component

```javascript
const MyCustomMediaComponent = React.forwardRef((props, ref) => {

  useImperativeHandle(ref, () => {
    return {
      getState: dateStampRequested => {
        // Compute and return media state that will be stored inside the stamp.
        return { label: label, value: value }
      },
      setState: newState => {
        // Update the media element within your component to newState here.
      },
      getMetadata: () => {
        // Return the values passed as props, overwriting some propoerties if need be.
        return { ...props }
      },
      getMedia: () => {
        // Return media buffer that was input/recorded by user.
        return media
      }
    } 
  }, []) // the compiler will tell you what needs to be added to the dependency array

// Rest of the component logic goes here...
}
```
    
### Props
- `label`: The text that appears in the title bar when starting a new project with your media component.
- `type`: A unique identifier for your media component.
- `title`: If opening an existing project, then this value is the title of the project. If opening a new project, this value is an empty string.
- `mimetype`: The MIME type of the media e.g. `application/pdf` or `audio/wav`. This value is an empty string for new projects.
- `src`: If opening an existing project, this value is the endpoint which must be called to stream or download the project's media. This value is an empty string for new projects.

### Exposed handles
You must implement the following handles.
    
#### `getState(dateStampRequested: Date)`
Executes when the <Enter> key is pressed which means a stamp will be inserted. It should return the media state that you would like to store inside the stamp.

**Parameters**  
The function executes with an argument of type `Date` which represents the date when <Enter> was pressed.

**Return value**  
The return value must be an object `{ label: String or Null, value: Any or Null }`.
- `value` is the state of the media you wish to store e.g. the timestamp of the video being viewed.
- `label` is the string representation of `value` that will be displayed inside the stamp e.g. the timestamp in seconds converted to a string in `hh:mm` format.

*Important:* If `value` is set to `null`, then the stamp insertion will be aborted. You may use this to your advantage to skip stamp insertion on certain conditions.
  
#### `setState(newState: Any)`
Executes when a user clicks a stamp. This method should set the state of your media to `newState`.

**Parameters**  
`newState` is the value extracted from the stamp that was clicked.

**Return value**  
None

#### `getMetadata()`
Executes when the application needs to check for unsaved changes and save your project.

**Parameters**  
None.

**Return value**  
You should return the props that were passed to your custom media component, overwriting some properties if needed.

If the media was input from a local device then set `props.mimetype` to the MIME type of the media.
Otherwise, if the media is streamed from a publicly accessible external source, say a youtube link, then set `props.src` to the the youtube link.

#### `getMedia()`
Executes when saving the project or checking for unsaved changes.

**Parameters**  
None

**Return value**  
`null` or a buffer containing the contents of the media.

If media was input/recorded from a local device, then return the media buffer. Otherwise, return `null`

### (Optional) Add a toolbar to your component
If you would like to add a toolbar, we provide a wrapper container together with a toolbar component that matches the design language of the application. You can import them from `LeftPaneComponents.js`. These components are of higher-order, so you may override their default props by passing a `style` prop.

```javascript
import { WithToolbar, Toolbar } from './LeftPaneComponents'

const myCustomMediaComponent = React.forwardRef((_, ref) => {

  // JSX
  return (
    <WithToolbar>
      <Toolbar>
        // Add your toolbar elements here e.g. buttons, inputs forms, etc.
      </Toolbar>
      // The body of your media component's JSX goes here. It is recommended to wrap it in a `div`.
    </WithToolbar>
  )
}
```
See `YoutubePlayer.js`, `AudioPlayer.js` and `PdfReader.js` in `/src/components` for example usage of the `WithToolbar` and `Toolbar` components.

## Step 2: Declare your custom media component in `NonCoreMediaComponents.js`

Add an object to the `myMediaComponents` array that describes your custom media component. The application will integrate it for you.

The object must define the following keys:
- `label`: The text to display as the shortcut to your component within the navigation bar. Clicking on it will open a new project for your media component.
- `path`: The path to your media component relative to the `/src/components` directory.
- `type`: Pick a unique identifier for your component. It cannot be named 'youtube', 'audio', 'recorder' nor 'pdf' because these are already being used by the default media components.

**Example**  
Say you implement a custom component that plays videos from Vimeo.

```javascript
const myMediaComponents = [
  { label: 'Vimeo Player', path: './VimeoPlayer', type: 'vimeo' }
]
```
# Install
`npm install`

`npm start`

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).



# Description
A single page web application for desktop that syncs notes with media using stamps.

- **Media Display**: Left pane showcases various media components including YouTube player, audio recorder, audio player, and PDF reader.  
- **Note Editor:** Right pane features a rich text editor. Pressing `<Enter>` inserts a stamp at the beginning of a line.  
- **Stamp Functionality**: Clicking on a stamp returns the media to its state when the stamp was inserted. For audio/video media, this is the timestamp; for PDF media, it's the page number.

# Motivation
- Develop a tool for efficient note-taking and transcription of university lectures.
- Establish an intuitive framework for extending the application with custom media components. This allows integration of alternative media platforms.
- Contribute to open-source software.

# Goals 
- Features that do not necessitate an internet connection should work even when the device is offline.
- The framework for implementing custom media components should balance simplicity and customizability.
- Core features must be accessible without having to register an account.

# Implementation
## Stack
React, Slate, React-PDF.

## Custom text editor
The application uses a [custom rich text editor](https://github.com/fortyoneplustwo/notestamp-editor-react) I built using [Slate](https://docs.slatejs.org/) wich can support clickable timestamps alongside text.

## Algorithm to calculate a timestamp in real time
The MediaStream Recording API I used to implement the recorder does not allow users to query a timestamp in real time while recording. The algorithm I implemented efficiently manages the recording state by maintaining two key variables: `dateWhenRecLastActive` and `dateWhenRecLastInactive`. These variables are updated whenever the recorder is started, resumed, paused, or stopped. The total recording duration is stored in the `recDuration` variable, which is updated whenever the recorder becomes inactive.

When a user attempts to insert a timestamp, the algorithm first marks the current time as `dateStampRequested`. It then checks whether the recorder is currently active or inactive. If the recorder is active, the timestamp is calculated by adding the difference between `dateStampRequested` and `dateWhenRecLastInactive` to `recDuration`. If the recorder is inactive, the timestamp is simply equal to `recDuration`.

```javascript
if (dateWhenRecLastActive > dateWhenRecLastInactive) {
    timestamp = recDuration + (dateStampRequested - dateWhenRecLastInactive)
} else {
    timestamp = recDuration
}
```

This approach ensures constant time complexity O(1), for both updating the state and computing timestamps, making it highly efficient for real-time applications. The algorithm leverages simple updates and checks, avoiding the overhead of iterating over events or using complex synchronization mechanisms, thus providing an efficient solution for accurate timestamping in audio recordings.

# Integrate your custom media component
## Step 1: Declare your custom media component in the Media Renderer configuration file
Navigate to `/src/components/MediaRenderer`. This is where you will find all the code related to the media components. Open `config.js` and add an object to the `myMediaComponents` array that describes your media component using the following properties:

- **`label`**: This is the text that will appear as a shortcut to your component in the navigation bar. Clicking it will open a new project for your media component.
- **`path`**: This specifies the path to your media component, relative to the `/src/components/MediaRenderer` directory.
- **`type`**: This is a unique identifier for your component. Please ensure it does not conflict with the existing identifiers: 'youtube', 'audio', 'recorder', or 'pdf', which are reserved for the default media components.

**Example**  
Say you implement a custom component that plays videos from Vimeo.

```javascript
const myMediaComponents = [
  { label: 'Vimeo Player', path: '.media/VimeoPlayer/VimeoPlayer', type: 'vimeo' }
]
```

## Step 2: Implement your custom media component
Create a new directory in `/src/components/MediaRenderer/media` that will contain all the code related to your component. Navigate to that directory and create a `jsx` file for your component.

Make sure your component implements the following handles in the example below:

**Example: `VimeoPlayer.jsx`**

```javascript
const VimeoPlayer = React.forwardRef((props, ref) => {

  useImperativeHandle(ref, () => {
    return {
      getState: dateStampRequested => {
        // Compute and return media state that will be stored inside the stamp.
        const someLabel = "";
        const someValue = 7;
        return { label: someLabel, value: someValue }
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

// ... Rest of the component logic goes here.
}
```
 ### Props

The props object will contain the properties you have declared in Step 1 plus some additional fields.

- **`label`**: The text that appears in the title bar when starting a new project with your media component.
- **`type`**: A unique identifier for your media component.
- **`title`**: If opening an existing project, this value is the title of the project. If opening a new project, this value is an empty string.
- **`mimetype`**: The MIME type of the media, e.g., `application/pdf` or `audio/wav`. This value is an empty string for new projects.
- **`src`**: If opening an existing project, this value is the endpoint which must be called to stream or download the project's media. This value is an empty string for new projects.

### Exposed handles

You must implement the following handles to synchronize your component with the main app.

#### `getState(dateStampRequested: Date)`

Executes when the `<Enter>` key is pressed which means a stamp will be inserted. It should return the media state that you would like to store inside the stamp.

**Parameters**  
The function executes with an argument of type `Date` which represents the date when `<Enter>` was pressed.

**Return value**  
The return value must be an object `{ label: String or Null, value: Any or Null }`.

- `value` is the state of the media you wish to store, e.g., the timestamp in seconds of the video being viewed.
- `label` is the string representation of `value` that will be displayed inside the stamp, e.g., the timestamp in seconds converted to a string in `hh:mm` format.

**Important**: If `value` is set to null, then the stamp insertion will be aborted. You may use this to your advantage to skip stamp insertion under certain conditions.

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

- If the media was input from a local device, then set `props.mimetype` to the MIME type of the media.
- If the media is streamed from a publicly accessible external source, e.g., Vimeo, then set `props.src` as the video URL.

#### `getMedia()`

Executes when saving the project or checking for unsaved changes.

**Parameters**  
None

**Return value**  
`null` or a buffer containing the contents of the media.

- If media was input/recorded from a local device, then return the media buffer.
- Otherwise, return `null`.

### (Optional) Add a toolbar to your component
If you would like to add a toolbar, we provide a wrapper container together with a toolbar component that matches the design language of the application. You can import them from `/src/components/MediaRenderer/components/Toolbar`. These components are of higher-order, so you may override the `style` prop.

```javascript
import { WithToolbar, Toolbar } from '../../components/Toolbar'

const myCustomMediaComponent = React.forwardRef((_, ref) => {
  return (
    <WithToolbar>
      <Toolbar>
        // ... Add your toolbar elements here e.g. buttons, inputs forms, etc.
      </Toolbar>
      // ... The body of your media component's JSX goes here.
    </WithToolbar>
  )
}
```

# Install
`npm install`

`npm start`

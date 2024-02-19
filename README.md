# Description
A single page React application for desktop that synchronizes your notes to media using stamps. 

- **Left pane** displays media. Currently supported media components are YouYube player, audio recorder, audio player, and PDF reader.
- **Right pane** displays a rich text editor. Press `<enter>` to insert a stamp at the start of a line. Clicking a particular stamp brings state the media back to when the stamp was inserted (e.g. timestamp for audio/video media and page number for pdf media).

# Motivation
- To build a tool that facilitates note taking and transcribing university lectures.
- To contruct an intuitive framework should you want to extend the application with your own custom media components. For example, if your university hosts lecture videos on a platform other than YouTube, you are able to implement and integrate a compatible custom component.
- To contribute to open source software.

# Goals 
- Features that do not necessitate an internet connection should work even when the device is offline.
- The framework for implementing custom media components should balance simplicity and customizability.
- Core features must be accessible without having to register an account.

# Implementation
## Stack
React, Slate, React-PDF.

## Custom text editor
The application uses a custom rich text editor I built using [Slate](https://docs.slatejs.org/). It can support clickable timestamps alongside text.

Eventually I want the editor to support:
- Header blocks
- Code blocks with syntax highlighting
- Collaborative editing (will require account registration)

## Dynamic algorithm for the audio recorder 
The MediaStream Recording API I used to implement the recorder does not allow users to query the current time while recording. To circumvent this, 
I implemented a dynamic programming algorithm to compute the timestamp in O(1). See more details in [timestamp](https://github.com/fortyoneplustwo/timestamp)
repository (an early version of notestamp).

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

# How to integrate your custom media component
- Create a React component file with a `forward ref` in `/src/components`
- Within your component, implement controller methods `getState`, `setState` and `getMetadata` inside a `useImperativeHandle` hook. These methods enable communication between the application and your media component.
- Define your custom component in `NonCoreMediaComponents.js`.

## Step 1: Implement controller methods within your component

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
      // Return the values passed as props.
      // You may want to update some of these values if they have changed e.g. src.
        return { ...props }
      }
    } 
  }, []) // the compiler will tell you what needs to be added to the dependency array

// Rest of the component logic goes here...
}
```
- `getState(dateStampRequested: Date)`: Called by the application when the user wants to insert a stamp. It should return the media state that you would like to store inside the stamp e.g. `currentTime` of youtube video.

  **Parameters**

  The function takes an optional parameter of type `Date` which represents the date when the stamp insertion was requested i.e. when the user pressed `<Enter>`.

  **Return value:**

  The return value must be an object with keys `{ label: String or Null, value: Any or Null }`.
  - `value` is the state of the media when `getState` was called e.g. current time (in seconds) of the video media.
  - `label` is the string representation of `value` that will be displayed inside the stamp e.g. current time (in seconds) converted to a string in `hh:mm` format.

  *Important:* If either `getState` or `value` evaluate to `null`, then the stamp insertion will be aborted. You may use this to your advantage to skip stamp insertion on certain conditions.
  
- `setState(newState: Any)`: Called by the application when a user clicks a stamp. This method should set the state of your media to `newState`.

   **Parameters**
   - `newState` is extracted from the stamp that was click. It is of the same type and value as the `value` property in object which you return from `getState`.

   **Return value**

   This function should not return any values.

- `getMetadata`: Called when the application needs to check for unsaved changes and save your document.

    *Note*: This is only useful for users who have registered an account. Since integration with the back-end is not yet complete, you may simply return `{ ...props }` or `null` for now.

    **Parameters**

    None.

    **Return value**

    You should return the props that were passed to your custom media component which is an object containing the following metadata: `label`, `type`, `title`, `src`.
    
    In most cases you will either return the props as is or overwrite only the `src` property. For e.g. the Youtube Player component allows the user to play a different video by submitting a new URL. In this case, the component gets the current URL from the embedded player and ovewrites `src` with that value by returning `{ ...props, src: player.current.getVideoUrl()}`.

### (Optional) Add a toolbar to your component
If you would like to add a toolbar, we provide a wrapper container together with a toolbar component that matches the design language of the application. You can import them from `LeftPaneComponents.js` These components are of higher-order, so you may override their default props e.g. passing your own `style` Of course, you may implement your own toolbar if you wish.

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
- `label`: The text to display as the shortcut to your component inside the navigation bar. Clicking on it will open your media component.
- `path`: The path to your media component relative to the /src/components directory.
- `type`: Pick a unique identifier for your component. It cannot be named 'youtube', 'audio', 'recorder' nor 'pdf' because these are already being used by the default media components.

**Example**: Say you implement a custom component that plays videos from Vimeo.

```javascript
const myMediaComponents = [
  { label: 'Vimeo Player', path: './VimeoPlayer', type: 'vimeo' }
]
```
# Install
`npm install`

`npm start`

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).



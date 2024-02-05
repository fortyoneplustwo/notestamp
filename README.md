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
- Build your custom media component as a React component with a `forward ref`.
- Within your component, implement a `controller` object and point the `ref` to it. This `controller` enables the application to communicate with your component for synchronizing with notes.
- Define your custom component in `NonCoreMediaComponents.js`.

## Step 1
### Implement a controller in your component

```javascript
const MyCustomMediaComponent = React.forwardRef((props, ref) => {

  useEffect(() => {
    const controller = {
      getState: function (dateStampRequested) {
        // Return media state that will be stored inside the stamp
        return { label: label, value: value }
      },
      setState: function (stampValue) {
        // Update the media element within your component to newState here
      }
    } 
    ref.current = controller
  }, [ref])

// Rest of the component logic goes here...
}
```
- `getState(dateStampRequested)`: Called by the application when the user wants to insert a stamp. It should return the media state that you would like to store inside the stamp e.g. `currentTime` of youtube video. `dateStampRequested` is a `Date` object which you may or may not need.

  The return value must be an object of type `{ label: String or Null, value: Any or Null }`.
  - `value` is the state of the media when the `getState()` method was called e.g. current time (in seconds) of the video media.
  - `label` is the string representation of `value` that will be displayed inside the stamp e.g. current time (in seconds) converted to a string in `hh:mm` format.

  **Important:** If either `getState()` or `value` evaluate to `null`, then the stamp insertion will be aborted. You may use this to your advantage to skip stamp insertion when certain conditions are met.
  
- `setState(stampValue)`: Called by the application when a user clicks a stamp. This method should set the state of your media to `stampValue`. `stampValue` is extracted from the stamp that was clicked and its type will be the same as that which was returned by `getState`.

## Step 2
### Define your custom media component in `NonCoreMediaComponents.js`

Add an object to the `myMediaComponents` array that describes your custom media component. The application will integrate it into its default components for you.

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



# Description
A single page React application for desktop that synchronizes your notes to media using stamps. 

- **Left pane** displays media. Currently supported media components are YouYube player, audio recorder, audio player, and PDF reader.
- **Right pane** displays a rich text editor. Press `<enter>` to insert a stamp at the start of a line. Clicking a particular stamp brings state the media back to when the stamp was inserted (e.g. timestamp for audio/video media and page number for pdf media).

# Motivation
- To build a tool that facilitates note taking and transcribing university lectures.
- To contruct an intuitive framework should you want to extend the application with your own custom media components. For example, if your university hosts lecture videos on a platform other than YouTube, you are able to implement and integrate a compatible custom component.
- To contribute to the open source software community.

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

### Algorithm
  - Keep track of 2 variables `dateWhenRecLastActive` and `dateWhenRecLastInactive`. Update them whenever the audio recorder is active (started/resumed) & inactive (paused/stopped).
  - Update the audio recording's duration, `recDuration`, each time the recorder goes inactive.
  - Mark the date, `dateNoteTaken`, whenever the user starts typing a note in the editor. The timestamp can be computed using the following computation:

  ```javascript
   if (dateWhenRecLastActive > dateWhenRecLastInactive) {
    timestamp = recDuration + (dateNoteTaken - dateWhenRecLastInactive)
  } else {
    timestamp = recDuration
  }
   ```

# How to integrate your custom media component?
- Build your custom media component as a React component with a `forward ref`.
- Within your component, implement a `controller` object and point the `ref` to it. This `controller` enables the application to communicate with your comopnent for synchronizing with notes.

## Step 1
### Custom media component example

```javascript
const MyCustomMediaComponent = React.forwardRef((props, ref) => {

  useEffect(() => {
    const controller = {
      getState: function (dateStampRequested) {
        // Return current media state to be stored inside the a new stamp here
      },
      setState: function (stampValue) {
        // Update the media element within your component to newState here
      }
    } 
    ref.current = controller
  }, [ref])
```
`getState(dateStampRequested)`: Called by the application when the user wants to insert a stamp. It should return the media state that you would like to store inside the stamp e.g. `currentTime` of youtube video. `dateStampRequested` is a `Date` object which you may or may not need.

`setState(stampValue)`: Called by the application when a user clicks a stamp. This method should set the state of your media to `stampValue`. `stampValue` is extracted from the stamp that was clicked and its type will be the same as that which was returned by `getState`.

## Step 2
### Add your component to Media.js
Add your custom component to the list of children of the `Media` component. This essentially makes the app aware of your custom component.

```javascript
const Media = React.forwardRef(({ type=null, src=null, onClose}, ref) => {
  const controller = useRef(null)
  
  useEffect(() => {
    ref.current = controller.current
  }, [ref, type, src, controller])

  return (
    <div className='media-component-container'>
      <div className='back-btn-container'>
        <BackButton handler={onClose} />
      </div>
      {type === 'my_custom_type' <MyCustomComponent ref={controller} src={src} />}
    </div>
  )
})
```
Replace `my_custom_type` with a unique identifier for your component and `MyCustomComponent` with the name of your component.

## Step 3
### Set stamp data
In this step you will implement a return value for `setStampData(dateStampRequested)` in `App`. This is where you call the `getState()` method on your controller. Its pointer is stored in `mediaRef`.

Your stamps can now hold your custom component's state, but you have to tell the app what to actually display within the stamp itself by setting a `label`. For youtube videos, the stamp `value` holds the number of seconds, but the `label` holds the value formatted to `hh:mm`.

```javascript
const setStampData = (dateStampDataRequested) => { 
    if (mediaRef.current) { // make sure the media ref is actually available  
      if (readerState.type === 'my_custom_type') {
         const my_value = mediaRef.current.getState()
         const my_label = // additional processing on value
         return { label: my_label, value: my_value }
      } else {
        return { label: null, value: null }
      }
    } else {
      return { label: null, value: null }
    }
}
```

## Step 4
### Fire the event to render your component
Example: adding a button to the navigation bar within `App.js`

``` javascript
const handleOnCClick = () => {
  setReaderState({
      type: 'my_custom_type',
      src: 'my_custom_media_source' // required if you want your component to launch with a src input
                                    // e.g. a link
  })
  setShowMedia(true)
}
```

# Install
`npm install`

`npm start`

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).



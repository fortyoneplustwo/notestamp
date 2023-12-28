# Description
A single page React application for desktop that synchronizes your notes to media using stamps. 

When writing notes to a media component, stamps will appear to the left of each line linking it to the media's current state. Click a stamp and seek the media to the requested state.
Currently supported media components are youtube video, audio player, audio recorder and pdf viewer.

# Motivation
- To build a tool that facilitates note taking and transcribing university lectures.
- To provide a framework for extending the application to synchronize with custom media components.

The latest commits have made it easier to implement custom media components. For example, if your university hosts videos on a video platform other than youtube, you can implement a media component that works with their platform and integrate it into the app.

# Goals for this project
- Features that do not necessitate an internet connection should work even when the device is offline.
- The framework for adding custom media components should balance simplicity and customizability.
- Core features must be accessible i.e. users should neither be required to install software no create an account. The app should work with what is available to most people.


# Demo
[notestamp.com](https://notestamp.com)

# Design & implementation

## UI
- **Left pane** displays the app's pages including the media component: Currently supported components are youtube player, audio recorder, audio player, and pdf viewer.
- **Right pane** displays a rich text editor that persits through the entire application: Press `<enter>` to insert a stamp then click it to seek the media to the stamp value.

Page navigation and media viewing takes place in the left pane, so its view changes frequently and experiences side effects. In contrast the right pane remains relatively stable, always displaying a text editor ready for input.

This suggests low coupling between the reader and writer. The main component acts as mediator for synchronization between the media component and the text editor.

The main component has two children: the left and right pane. The media component is attached to a `ref` defined in the main component. The other child is the text editor.

## Custom text editor (using [Slate](https://docs.slatejs.org/) framework)
I implemented a custom rich text editor that can support clickable stamps. Will probably release this as a react component at some point.

## Timestamp algorithm ##
The Recording API does not provide a query for the length of the audio being recorded, so I implemented a dynamic programming
algorithm to compute a stamp's value (in this case a timestamp) in O(1). See more details in [timestamp](https://github.com/fortyoneplustwo/timestamp)
repository (an early version of notestamp).

# How to integrate a custom component?


# Install
`npm install`

`npm start`

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).



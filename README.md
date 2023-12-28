# Description
A single page React application for desktop that synchronizes your notes to media using stamps. 

- **Left pane** displays media: Currently supported media are youtube player, audio recorder, audio player, and pdf viewer.
- **Right pane** displays a rich text editor: Press `<enter>` to insert a stamp at the start of a line. Clicking the stamp brings the media back to the state when the stamp was created.

# Demo
 Stable release hosted at [notestamp.com](https://notestamp.com).

# Motivation
- To build a tool that facilitates note taking and transcribing university lectures.
- To provide a framework for extending the application to synchronize with custom media components.
- To contribute to open source web technology.

The latest commits have made it easier to implement custom media components. For example, if your university hosts videos on a video platform other than youtube, you can implement a media component that works with their platform and integrate it into the app.

# Goals 
- Features that do not necessitate an internet connection should work even when the device is offline.
- The framework for adding custom media components should balance simplicity and customizability.
- Core features must be accessible i.e. users should neither be required to install software nor create an account to use the app.

# Implementation

## Overview
Page navigation and media viewing takes place in the left pane, so its view changes frequently and experiences side effects. In contrast the right pane remains relatively stable, always displaying a text editor ready for input. This design suggests low coupling between the two panes. The main component acts as mediator for communication between the media and the text editor.

**Stack**: React, Slate, React-PDF.

## Custom text editor
The app uses a custom rich text editor I built using [Slate](https://docs.slatejs.org/). It can support clickable timestamps next to text, but it's pretty basic right now. Ability to add lists (with bullets and timestamps) is currently in development. Collaborative editing is on the list of features to implement later on.

## Timestamp algorithm for audio recorder ##
The Media Recorder API did not have a query to capture a timestamp while recording, so
I implemented a dynamic programming algorithm to compute the timestamp in O(1). See more details in [timestamp](https://github.com/fortyoneplustwo/timestamp)
repository (an early version of notestamp).

# How to integrate a custom media component?
Write your React component and tell the main app:
1. what part of your component's state you want to be be stored in a stamp, and
2. what changes to make to your component when a stamp gets clicked.

This communication is done through a controller that you have to implement inside of your custom component. The main app has a direct pointer or `ref` to your controller.

## Controller
Include these methods in your controller object:
- `getState(optionalArgument)`
- `setState(stampValue)`

## Media Renderer
Add your custom component to the children of the `MediaRenderer` component.

## Stamp label
Your stamps can now hold your custom component's state, but you have to tell the app what to actually display within the stamp itself by setting a `label`. For examples with youtube videos, the stamp value holds the number of seconds while the stamp label holds the value formatted to `hh:mm`.




## 

## 

# Install
`npm install`

`npm start`

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).



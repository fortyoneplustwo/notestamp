# Description
A single page application for desktop that synchronizes your notes to media using stamps.

# Features
- Media reader: Youtube player, audio recorder, audio player, pdf reader. 

- Rich text editor: Press `<enter>` to insert a stamp then click it to seek the media to the stamp value.

# Demo
[notestamp.com](https://notestamp.com)

# Project goals 
- Must be lightweight and work fast.
- Although being a web app, it must reach the level of a native app experience or as close as possible.

# Design & implementation
The app is divided into two columns: a reader and a writer.
The reader handles browsing and media playing while the writer always displays a text editor for user input.
This layout remains constant throughout the entire app.

The design highlights the prime focus of this app: note taking. No matter what you are doing in the reader,
the editor is always available for input in the writer.

## Stack
- React
- [Slate](https://docs.slatejs.org/) (editor framework)
- [React-PDF](https://www.npmjs.com/package/react-pdf)

## Design pattern
According to the design, the reader's view can change frequently and experience side effects whereas the writer remains relatively stable by only displaying a text editor for input.
The design requirement suggests low coupling between the reader and writer, so I opted
to follow the mediator pattern. The main app component being the mediator while the reader and writer components are its children.

## Component hierarchy 
- Mediator: Maintains a `ref` (pointer) to the reader.
  - Reader: Attaches  `ref` to the media's component's controller
     - Media: Either youtube, audio player, audio recorder or pdf viewer.
     - Dashboard: Displays user's saved projects.
     - Login and register forms
  - Writer: Displays a rich text editor and toolbar.

## Logic 
**User presses `<enter>` inside the editor**: a callback executes in the mediator. The mediator gets the reader's state through the media controller
and returns it to the writer for stamp insertion.

**User clicks a stamp**: the writer emits a custom event to the mediator.
The mediator updates the reader's state through the media controller.

## Editor
I implemented a custom rich text editor that can support clickable stamps. Will probably release this as a react library at some point.

## Timestamp algorithm ##
The Recording API does not provide a query for the length of the audio being recorded, so I implemented a dynamic programming
algorithm to compute a stamp's value (in this case a timestamp) in O(1). See more details in [timestamp](https://github.com/fortyoneplustwo/timestamp)
repository (an early version of notestamp).

## API 
The front-end is responsible for hydrating the components with user session data. I debated using NextJS for SSR, but decided that
CSR was more approrpiate because:
- Navigation speed is much faster.
- Losing an internet connection does not 'break' the application as you can still navigate to and use the
  features that work offline.

# Takeaways
- Using `ref` for the media components was appropriate since we need to perform real time updates and data requests on these components.
- I like how unopiniated React is. It made it easy to implement and integrade a custom even emitter for a special case of child-to-parent communication.
- The mediator pattern is good to achieve low coupling and extensibility. It made it easy to add more components to the reader without breaking the writer.
- Abstracting communication with the media components using a controller has made it easy to integrate different media formats which have different stamp values.
  E.g. pdf viewer returns current page number whereas audio player returns current time.
- It might be a good idea to use a context provider to allow separation of concerns i.e. props for UI logic and context provider for user data.

# Were the project goals acheived?

Yes.

- Minimal use of ready made react components and strict use of vanilla css have kept the bundle size small.
- CSR rendering allows for fast app navigation.
- Your notes are stored in local storage. Never lose your unsaved notes since they persist even across device restarts.


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Install

`npm install`

`npm start`



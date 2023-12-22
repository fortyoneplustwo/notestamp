# Description
A single page application that synchronizes your notes to media using stamps.

# Features
- Media reader: Youtube player, audio recorder, audio player, pdf reader. 

- Rich text editor: Press `<enter>` to insert a stamp then click it to seek the media to the stamp value.

# Demo
[notestamp.com](https://notestamp.com)

# Design
The app is divided into two panes, reader on the left and writer on the right.
The reader handles browsing, navigation and playing media while the writer always displays the text editor.
This design harmonizes well with the prime focus of this app: note taking. No matter which page they are on,
the editor is always available to the user for note taking.

# Implementation

## Stack
- React
- [Slate](https://docs.slatejs.org/) (editor framework)
- [React-PDF](https://www.npmjs.com/package/react-pdf)

## Design pattern
The design requirement suggests that there should be low coupling between the reader and writer, so I opted
to follow the Mediator pattern by having the main app component as the mediator. The reader and writer components are its children.

## Implementation 
According to the design requirements, the reader's content can change frequently and experience side effects whereas the writer remains relatively stable with the only change being the editor's text content. 

### Component hierarchy ###
- Main app: Maintains a `ref` (pointer) to the reader.
  - Reader: Displays media components. `ref` from the Main app is attached to a media component's controller.
     - Media: Youtube player, audio player, audio recorder, pdf viewer.
     - Dashboard: Displays user's saved projects.
     - Login and register forms
  - Writer: Displays text editor and toolbar.

When a user presses `<enter>`, the mediator tries to obtain current state from the reader using the `ref`.
The state is returned to the editor which sets the stamp value.

When a user clicks a stamp, the writer emits a custom event to the mediator.
The mediator then updates the reader's state using `ref` and the event data.

## Timestamp algorithm ##
The Recording API does not provide a query for the length of the audio being recorded, so I implemented a dynamic programming
algorithm to compute a stamp's value (in this case a timestamp) in O(1). See more details in [timestamp](https://github.com/fortyoneplustwo/timestamp)
repository (an early version of notestamp).

### Calling the back-end API ###
The front-end is responsible for hydrating the components with user session data. I debated using a NextJS for SSR, but I decided that
CSR because:
- Navigation speed is much faster.
- Losing an internet connection does not 'break' the application as you can still navigate to the
- different components that work offline i.e. everything except youtube and dashboard components.

## Styling ##
Implemented in vanilla CSS so I could get better at CSS.

# Neat features #
- The app is free to use unless you want to create an account for cloud storage.
- Export your notes to a pdf file.
- Never lose your unsaved notes since they are stored to local storage. Yes, they persist even across device restarts.

# Updates
Currently working on displaying a user's daved project.


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Install

`npm install`

`npm start`



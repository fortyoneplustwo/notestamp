## Demo

The application is published and ready to use at https://notestamp.com

## Description

A single page web application for desktop that syncs notes with media using stamps.

**Media Display**: Left pane renders one of various media components such as YouTube Player, Sound Recorder, Audio Player, and PDF Reader.

**Text Editor:** Right pane features a rich text editor. Pressing `<Enter>` inserts a stamp at the beginning of a line.

**Stamp Functionality**: Clicking on a stamp returns the media to its state when the stamp was inserted. For audio/video media, this is the timestamp; for PDF media, it's the page number.

## Motivation

- To develop a powerful tool for efficient note-taking and reviewing of notes.
- To empower users by allowing them to implement custom functionality that fits their needs.
- To push the boundaries of what web applications can do, eventually reducing the reliance on OS-native software.
- To contribute to the open-source and developer communities.

## Stack

Vite, React, Slate, ShadCN, Tailwind.

## Custom Text-Editor

The application features a custom rich-text editor I built that automatically inserts stamps while typing.

**For developers**

I have made the standalone editor available as a [headless React library](https://github.com/fortyoneplustwo/notestamp-editor-react). It functions exactly like the one in the app.

Should you need more custom behaviour, I recommend you build your own editor using [Slate](https://docs.slatejs.org/) and extend it with my [Slate plugin](https://github.com/fortyoneplustwo/slate-stamps) which allows you to define custom stamp functionality.

## File System Access

As the back-end is still under development, I have introduced **File Sync** mode. When enabled, this mode allows the application to access and modify files within a specified directory on your local device. Saving a project downloads the files directly to the chosen folder. Projects saved in this folder are automatically detected by the app, enabling seamless opening, editing, and management.

This approach delivers a near-native user experience while remaining accessible to anyone with a web browser.

## Framework to extend the app with more media

I have designed an intuitive framework to seamlessly integrate custom media components beyond the default options. This simplifies development while allowing users with React knowledge to add their own functionality.

The framework is straightforward. It requires editing a configuration file and, at most, overriding four functions within the media component.

While the documentation is being updated, you can refer to this [tutorial](https://github.com/fortyoneplustwo/notestamp/wiki/Tutorial:-Implementing-a-custom-media-component) for a detailed walkthrough.

## Install

`npm install`

`npm start`

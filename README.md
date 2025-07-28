## Demo

The application is published and ready to use at https://notestamp.com

## Description

A Single Page Application that makes it easy to take notes in sync with media.

The left pane renders one of various media options:
YouTube Player, Sound Recorder, Audio Player, and PDF Reader. The right pane
features a rich-text editor that will automatically insert stamps which reference
the current state of the chosen media as you type.
Clicking a particular stamp returns the media back to its state when that stamp was inserted.

## Motivation

I needed a tool that could help me take better notes for my university classes.
The ones available on the market were pricey, platform-specific, and
could only sync along to a sound recorder.

## Goals

I wanted this app to enhance live note-taking, transcribing, editing, and reviewing. To
achieve this, it needed to

- be platform-agnostic,
- have a simple and straight to the point UI/UX,
- be as indescernible from native software as possible, and
- be easily extensible with new media options in the future.

## Stack

Vite, React, Slate, ShadCN, Tailwind.

## Custom Text-Editor

The core of the app relies on a text editor that can automatically insert clickable
symbols (stamps) while typing. No such UI component existed at the time, so
I built one using [Slate](https://docs.slatejs.org/), a framework for building
custom text editors.

I eventually published two libraries to help developers in need of a similar tool:

1. [notestamp-editor-react](https://github.com/fortyoneplustwo/notestamp-editor-react):
   A headless editor component for React that functions
   exactly like the one used in Notestamp.
2. [slate-stamps](https://github.com/fortyoneplustwo/slate-stamps): If you are
   building a custom text editor using Slate, this
   plugin can be used to extend it with similar stamp functionality which you can
   customize to fit your needs.

## File System Access

Using the File System Access API, I introduced **File Sync** mode which when turned on,
permits the app to read from and write to a designated directory on the user's
local device. This approach delivers a native-like UX in opening, saving and
deleting projects.

## Framework to implement additional media options

I have designed an intuitive framework to seamlessly add more media options.
This not only simplifies development for myself, but also allows users
with knowledge of programming to add their own custom functionality.

The framework is straightforward and follows React principles to reduce mental
overhead for the developer.

While the documentation is being updated, you can refer to this
[tutorial](https://github.com/fortyoneplustwo/notestamp/wiki/Tutorial:-Implementing-a-custom-media-component)
for a detailed walkthrough.

## Install

`pnpn install`

`pnpm start`

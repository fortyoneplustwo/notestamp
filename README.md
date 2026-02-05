## Notestamp

A web app that lets you take typed notes while staying perfectly synced to your media.

As you type, it auto-inserts a stamp at the start of each new line, capturing the exact moment in the media when you began that thought. Each stamp links directly to the precise state of the media (playback position, page number, etc) at the moment it was inserted.

Simply click any stamp in your notes to instantly seek the media back to that exact point.

## Demo

The application is live at https://notestamp.com

## Motivation

I personally needed a tool that could help me take better notes for my classes, however, the ones available on the market were either pricey, platform-specific, or lacking in media options. Thus, I set on to build my own tool with the following goals in mind:

- **Platform-agnostic**
Should require no installation and be accessible from any operating system.

- **User-owned data**
User data is saved onto their local device. The app should simply be a service to interact with their data in some peculiar way.

- **Extensible**
Should enable users with basic programming skills to implement their own custom media modules through an intuitive framework.

## Stack

Vite, React, Slate, ShadCN, Tailwind, Tanstack Query, Tanstack Router.

## Custom Text-Editor

The core of the app relies on a text editor that enables clickable symbols, called *stamps*, to be auto-inserted in real-time and react intuitively to text editing actions such as deleting, highlighting, copying, pasting, and general text formatting. Since no such module existed at the time, I built one on top of [Slate](https://docs.slatejs.org/), a framework for building custom text editors.

I eventually published two libraries to help developers in need of a similar tool:

1. [notestamp-editor-react](https://github.com/fortyoneplustwo/notestamp-editor-react)
A headless editor component for React that functions exactly like the one used in Notestamp.

2. [slate-stamps](https://github.com/fortyoneplustwo/slate-stamps)
If you need more custom behaviour, this plugin for Slate will extend your custom text editor with stamp functionality that can be tailored to your needs.

## Implementing a custom media module

The process is fairly simple and follows React principles to reduce mental overhead. While the documentation is being updated, you can refer to this [tutorial](https://github.com/fortyoneplustwo/notestamp/wiki/Tutorial:-Implementing-a-custom-media-component) for an example walkthrough.

## Install

`pnpm install`

`pnpm start`

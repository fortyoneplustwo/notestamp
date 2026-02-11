## Notestamp

A web app that lets you take typed notes while staying perfectly synced to your media.

As you type, it auto-inserts a stamp at the start of each new line, capturing the exact moment in the media when you began that thought. Each stamp links directly to the precise state of the media (playback position, page number, etc) at the moment it was inserted.

Simply click any stamp in your notes to instantly seek the media back to that exact point.

## Demo

The application is live at https://notestamp.com

## Install

`pnpm install`

`pnpm start`

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

The core of the app relies on a text editor that enables clickable symbols, called _stamps_, to be auto-inserted in real-time and react intuitively to text editing actions such as deleting, highlighting, copying, pasting, and general text formatting. Since no such module existed at the time, I built one on top of [Slate](https://docs.slatejs.org/), a framework for building custom text editors.

I eventually published two libraries to help developers in need of a similar tool:

1. [notestamp-editor-react](https://github.com/fortyoneplustwo/notestamp-editor-react)
   A headless editor component for React that functions exactly like the one used in Notestamp.

2. [slate-stamps](https://github.com/fortyoneplustwo/slate-stamps)
   If you need more custom behaviour, you can instead build your own text editor with Slate and use this plugin to augment it with stamp functionality that can be tailored to your needs.

## Implementing a custom media module

In case you need to sync notes with a media format that isn't currently supported, you can implement your own. A custom framework has been implemented to streamline this process with minimal mental overhead.

While the documentation is in progress, you can refer to the tutorial below.

> [!Note]
>
> - We recommend that you go through a guided tour of the app before following this tutorial.
> - This tutorial assumes that you are comfortable with React.
> - Knowledge of Tanstack Query is optional, but recommended.

### Task

We will implement a media module that displays one of three colors -- red, blue or green -- at a time and enables cycling through them at the click of a button.

As you take notes, stamps will auto-insert to reference the currently displayed color. Clicking a stamp will display the referenced color.

### Step 1: Configuration

At build time, the framework scans `src/components/MediaRenderer/media`. Each subdirectory in this location represents a media module and contains all configuration and implementation details for that module. Start by creating a directory for our module called `colors`

Configuration files provide important static data about a module at build time. Without them, the framework will not be aware of the existence of our module. Inside `colors` create a `config.js` file that exports the following object:

```javascript
const config = {
  label: "Colors", // The user-friendly name of your module
}
export default config
```

After saving your changes, you should notice a new item in the nav bar with the `label` defined in your config file

<!-- diagram -->

Clicking the item reveals 2 things:

1. The url shows the route `/colors`, the name as our module's directory. For this reason, we use single-word lowercase names for this reason.

2. You are presented with the following error screen in the left pane:
<!-- diagram -->

So far we have only made the framework _aware_ of our module. We haven't actually implemented it yet. That is what the error message is trying to tell us: that it could not find an implementation file to render our module in the left pane, hence why it is `undefined`.

Before we move on to the implementation, let's add give our module an icon.

Create another file called `icon.jsx` under `colors` and paste the following code:

```javascript
import { Palette } from "lucide-react"

const Icon = <Palette size={16} />
export default Icon
```

This is another config file that should export a React component for the icon.

Now save your changes and you should see an icon rendered inside the nav bar item.

<!-- diagram -->

### Step 2: Rendering our module

Create a file called `index.jsx` under `colors`. This file should export a React component that renders the UI for our module. Go ahead and paste the following code:

```javascript
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Toolbar } from "../../components/Toolbar"
import { RefreshCw } from "lucide-react"

const Colors = ({ ref, ...props }) => {
  const colors = [
    { label: "red", value: "#D72638" },
    { label: "blue", value: "#2979FF" },
    { label: "green", value: "#4CAF50" },
  ]
  const [colorsIndex, setColorsIndex] = useState(0)

  return (
    <div className="flex flex-col h-full">
      <Toolbar className="flex justify-end">
        <Button
          variant="ghost"
          title="Change color"
          onClick={() => setColorsIndex(i => (i + 1) % colors.length)}
        >
          <RefreshCw />
        </Button>
      </Toolbar>
      <div
        className="h-full"
        style={{ backgroundColor: `${colors[colorsIndex]?.value}` }}
      />
    </div>
  )
})

export default Colors
```

Save your changes. This time, when you click the nav bar item, it should render our component in lieu of the previous error message.

<!-- diagram -->

Verify that clicking the `Change color` button cycles through the different colors.

### Step 3: Enable synchronization with the editor

At the moment, typing inside the editor does not auto-insert stamps. We have to explicitly opt into this feature.

When such sync actions need to be performed, the framework will look for particular functions **exposed** by our module and execute them. To expose functions from inside our component, they need to be wrapped in React's [`useImperativeHandle` hook](https://react.dev/reference/react/useImperativeHandle).

#### Stamp insertion

Every time you type a new line, the editor will attempt to insert a stamp, but before it can complete this process it will ask the framework to fetch some data on its behalf: data that the stamp will reference. The framework obtains said data by calling an exposed function from our component called `getState()`. If `getState()` is not defined in our component, stamp insertion is skipped.

##### `getState(requestedAt: Date) => { label: string, value: any } | null`

This function executes with the argument `requestedAt`, which represents the precise date when the data was requested by the editor. It should return an object with the following properties:

- `value`: the precise value of the data to be referenced.
- `label`: a user-friendly string representation of `value` to be rendered inside the stamp.

> [!Note]
> You can still skip stamp insertion if `getState()` is defined by returning `null`.

In this example we want to return the current color being displayed, so add the following hook to your component.

```javascript
import { useImperativeHandle } from 'React'

// Remember to wrap inside useImperativeHandle!
useImperativeHandle(ref, () => ({
    getState: () => {
      return {
        value: colors[colorsIndex].value, // Precise color - the hex value
        label: colors[colorsIndex].label, // English word representation of value
      }
    },
  }
}), [colors, colorsIndex]) // Don't forget to declare any dependencies!
```

After saving your changes, open our module and type a few lines in the editor. You should see stamps being inserted in the editor that reference the current color. Click the `Change color` button and type a few more new lines to verify that the stamps correctly reference the displayed color.

 <!-- diagram -->

#### Define stamps' on-click handler

Clicking a stamp does nothing at the moment. Let's opt into that behavior as well.

When a stamp is clicked, the framework will look for a an exposed function called `setState()`. If this function does not exist, nothing happens.

##### `setState(value: any) => void`

This function's argument, `value`, is the precise state referenced by the stamp that was clicked -- its `value` property. (Recall that `value` was previously set by a call to `getState()`). `setState()` returns nothing, but has side-effects.

In this case the side-effect we want to achieve is to display the color referenced by `value`:

```javascript
useImperativeHandle(ref, () => ({
    getState: () => {
      return {
        label: colors[colorsIndex].label,
        value: colors[colorsIndex].value,
      }
    },
    // Set the displayed color to the stamp's value
    setState: value => {
      const index = colors.findIndex(item => item.value === value)
      setColorsIndex(index)
    },
  }
}), [colors, colorsIndex])
```

After saving your changes, try clicking a stamp. The displayed color now match to the stamp that was clicked.

### Step 4: Saving a new project

> [!Note]
> Make sure to enable File Sync for these next steps (you should be familiar with this from having taken the guided tour)

When you click on the navbar item `Colors`, it essentially starts a new project with module type `colors`.

Start a new `colors` project by clicking its respective nav bar item. You will notice that there is now a _save_ button rendered in the top-right corner. Clicking it renders the warning toast message saying "No media detected".

Just as we did in Step 3, we have to opt into the save functionality to get it working properly.

When the _save_ button is clicked, the framework will call an exposed function in our component called `getMetadata()` which should return the metadata of a project at the time of saving.

#### `getMetadata() => Metadata`

Metadata is an object who's properties contain information about a project such as its title, the date it was last modified, the state of the media at the the time of saving, etc. Whenever your module is loaded, the framework passes these properties to our component as `props`. We must return these `props` and overwrite either one of the following properties, but not both:

- `src`: if your media is sourced from the internet, you can provide a url e.g. a youtube video link.
- `mimetype`: if your media is not sourced from the internet and the its content needs to be saved to a file, you have to provide the MIME type e.g. `application/pdf`.

In this example, our media is not sourced from the internet; it is a color represented by a hex value. We'll save it a plain text file. Therefore we shall only overwrite the `mimetype` prop.

```javascript
useImperativeHandle(ref, () => ({
    getState: () => {
      return {
        label: colors[colorsIndex].label,
        value: colors[colorsIndex].value,
      }
    },
    setState: value => {
      const index = colors.findIndex(item => item.value === value)
      setColorsIndex(index)
    },
    // Set the appropriate mimetype for plain text files
    getMetadata: () => {
      return {
        ...props,
        mimetype: "text/plain"
      }
    },
  }
}), [colorsIndex, props])
```

Since our media is not sourced on the internet, we must expose one more function: `getMedia()`. The framework will call this function to fetch the media to be saved as part of the project.

#### `getMedia() => Blob`

The return value is a `Blob` object that represents the contents of your media.

> [!Important]
> If your media is sourced from the internet, you should not to define this function.

In this case, we want to return a blob made out of a string that represents the color's hex value.

```javascript
useImperativeHandle(ref, () => ({
    getState: () => {
      return {
        label: colors[colorsIndex].label,
        value: colors[colorsIndex].value,
      }
    },
    setState: value => {
      const index = colors.findIndex(item => item.value === value)
      setColorsIndex(index)
    },
    getMetadata: () => {
      return {
        ...props,
        mimetype: "text/plain"
      }
    },
    // Make a blob out of a string that represents the hex value
    getMedia: () => {
      return new Blob([colors[colorsIndex].value], {
        type: "text/plain", // must match mimetype returned from getMetadata()
      })
    },
  }
}), [colorsIndex, props])
```

Save your changes, start a new project of type `colors` and save it with the display showing green. Give it the title _Green Project_. You should see a toast confirming the successful save.

Now close the project. You should see a dashboard in the left pane that lists _Green Project_.

<!-- diagram -->

### Step 5: Open a saved project

If we try to open _Green Project_, it should render our module in the left pane, however notice that it did not display the expected media for this project: `green`. We have to handle this in our component.

Recall that every time our module is loaded, some metadata is passed to our component's `props`. When we start a new project, the metadata passed has the template of an empty project, meaning that properties such `title` or `mimetype` will be empty strings.
Conversely, when opening a saved project, the metadata passed to our component is that of the saved project. The `title` property is guaranteed to be defined.
Thus we can leverage the `title` prop to find out whether our module is loading a new project or a saved project.

A saved project always has some associated media. We usually want to render this media when the project is opened. A helper function called `fetchMediaById()` is available for exactly this purpose.

#### `fetchMediaById(id: string) => Promise<Blob>`

This function returns the media associated with a project. It takes as argument the `title` of the project. The return value is a promise that resolves to the media `Blob`.

> [!Note]
> If your module sources media from the internet, `fetchMediaById()` won't be useful, so how would you retrieve the media?
>
> **Hint**: Inspect the `props` passed to your component. See the `youtube` module's implementation for reference.

In this example, to retrieve and render _Green Project_'s associated media, we call `fetchMediaById()` using [Tanstack Query](https://tanstack.com/query/latest/docs/framework/react/overview) to leverage the prefetching and caching performed by the framework.

```javascript
import { useQuery } from "@tanstack/react-query"
import { fetchMediaById } from "@/lib/fetch/api-read"
import Loading from "@/components/Screens/Loading/Loading"

const Colors = ({ ref, ...props }) => {
  // Use Tanstack Query to retrieve the media blob from cache
  const { data: blob, isLoading: isLoading } = useQuery({
    queryFn: () => fetchMediaById(props.title),
    queryKey: ["media", props.title], // Use this query key to access the cached blob
    enabled: !!props?.title, // Disable the query if title is empty
    staleTime: Infinity,
  })

  // Create another query to parse the retrieved blob into text
  const { data: parsed, isLoading: isParsing } = useQuery({
    queryKey: ["media", "parsed", props.title],
    queryFn: async () => await blob.text(),
    enabled: !!blob, // Wait for the first query to finish!
    staleTime: Infinity,
  })

  return (
    <div className="flex flex-col h-full">
      <Toolbar className="flex justify-end">
        <Button
          size="xs"
          title="Change color"
          onClick={() => setColorsIndex(i => (i + 1) % colors.length)}
        >
          <RefreshCw />
          Change color
        </Button>
      </Toolbar>
      {/* Show a loading screen until both queries have completed */}
      {isLoading || isParsing ? (
        <Loading />
      ) : (
        <div
          className="h-full"
          style={{
            backgroundColor: `${props?.title ? parsed : colors[colorsIndex]?.value}`,
          }}
        />
      )}
    </div>
  )
}
```

Save your changes and try opening _Green Project_ again. It should render with the color green as expected.

### FAQ

- **Why do I have to manually retrieve the media in step 5? Can't it be passed with `props`?**
  Absolutely, it can! In fact, before a module is allowed to mount, the framework will have already fetched all associated project data. It even takes care of rendering a loading screen in the meantime. Passing a project's associated media to `props` is something we have considered, however, as the project is still in an experimental state, having the module explicitly retrieve the media makes the code more robust to changes in the framework. By using Tanstack Query with this process you can benefit from the framework's prefetching if it is available and fallback to explicitly fetching otherwise.

- **The code for `index.js` is fragmented by the steps in this tutorial. Can you post the entire code?**
  No. This is intentional. Piecing the code blocks together into one component will reinforce your understanding of React if not already solid. The custom framework itself is simple to use while allowing a high degree of customizability, so a good knowledge of React is required to fully take advantage of it. See the implmentation of the default modules for reference.

- **Are there other features of the custom framework not mentioned in this tutorial?**
  Yes. You can actually forward media from one module to another using the `forwardMedia()` helper function. This is common when implementing a module that only captures input, but which uses an existing module to read it post-capture. For example, when stopped, the Sound Recorder forwards the recording to the Audio Player. More information will be made available in the upcoming documentation.

- **What about error handling? Should I explicilty handle that in my module?**
  By default, any uncaught errors thrown by your module will render the error screen presented in step 2, but you are free to handle them yourself.

Happy coding!

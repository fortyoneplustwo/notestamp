## Notestamp

Take notes that remember their context -- synced to whatever you're watching, listening to, reading,
or recording.

The text editor auto-inserts a stamp at the start of each new line, capturing the exact moment in the media when you began typing. Simply click any stamp in your notes to instantly seek the media to that exact point.

## Demo

https://notestamp.com

## Install

`pnpm install`

`pnpm start`

## Motivation

I personally needed a tool that could help me take better notes for my classes, however, the ones available on the market were either pricey, platform-specific, or lacking in media options. Thus, I set on to build my own tool with the following goals in mind:

- **Platform-agnostic**

  Should require no installation and be accessible from any operating system.

- **User-owned data**

  Data is saved onto the user's device. The app should simply act as a service with which to interact with that data in some peculiar way.

- **Extensible**

  Should enable users with basic programming skills to implement their own custom media modules through an intuitive framework.

## Stack

Vite, React, Slate, ShadCN, Tailwind, Tanstack Query, Tanstack Router.

## Custom Text-Editor

The core of the app relies on a text editor that enables clickable symbols, called _stamps_, to be auto-inserted in real-time and react intuitively to text editing actions such as deleting, highlighting, copying, pasting, and general text formatting. It is built using [Slate](https://docs.slatejs.org/), a framework for building custom text editors.

Related libraries I published:

1. [notestamp-editor-react](https://github.com/fortyoneplustwo/notestamp-editor-react)

   A headless text editor component for React that functions exactly like the one used in Notestamp.

2. [slate-stamps](https://github.com/fortyoneplustwo/slate-stamps)

   Use this plugin to augment your Slate-based text editor with auto-insertion of inline elements that can be tailored to your needs.

## Implementing a custom media module

If a particular media type isn't supported by default, you can integrate it into notestamp. A custom
framework had been implemented to streamline this process with minimal mental overhead.

While the documentation is in progress, you can refer to the tutorial below.

> [!Note]
>
> - We recommend that you go through a guided tour of the app before following this tutorial.
> - The following tutorial assumes that you are comfortable with React.
> - Knowledge of Tanstack Query is optional, but recommended.

### Task

We will implement a media module that displays one of three colors -- red, blue or green -- at a time and enables cycling through them at the click of a button.

As you take notes, stamps will auto-insert to reference the currently displayed color. Clicking a stamp will display the referenced color.

### Step 1: Configuration

At build time, the framework scans `src/components/MediaRenderer/media/`. Each subdirectory in this location represents a media module and contains all of its configuration and implementation code. 

> [!Important]
> Configuration files provide important static data about a module at build time. Without them, the framework will not be aware of the existence of our module. 

Start by creating a directory for our module called `colors`.

Inside `colors/` create a `config.js` file that exports the following object:

```javascript
const config = {
  label: "Colors", // The user-friendly name of your module
}
export default config
```

After saving your changes, you should notice a new button rendered in the nav bar with the `label` defined in your config file.

<img width="898" height="46" alt="Screenshot 2026-02-11 9 48 50 AM" src="https://github.com/user-attachments/assets/c80116eb-2c74-40a9-8104-efb031118e0c" />

Clicking the button reveals 2 things:

1. The url shows the route `/colors` -- the same name as our module's directory.

2. You are presented with the following error screen in the left pane:

<img width="1920" height="1080" alt="Screenshot 2026-02-11 9 46 58 AM" src="https://github.com/user-attachments/assets/dcc54f57-dc4a-4a19-a585-62773218d992" />

By defining a config, we have only made the framework _aware_ of our module, but we haven't actually implemented it yet. That is what the error message is trying to tell us: it could not find an implementation file to render our module in the left pane, hence why it is `undefined`.

Before we move on to the implementation, let's add give our module an icon. We do so by creating another config file called `icon.jsx` that exports a React component defining the icon.

Create `icon.jsx` under `colors/` and paste the following code:

```javascript
import { Palette } from "lucide-react"

const Icon = <Palette size={16} />
export default Icon
```

Save your changes and you should see an icon rendered inside our button.

<img width="898" height="46" alt="Screenshot 2026-02-11 9 45 26 AM" src="https://github.com/user-attachments/assets/84030458-e6bd-4b79-bcf7-f9059f443354" />

### Step 2: Rendering our module

The implementation code for our module should be a React component exported from a file called `index.jsx` under `colors/`.

Create `index.jsx` and paste the following code:

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

Save your changes. This time, when you click the nav bar button, it should successfully render our component defined in `index.jsx`.

<img width="1920" height="1080" alt="Screenshot 2026-02-11 9 49 53 AM" src="https://github.com/user-attachments/assets/dad40d8e-1f40-4455-ba5b-3bbc4030156b" />

Verify you are able to cycle through the different colors by clicking `Change color`.

### Step 3: Enable synchronization with the editor

While our module is rendered, try typing inside the editor. Notice that it does not auto-insert stamps. That's because we have to explicitly opt into this feature.

To opt into sync, we need to expose certain functions from inside our component using React's [`useImperativeHandle` hook](https://react.dev/reference/react/useImperativeHandle).

#### Stamp insertion

Every time you type into an empty line, the editor will attempt to insert a stamp that holds some data. 

The operation completes successfully if the editor can call `getState()`, a function exposed from within our module component. If `getState()` is not defined or exposed, the stamp insertion is aborted.

##### `getState(requestedAt: Date) => { label: string, value: any } | null`

Executes with the argument `requestedAt` which represents the precise datetime when the data was requested by the editor. 

It should return an object with the following properties:

- `value`: the precise value of the data to be referenced.
- `label`: a user-friendly string representation of `value` to be rendered inside the stamp.

> [!Note]
> You can still skip stamp insertion if `getState()` is defined by returning `null`.

In this example we want to return the current color being displayed, so add the following hook to your component.

```javascript
import { useImperativeHandle } from 'React'

// Remember to wrap inside useImperativeHandle to expose getState()
useImperativeHandle(ref, () => ({
    getState: () => {
      return {
        value: colors[colorsIndex].value, // Precise color - the hex value
        label: colors[colorsIndex].label, // English representation of hex value
      }
    },
  }
}), [colors, colorsIndex]) // Don't forget to declare any dependencies!
```

Save your changes, open our module and type a few lines in the editor. You should now see stamps being inserted in the editor that reference the current color being displayed in the left pane. 

Click the `Change color` button and type a few more new lines to verify that the stamps correctly reference the new displayed color.

<img width="1920" height="1080" alt="Screenshot 2026-02-11 9 54 37 AM" src="https://github.com/user-attachments/assets/1bd258c8-c51e-4802-a4f4-5fea4ffb3926" />

#### Define stamps' on-click handler

Clicking a stamp does nothing at the moment. We need to opt into that behavior as well.

When a stamp is clicked, the app will call `setState()`, a function exposed from within our module. If this function does not exposed, then nothing happens.

##### `setState(value: any) => void`

This function's argument, `value`, is the precise state referenced by the stamp that was clicked i.e. its `value` property. (Recall that `value` was previously set by a call to `getState()`). `setState()` returns nothing, but we may produce side-effects.

In this case the side-effect we want to produce is to display the color referenced by `value`:

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

After saving your changes, try clicking a stamp. The displayed color now matches the stamp that was clicked.

### Step 4: Saving a new project

> [!Note]
> Make sure to enable File Sync for these next steps (you should be familiar with this from having taken the guided tour).

When you click the navbar button `Colors`, it renders an empty project with the `colors` module.

Notice that there is now a `Save` button rendered in the top-right corner. Clicking it renders the warning toast message saying "No media detected".

Again, we have to opt into the save functionality to get it working properly.

On save, the app will call an exposed function from within our module component called `getMetadata()` which should return the metadata of a project at the time of saving.

#### `getMetadata() => Metadata`

Metadata is an object who's properties contain information about a project such as its title, the date it was last modified, the state of the media at the the time of saving, etc. Whenever our module component is loaded, the framework passes it these properties through React component `props`. 

`getMetadata()` should return our module's `props` and overwrite either one of the following properties, **but not both**:

- `src`: if the module sources media from the internet, you can provide a url e.g. a youtube video link.
- `mimetype`: if the media is not sourced from the internet and the its content needs to be saved to a file, we should specify the MIME type e.g. `application/pdf`.

In this example, our media is not sourced from the internet; it is a color represented as a hex value. We'll save it a plain text file. Therefore we shall only overwrite the `mimetype` prop.

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

Because our media is not sourced on the internet, we must expose one more function: `getMedia()`. This function is called by the app to fetch the content of the media to be saved as part of the project.

#### `getMedia() => Blob`

The return value is a `Blob` object that represents the contents of the media.

> [!Important]
> If your media is sourced from the internet, you should not to define/expose this function.

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

<img width="1920" height="1080" alt="Screenshot 2026-02-11 9 58 25 AM" src="https://github.com/user-attachments/assets/b991eede-5ed3-4f4e-bb3d-b0111f8af060" />

### Step 5: Open a saved project

If we try to open _Green Project_, it should render the `colors` module with the color green i.e. the color that was being displayed when we last saved the project. However, notice that it did not display the expected color. 

We have to handle this ourselves.

Recall that every time our module is loaded, some metadata is passed to our component's `props`. When we start a new project, the metadata passed has the template of an empty project, meaning that properties such `title` or `mimetype` will be empty strings.

Conversely, when opening a saved project, the metadata passed to our component is that of the saved project. The `title` property is guaranteed to be defined, thus we can leverage the `title` prop in our module's code to differentiate between a saved project and an empty one.

When our module loads a saved project, we typically want to render its associated media. A helper function called `fetchMediaById()` is available for exactly this purpose.

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
      {/* 
        IMPORTANT: 
        In Notestamp, we do not allow the media to be changed once a project 
        has been saved. So render the toolbar only for new projects.
      */}
      {!props?.title && (
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
      )}
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

Save your changes and open _Green Project_ again. It should load the color green as expected.

### FAQ

- **Why do I have to manually retrieve the media in step 5? Can't it be passed with `props`?**

  Absolutely, it can! In fact, before a module is allowed to mount, the framework will have already fetched all associated project data. It even takes care of rendering a loading screen in the meantime. Passing a project's associated media to `props` is something we have considered, however, as the project is still in an experimental state, having the module explicitly retrieve the media makes the code more robust to future changes. By using Tanstack Query with this process you can benefit from the framework's prefetching if it is available or otherwise fallback to explicit fetching.

- **The code for `index.js` is fragmented throughout the steps in this tutorial. Can you post the end result?**

  No. This is intentional. Piecing the code blocks together will solidify your understanding of the framework. The framework itself is simple to use while allowing a high degree of customizability, but a good understanding is required to fully take advantage of it. See the implmentation of the default modules for reference.

- **Are there other features of the custom framework not mentioned in this tutorial?**

  Yes. You can actually forward media from one module to another using the `forwardMedia()` helper function. This is common when implementing a module that only captures media as input, but which uses an existing module to read/display it post-capture. For example, when stopped, the Sound Recorder forwards the recorded audio to the Audio Player. More information will be made available in the upcoming documentation.

- **Should I explicilty handle errors in my module?**

  By default, any uncaught errors thrown by your module will render the error screen presented in step 2, but you are free to handle them yourself.

Happy coding!

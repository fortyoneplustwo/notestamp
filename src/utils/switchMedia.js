export let shouldForwardMedia = false

export const invalidateForward = () => {
  shouldForwardMedia = false
}

export const mediaToForward = {
  src: "",
  mimetype: "",
}

export const setMediaToForward = ({ src, mimetype }) => {
  mediaToForward.src = src
  mediaToForward.mimetype = mimetype

  shouldForwardMedia = true
}

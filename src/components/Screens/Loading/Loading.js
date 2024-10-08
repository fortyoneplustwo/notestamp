const Loading = ({ loading, children }) => {
  <>
    {loading ? (
      <p>Loading...</p>
    ) : (
      { children }
    )}
  </>
}

export default Loading

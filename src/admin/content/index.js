function Content({contentTypes}) {
  return (
    <>
    <h2>Hello, content</h2>
    <p>The following types are available:</p>
    <ul>
    { contentTypes.length > 0 ? contentTypes.map((type, i) => {
      return (<li key={`type:${i}`}>{ type }</li>)
    }) : 'None'
    }
    </ul>
    </>
  );
}

export default Content

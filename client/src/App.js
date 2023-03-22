

function App() {
  async function handleGet(){
    await fetch("http://localhost:4000/get", {
      method: "GET",
      headers: {
      },
    }).then((response) => {
        
        return response.json();
      })
      .then((data) => {
        console.log(data);
      });
  }
  return (
    <div >
      <button onClick={handleGet}>get</button>
    </div>
  );
}

export default App;

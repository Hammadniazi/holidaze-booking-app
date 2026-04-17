function App() {
  const env = import.meta.env.VITE_API_KEY;
  console.log(env);
  return (
    <div>
      <h1 className="bg-amber-300 text-center">Holidaze</h1>
    </div>
  );
}

export default App;

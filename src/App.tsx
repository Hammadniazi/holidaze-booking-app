import { RouterProvider } from "@tanstack/react-router";
import { router } from "./routes";

function App() {
  const env = import.meta.env.VITE_API_KEY;
  console.log(env);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;

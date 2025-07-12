import Layout from './components/Layout';
import AppRoutes from "./routes/AppRoutes";

if(import.meta.env.VITE_DEBUG==="0"){
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};
}

function App() {
  return (
      <Layout>
        <AppRoutes />
      </Layout>
  );
}

export default App;

import { Layout } from "../components/Layout/Layout";
import { Vision } from "../components/Vision/Vision";
import { Provider as LoginProvider } from "components/Login/Context";

export default function Home() {
  return (
    <LoginProvider>
      <Layout>
        <Vision />
      </Layout>
    </LoginProvider>
  );
}
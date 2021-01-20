import dynamic from "next/dynamic";
import { Layout } from "../components";

const MapWithNoSSR = dynamic(() => import("../components/Map/Map.jsx"), {
  ssr: false,
});

function AdvocacyMap() {
  return (
    <Layout pageTitle="Advocacy Maps">
      <MapWithNoSSR />
    </Layout>
  );
}

export default AdvocacyMap;

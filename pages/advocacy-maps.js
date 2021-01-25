import dynamic from "next/dynamic";
import { Layout } from "../components";

const MapWithNoSSR = dynamic(() => import("../components/Map/Map.jsx"), {
  ssr: false
});

function AdvocacyMap() {
  const house_sheet =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4l7bRcBIgwsEPGM_s9zF9csIeTgE2No_4tA6MuDCBUbfmWY_e9mAfzPpCJTsIK_hUzOyJ8CmdGMsX/pub?gid=641305740&single=true&output=csv";
  return (
    <Layout pageTitle="Advocacy Maps">
      <MapWithNoSSR url={house_sheet} />
    </Layout>
  );
}

export default AdvocacyMap;

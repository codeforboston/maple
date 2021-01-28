import dynamic from "next/dynamic";
import { Layout } from "../components";
import GoogleForm from "../components/GoogleForm/GoogleForm";

const MapWithNoSSR = dynamic(() => import("../components/Map/Map.jsx"), {
  ssr: false,
});

function AdvocacyMap() {
  return (
    <Layout pageTitle="Advocacy Maps">
      <MapWithNoSSR />
      <GoogleForm 
        header="Sample Form"
        blurb="sample blurb"
        url={"https://docs.google.com/forms/d/e/1FAIpQLSdqd_mLfxBMJ6-rtzNddxhrL4W0Hoa5_ZDaREMyFwmo8C9lKg/viewform?embedded=true"} 
        width="500px" 
        height="500px"/>
    </Layout>
  );
}

export default AdvocacyMap;

import { useRouter } from "next/router"
import { Container, Row, Col } from "../components/bootstrap"
import { createPage } from "../components/page"
import { LabeledIcon, TitledSectionCard } from "../components/shared"

export default createPage({
  title: "Public Profile",
  Page: () => {
    const router = useRouter(),
      id = router.query.id,
      billId = typeof id === "string" ? id : null

    
    return (
      <Container>
        <div className="border border-3 border-secondary col-4 m-auto d-grid gap-1">
          <LabeledIcon
            idImage="leaf-asset.png"
            mainText="headline text"
            subText="subhead"
          ></LabeledIcon>
          <LabeledIcon
            idImage="bldg-64-gra.png"
            mainText="headline text"
            subText="subhead"
          ></LabeledIcon>
          <LabeledIcon
            idImage="codeforbostonicon.png"
            mainText="headline text"
            subText="subhead"
          ></LabeledIcon>
          <LabeledIcon
            idImage="ma_state_house.jpg"
            mainText="headline text"
            subText="subhead"
          ></LabeledIcon>
        </div>
        <TitledSectionCard title="Titled Section" bug={<div className="h-100 w-100">cornercorner</div>} footer={<></>}>Generating long and coherent text is an important but challenging task, particularly for open-ended language generation tasks such as story generation. Despite the success in modeling intra-sentence coherence, existing generation models (e.g., BART) still struggle to maintain a coherent event sequence throughout the generated text. We conjecture that this is because of the difficulty for the decoder to capture the high-level semantics and discourse structures in the context beyond token-level co-occurrence. In this paper, we propose a long text generation model, which can represent the prefix sentences at sentence level and discourse level in the decoding process. To this end, we propose two pretraining objectives to learn the representations by predicting inter-sentence semantic similarity and distinguishing between normal and shuffled sentence orders. Extensive experiments show that our model can generate more coherent texts than state-of-the-art baselines. </TitledSectionCard>
      </Container>
    )
  }
})

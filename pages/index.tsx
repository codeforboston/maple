import React from "react"
import AboutSection from "../components/AboutSection/AboutSection"
import { useAuth } from "../components/auth"
import { HearingsScheduled } from "../components/HearingsScheduled/HearingsScheduled"
import HeroHeader from "../components/HeroHeader/HeroHeader"
import Leaf from "../components/Leaf/Leaf"
import HearingsLeaf from "../components/Leaf/HearingsLeaf"
import { createPage } from "../components/page"
import TestimonyCalloutSection from "../components/TestimonyCallout/TestimonyCalloutSection"

export default createPage({
  Page: () => {
    const { authenticated } = useAuth()

    return (
      <div className="overflow-hidden whitebackground">
        <HeroHeader authenticated={authenticated} />

        <Leaf direction="right" />

        <TestimonyCalloutSection />

        <Leaf direction="left" />

        <AboutSection />

        <HearingsLeaf />

        <HearingsScheduled />
      </div>
    )
  }
})

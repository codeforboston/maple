import React from "react"
import AboutSection from "../components/AboutSection/AboutSection"
import { useAuth } from "../components/auth"
import { Button, Col, Container, Row } from "../components/bootstrap"
import HeroHeader from "../components/HeroHeader/HeroHeader"
import Leaf from "../components/Leaf/Leaf"
import { Wrap } from "../components/links"
import { createPage } from "../components/page"
import TestimonyCalloutSection from "../components/TestimonyCallout/TestimonyCalloutSection"
import ViewBillsOnHomePage from "../components/ViewBillsOnHomePage/ViewBillsOnHomePage"
import Testimonies from "../components/TestimoniesOnHomePage/TestimoniesOnHomePage"

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
      </div>
    )
  }
})

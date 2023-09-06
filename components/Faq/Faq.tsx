import { FaqContent } from "./FaqContent"
import { Button, Stack, Container, Image, Row, Col } from "react-bootstrap"
import { ButtonHTMLAttributes, useEffect, useState, useRef } from "react"
import style from "./Faq.module.css"
import Router from "next/router"

const faqs = ["faq"] as const
export type Faq = (typeof faqs)[number]

export default function PolicyPage({ faq = "faq" }: { faq?: Faq }) {
  const handleOnClick = (f: Faq) => {
    Router.push(`/${f}`)
  }

  return (
    <Container fluid className={style.policyContent}>
      <FaqContent faq={faq} />
    </Container>
  )
}

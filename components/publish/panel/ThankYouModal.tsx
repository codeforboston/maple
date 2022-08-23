import { useCallback, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { Image, Modal } from "../../bootstrap"
import { useAppDispatch } from "../../hooks"
import { usePublishState } from "../hooks"
import { setShowThankYou } from "../redux"

const modalDurationMs = 2000

export const ThankYouModal = styled(({ ...rest }) => {
  const show = usePublishState().showThankYou
  const dispatch = useAppDispatch()
  const timeout = useRef<number>(-1)
  const hide = useCallback(() => {
    dispatch(setShowThankYou(false))
    clearTimeout(timeout.current)
  }, [dispatch])
  const [focused, setFocused] = useState<undefined | boolean>()

  useEffect(() => {
    if (focused === undefined) setFocused(document.hasFocus())
    else if (focused === false) clearTimeout(timeout.current)
  }, [focused])

  useEffect(() => {
    const onFocusChange = () => setFocused(document.hasFocus())
    window.addEventListener("focus", onFocusChange)
    window.addEventListener("blur", onFocusChange)
    return () => {
      window.removeEventListener("focus", onFocusChange)
      window.removeEventListener("blur", onFocusChange)
    }
  }, [])

  useEffect(() => {
    if (show && focused) {
      timeout.current = setTimeout(hide, modalDurationMs) as any
    }
  }, [focused, hide, show])

  return (
    <Modal show={show} onHide={hide} centered {...rest}>
      <Modal.Body className=" d-flex align-items-center">
        <Image alt="" src="leaf-bundle.png" className="leaves-ul" />
        <Image alt="" src="leaf-bundle.png" className="leaves-br" />
        <div className="thank-you">Thank You For Submitting Testimony!</div>
        <Image alt="" src="bill-thank-you.svg" />
      </Modal.Body>
    </Modal>
  )
})`
  .leaves-ul,
  .leaves-br {
    position: absolute;
    width: 8rem;
    height: 8rem;
  }

  .leaves-ul {
    left: -2rem;
    top: -3rem;
  }

  .leaves-br {
    right: -2rem;
    bottom: -3rem;
    transform: scale(-1, -1);
  }

  .modal-body {
    padding: 2rem 2rem 2rem 3rem;
  }

  .modal-content {
    background-color: var(--bs-blue);
    border-radius: 1rem;
    color: white;
  }

  .thank-you {
    font-weight: bold;
    font-size: 1.25rem;
    font-family: "Nunito";
  }
`

import { useTranslation } from "next-i18next"
import Router from "next/router"
import { FC, useEffect } from "react"
import { Alert, Spinner } from "react-bootstrap"
import styled from "styled-components"

type DataError = { message?: string; [k: string]: any }

type PageDataResult<T> = {
  data?: T
  error?: DataError
}

export const LoadingPage = <Data,>({
  result,
  Page
}: {
  result: PageDataResult<Data>
  Page: FC<React.PropsWithChildren<Data>>
}) => {
  if (result.data) return <Page {...result.data} />
  if (result.error) return <Error error={result.error} />
  return <Loading />
}

const Error: FC<React.PropsWithChildren<{ error: DataError }>> = ({
  error
}) => {
  const { t } = useTranslation("common")
  useEffect(() => console.error("Error loading page", error), [error])
  let message = t("loading.error.message")
  if (error.message) message = `${message} ${error.message}`
  return (
    <Container>
      <Alert variant="danger">
        <div>{message}</div>
        <div>
          <Alert.Link onClick={() => Router.reload()}>
            {t("loading.reload")}
          </Alert.Link>
        </div>
      </Alert>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  padding-top: 5rem;
`

export const Loading = () => (
  <Container>
    <Spinner animation="border" />
  </Container>
)

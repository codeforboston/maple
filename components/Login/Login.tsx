import { useForm } from "react-hook-form"
import { useRouter } from "next/router"
import {
  useSignInWithEmailAndPassword,
  SignInWithEmailAndPasswordData
} from "../auth/hooks"
import {
  Form,
  Stack,
  Button,
  Alert,
  Container,
  Row,
  Col,
  Card
} from "../bootstrap"
import Input from "../forms/Input"
import PasswordInput from "../forms/PasswordInput"
import { useTranslation } from "next-i18next"
import { LoadingButton } from "../buttons"
import SocialSignOnButtons from "components/auth/SocialSignOnButtons"
import Divider from "../Divider/Divider"

export default function Login() {
  const router = useRouter()
  const redirect = (router.query.redirect as string) || "/"
  const { t } = useTranslation("auth")

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignInWithEmailAndPasswordData>()

  const signIn = useSignInWithEmailAndPassword()

  const success = () => {
    const safeRedirect = redirect.startsWith("/") ? redirect : "/"
    router.replace(safeRedirect)
  }
  const onSubmit = handleSubmit(credentials => {
    signIn.execute(credentials).then(success)
  })

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card className="p-4 shadow-lg">
            <h2 className="text-center mb-4">{t("signInToAccess")}</h2>

            <Form onSubmit={onSubmit} noValidate>
              {signIn.error && (
                <Alert variant="danger">{signIn.error.message}</Alert>
              )}

              <Stack gap={3}>
                <Input
                  label={t("email")}
                  type="email"
                  {...register("email", {
                    required: t("emailIsRequired") ?? "Email is required"
                  })}
                  error={errors.email?.message}
                />

                <PasswordInput
                  label={t("password")}
                  {...register("password", {
                    required: t("passwordRequired") ?? "Password is required"
                  })}
                  error={errors.password?.message}
                />

                <LoadingButton
                  type="submit"
                  className="w-100"
                  loading={signIn.loading}
                >
                  {t("signIn")}
                </LoadingButton>

                <Divider className="px-4">{t("or")}</Divider>

                <SocialSignOnButtons
                  onComplete={() => router.replace(redirect)}
                />
              </Stack>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

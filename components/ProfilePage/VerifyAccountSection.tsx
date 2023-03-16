import { useSendEmailVerification } from "components/auth/hooks"
import { TitledSectionCard } from "components/shared"
import { Alert } from "react-bootstrap"
import { User } from "firebase/auth"
import { LoadingButton } from "components/buttons"

export const VerifyAccountSection = ({ user }: { user: User }) => {
    const sendEmailVerification = useSendEmailVerification()
  
    return (
      <TitledSectionCard title={"Verify Your Account"} className="col">
        <div className="px-5 pt-2 pb-4">
          <p className="fw-bold text-info">
            We sent a link to your email to verify your account, but you haven't
            clicked it yet. If you don't see it, be sure to check your spam
            folder.
          </p>
  
          {sendEmailVerification.status === "success" ? (
            <Alert variant="success">Check your email!</Alert>
          ) : null}
  
          {sendEmailVerification.status === "error" ? (
            <Alert variant="danger">{sendEmailVerification.error?.message}</Alert>
          ) : null}
  
          {sendEmailVerification.status !== "success" ? (
            <LoadingButton
              variant="info"
              className="text-white"
              loading={sendEmailVerification.loading}
              onClick={() => sendEmailVerification.execute(user)}
            >
              Send Another Link
            </LoadingButton>
          ) : null}
        </div>
      </TitledSectionCard>
    )
  }
  
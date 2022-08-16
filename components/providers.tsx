import { SSRProvider as AriaSSRProvider } from "@react-aria/ssr"
import { Provider as Auth } from "../components/auth"
import { SSRProvider as BootstrapSSRProvider } from "../components/bootstrap"
import { Provider as Profile } from "./db/profile/service"
import { Provider as Search } from "./search"
import { ServiceProvider } from "./service"
import { Provider as Redux } from "./store"

const providers = [Redux, Auth, Profile, Search]

export const Providers: React.FC = ({ children }) => (
  <AriaSSRProvider>
    <BootstrapSSRProvider>
      <ServiceProvider providers={providers}>{children}</ServiceProvider>
    </BootstrapSSRProvider>
  </AriaSSRProvider>
)

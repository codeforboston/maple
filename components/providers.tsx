import { SSRProvider as AriaSSRProvider } from "@react-aria/ssr"
import { AuthProvider } from "../components/auth"
import { SSRProvider as BootstrapSSRProvider } from "../components/bootstrap"
import { ServiceProvider } from "./service"
import { Provider as Search } from "./search"

const services = [AuthProvider, Search]

export const Providers: React.FC<{ children: React.ReactElement }> = ({
  children
}) => (
  <AriaSSRProvider>
    <BootstrapSSRProvider>
      <ServiceProvider providers={services}>{children}</ServiceProvider>
    </BootstrapSSRProvider>
  </AriaSSRProvider>
)

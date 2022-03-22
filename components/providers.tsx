import { AuthProvider } from "../components/auth"
import { SSRProvider } from "../components/bootstrap"
import { ServiceProvider } from "./service"
import { Provider as Search } from "./search"

const services = [AuthProvider, Search]

export const Providers: React.FC<{ children: React.ReactElement }> = ({
  children
}) => (
  <SSRProvider>
    <ServiceProvider providers={services}>{children}</ServiceProvider>
  </SSRProvider>
)

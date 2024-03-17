import { QueryClient, QueryClientProvider } from "react-query"
import { Provider as Auth } from "../components/auth"
import { Provider as Profile } from "./db/profile/service"
import { Provider as Firebase } from "./firebase"
import { LogRocketProvider as LogRocket } from "./logRocket"
import { Provider as Search } from "./search"
import { ServiceProvider } from "./service"

const providers = [Firebase, Auth, Profile, Search, LogRocket]

const queryClient = new QueryClient()

export const Providers: React.FC<React.PropsWithChildren<unknown>> = ({
  children
}) => (
  <QueryClientProvider client={queryClient}>
    <ServiceProvider providers={providers}>{children}</ServiceProvider>
  </QueryClientProvider>
)

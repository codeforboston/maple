import { Admin } from "react-admin";
import { TestDataProvider } from "components/server-api";


const dataprovider = TestDataProvider()
const AdminDashboard = () => <Admin dataProvider={dataprovider} />;

export default AdminDashboard
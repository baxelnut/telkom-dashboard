import { Helmet } from "react-helmet-async";
// Style
import "./PageNotFound.css";
// Components
import Button from "../components/ui/buttons/Button";

export default function PageNotFound() {
  return (
    <div className="page-not-found">
      <Helmet>
        <title>404 | Page Not Found</title>
        <meta
          name="description"
          content="The page you are looking for does not exist or has been moved. Please check the URL or return to the dashboard."
        />
      </Helmet>

      <h1 className="title">Oops!</h1>
      <h5>404 | Page Not Found</h5>
      <p>We can't seem to find the page you are looking for!</p>
      <Button text="Back to Dashboard" to="/overview" arrow iconAfter />
    </div>
  );
}

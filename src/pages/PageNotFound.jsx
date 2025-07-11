// Style
import "./PageNotFound.css";
// Components
import Button from "../components/ui/buttons/Button";

export default function PageNotFound() {
  return (
    <div className="page-not-found">
      <h1 className="title">Oops!</h1>
      <h5>404 | Page Not Found</h5>
      <p>We can't seem to find the page you are looking for!</p>
      <Button text="Back to Dashboard" arrow to="/overview" />
    </div>
  );
}

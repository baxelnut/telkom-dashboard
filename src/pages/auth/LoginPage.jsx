// Style
import "./LoginPage.css";
// Components
import Button from "../../components/ui/buttons/Button";
import InputField from "../../components/ui/input/InputField";
// Data
import { SVG_PATHS } from "../../data/utilData";

export default function LoginPage() {
  return (
    <div className="login-page">
      <p>Login Page</p>
      <Button text="Login" />
      <InputField placeholder="test" />

      <InputField placeholder="test 2" type="password" obscurial />
    </div>
  );
}

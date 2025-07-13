import { useState } from "react";
// Style
import "./Checkbox.css";

export default function Checkbox({
  label,
  onChange,
  reverse = false,
  checked: controlledChecked, // optional controlled prop
}) {
  const [internalChecked, setInternalChecked] = useState(false);

  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  const handleChange = (e) => {
    const value = e.target.checked;
    if (!isControlled) setInternalChecked(value);
    onChange?.(value); // push to parent
  };

  return (
    <label className="checkbox">
      {reverse && <span dangerouslySetInnerHTML={{ __html: label }} />}
      <input type="checkbox" checked={checked} onChange={handleChange} />
      {!reverse && <span dangerouslySetInnerHTML={{ __html: label }} />}
    </label>
  );
}

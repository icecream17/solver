import { jsx } from "snabbdom";

const IconButton = ({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) => (
  <button
    class={{"icon-button": true}}
    type="button"
    on={{ click: onClick }}
    aria-label={label}
    title={label}
  >
    <i class={{[`icon-${icon}`]: true}}></i>
  </button>
);

export default IconButton;

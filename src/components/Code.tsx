import { RenderElementProps } from "slate-react";
import classes from "./Code.module.css"

export default function Code(props: RenderElementProps) {
  return (
    <span>
      <code
        className={classes.inlineCode}
      >
        {props.children}
      </code>
    </span>
  );
};
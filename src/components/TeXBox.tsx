import { RenderElementProps, useSelected, useSlate } from "slate-react";
import Toolbar from "../interface/Toolbar";
import FormatButton from "./FormatButton";
import ToggleLinkButton from "./ToggleLinkButton";
import MathButton from "./MathButton";
import CodeButton from "./CodeButton";
import BlockButton from "./BlockButton";
import TextCard from "../interface/TextCard";
import Paragraph from "../interface/Paragraph";
import HoveringWindow from "../interface/HoveringWindow";
import Bookmark from "./Bookmark";
import { Editor, Transforms } from "slate";

export default function TeXBox(props: RenderElementProps): JSX.Element {
  const isSelected: boolean = useSelected();
  const editor: Editor = useSlate();

  return (
    <TextCard>
      <>
        {isSelected ? <Toolbar>
          <FormatButton mark="bold" />
          <FormatButton mark="italic" />
          <FormatButton mark="roman" />
          <FormatButton mark="underline" />
          <FormatButton mark="strikethru" />
          <CodeButton />
          <BlockButton blockType="code-block" />
          <BlockButton blockType="quote" />
          <BlockButton blockType="heading" />
          <ToggleLinkButton />
          <MathButton inline />
          <MathButton />
        </Toolbar> : null}
        <Paragraph attributes={props.attributes}>
          {props.children}
        </Paragraph>
      </>
    </TextCard>
  );
};
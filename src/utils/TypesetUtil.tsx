import { Editor, Text, Element, Transforms, Range } from "slate";
import { LinkElem, MathElem } from "./CustomSlateTypes";
import { Children } from "react";

export const TypesetUtil = {
  isMarkActive: (editor: Editor, mark: keyof Omit<Text, "text">) => {
    const marks: Omit<Text, "text"> | null = Editor.marks(editor);
    return marks ? marks[mark] === true : false;
  },

  toggleMark: (editor: Editor, mark: keyof Omit<Text, "text">) => {
    if (mark === "roman") {
      Editor.removeMark(editor, "bold");
      Editor.removeMark(editor, "italic");
    } else {
      if (TypesetUtil.isMarkActive(editor, mark)) {
        Editor.removeMark(editor, mark);
      } else {
        Editor.addMark(editor, mark, true);
      }
    }
  },

  isBlockActive: (editor: Editor, blockType: string) => {
    const { selection } = editor;
    if (!!selection) {
      // If a selection exists, we check if it contains any block with the matching type.
      const [matchingBlock] = Array.from(
        Editor.nodes(editor, {
          at: Editor.unhangRange(editor, selection),
          match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === blockType,
        })
      );
      return !!matchingBlock;
    }
    return false;
  },

  toggleBlock: (editor: Editor, blockType: string) => {
    const { selection } = editor;
    if (!!selection && Range.isCollapsed(selection)) {
      Transforms.insertNodes(editor, {
        type: blockType,
        children: [{ text: "" }],
      });
    } else {
      let newProperties: Partial<Element>;
      if (TypesetUtil.isBlockActive(editor, blockType)) {
        newProperties = {
          type: "paragraph",
        };
      } else {
        newProperties = {
          type: blockType,
        };
      }
      Transforms.setNodes(editor, newProperties);
    }
  },

  toggleCodeBlock: (editor: Editor) => {
    Transforms.setNodes<Element>(
      editor,
      { type: "code-block" },
    )
  },

  /**
   * Checks whether the current selection contains an active inline element.
   * 
   * @param editor The editor that is currently being focused.
   * @param inlineType The type of the inline element to check for.
   * @returns Returns true if the array of matching inline element found within
   *          the current selection is non-empty.
   */
  isInlineActive: (editor: Editor, inlineType: string) => {
    const [inline] = Editor.nodes(editor, {
      match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === inlineType,
    });
    return !!inline;
  },

  /**
   * Detect any inline elements within the current selection and unwrap them
   * into normal texts.
   * 
   * @param editor The editor that is currently being focused
   * @param inlineType The type of inline element to search for.
   */
  unwrapInline: (editor: Editor, inlineType: string) => {
    Transforms.unwrapNodes(editor, {
      match: n =>
        !Editor.isEditor(n) && Element.isElement(n) && n.type === inlineType,
    })
  },

  wrapLink: (editor: Editor, linkUrl: string) => {
    if (TypesetUtil.isInlineActive(editor, "link")) {
      TypesetUtil.unwrapInline(editor, "link");
    }
    const { selection } = editor;
    if (!!selection && Range.isCollapsed(selection)) {
      // If the current selection is empty, insert a new link.
      Transforms.insertNodes(editor, {
        type: "link",
        url: linkUrl,
        children: [{ text: linkUrl }],
      });
    } else {
      // Otherwise, append the url to the currently selected texts.
      Transforms.wrapNodes(editor, {
        type: "link",
        url: linkUrl,
        children: [],
      }, { split: true });
      Transforms.collapse(editor, { edge: "end" });
    }
  },

  toggleLink: (editor: Editor) => {
    if (!TypesetUtil.isInlineActive(editor, "link")) {
      const url = window.prompt("Enter the URL of the link:");
      if (!!url && !!editor.selection) {
        TypesetUtil.wrapLink(editor, url);
      }
    } else {
      Transforms.unwrapNodes(editor, {
        match: n =>
          !Editor.isEditor(n) && Element.isElement(n) && n.type === "link",
      });
    }
  },

  toggleCode: (editor: Editor, isInline: boolean) => {
    if (!TypesetUtil.isInlineActive(editor, "code")) {
      if (!!editor.selection) {
        const { selection } = editor;
        if (!!selection && Range.isCollapsed(selection)) {
          Transforms.insertNodes(editor, {
            type: "code",
            inline: isInline ? true : undefined,
            children: [{ text: "" }],
          });
        } else {
          Transforms.wrapNodes(editor, {
            type: "code",
            inline: isInline ? true : undefined,
            children: [],
          }, { split: true });
          Transforms.collapse(editor, { edge: "end" });
        }
      }
    } else {
      Transforms.unwrapNodes(editor, {
        match: n =>
          !Editor.isEditor(n) && Element.isElement(n) && n.type === "code",
      });
    }
  },

  toggleMath: (editor: Editor, isInline: boolean) => {
    if (!TypesetUtil.isInlineActive(editor, "math")) {
      if (!!editor.selection) {
        const { selection } = editor;
        if (!!selection && Range.isCollapsed(selection)) {
          const math: MathElem = {
            type: "math",
            inline: isInline,
            children: [{
              text: isInline ? "$$" : "",
            }],
          };
          Transforms.insertNodes(editor, math);
          if (isInline) {
            Transforms.move(editor, { distance: 1, unit: "offset", reverse: true });
          }
        }
        // Wrapping is to be implemented.
        /* else {
          Transforms.wrapNodes(editor, {
            type: "math",
            children: [],
          }, { split: true });
          Transforms.collapse(editor, { edge: "end" });
        } */
      }
    } else {
      Transforms.unwrapNodes(editor, {
        match: n =>
          !Editor.isEditor(n) && Element.isElement(n) && n.type === "math",
      });
    }
  },
};
﻿import * as ts from "typescript";
import CodeBlockWriter from "code-block-writer";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {BodiedNodeStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";
import {setBodyTextForNode} from "./helpers/setBodyTextForNode";

export type BodiedNodeExtensionType = Node<ts.Node>;

export interface BodiedNode {
    /**
     * Gets the body.
     */
    getBody(): Node;
    /**
     * Sets the body text.
     * @param writerFunction - Function for using a writer to write out the body text.
     */
    setBodyText(writerFunction: (writer: CodeBlockWriter) => void): this;
    /**
     * Sets the body text.
     * @param text - Text to set as the body.
     */
    setBodyText(text: string): this;
}

export function BodiedNode<T extends Constructor<BodiedNodeExtensionType>>(Base: T): Constructor<BodiedNode> & T {
    return class extends Base implements BodiedNode {
        getBody() {
            const body = (this.compilerNode as any).body as ts.Node;
            if (body == null)
                throw new errors.InvalidOperationError("Bodied node should have a body.");

            return this.global.compilerFactory.getNodeFromCompilerNode(body, this.sourceFile);
        }

        setBodyText(writerFunction: (writer: CodeBlockWriter) => void): this;
        setBodyText(text: string): this;
        setBodyText(textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)): this;
        setBodyText(textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
            const body = this.getBody();
            setBodyTextForNode(body, textOrWriterFunction);
            return this;
        }

        fill(structure: Partial<BodiedNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.bodyText != null)
                this.setBodyText(structure.bodyText);

            return this;
        }
    };
}

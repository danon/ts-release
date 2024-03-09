import {
  type ImportDeclaration,
  isImportDeclaration,
  type Node,
  type SourceFile,
  type StringLiteral,
  type TransformationContext,
  type Transformer,
  visitEachChild,
  visitNode,
} from "typescript";

export function updateImport(context: TransformationContext): Transformer<SourceFile> {
  return function (sourceFile: SourceFile): SourceFile {
    return visitNode(sourceFile, visit) as SourceFile;
  };

  function visit(node: Node): Node {
    const child: Node = visitEachChild(node, visit, context);
    if (isImportDeclaration(child)) {
      return updatedImportDeclaration(child);
    }
    return child;
  }

  function updatedImportDeclaration(child: ImportDeclaration): ImportDeclaration {
    const specifier = child.moduleSpecifier as StringLiteral;
    return context.factory.updateImportDeclaration(
      child,
      child.modifiers,
      child.importClause,
      context.factory.createStringLiteral(jsExtension(specifier.text)),
      child.attributes);
  }

  function jsExtension(text: string): string {
    return text.replace(/\.ts$/, '.js');
  }
}

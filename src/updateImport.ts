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

  function updatedImportDeclaration(decl: ImportDeclaration): ImportDeclaration {
    const specifier = decl.moduleSpecifier as StringLiteral;
    return context.factory.updateImportDeclaration(
      decl,
      decl.modifiers,
      decl.importClause,
      context.factory.createStringLiteral(jsExtension(specifier.text)),
      decl.attributes);
  }

  function jsExtension(scriptName: string): string {
    return scriptName.replace(/\.ts$/, '.js');
  }
}

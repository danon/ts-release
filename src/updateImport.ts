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
    function visit(node: Node): Node {
      const child = visitEachChild(node, visit, context) as ImportDeclaration;

      if (isImportDeclaration(child)) {
        return context.factory.updateImportDeclaration(
          child,
          child.modifiers,
          child.importClause,
          context.factory.createStringLiteral(map((child.moduleSpecifier as StringLiteral).text)),
          child.attributes,
        );
      }

      return child;
    }

    return visitNode(sourceFile, visit) as SourceFile;
  };
}

function map(text: string): string {
  return text.replace(/\.ts$/, '.js');
}

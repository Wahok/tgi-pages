import { MathJson, MathJsonLogicalOperator } from "./../MathJson";

export function useMathPrinting() {
  const mathJsonOperatorMap = new Map<MathJsonLogicalOperator, string>([
    ["not", "\\neg"],
    ["implies", "\\implies"],
    ["and", "\\land"],
    ["or", "\\lor"],
    ["xor", "\\mathbin{\\mathtt{xor}}"],
    ["nand", "\\mathbin{\\mathtt{nand}}"],
    ["nor", "\\mathbin{\\mathtt{nor}}"],
    ["equals", "\\Leftrightarrow"],
  ]);

  function needsBrackets(ast: MathJson) {
    // For a correct implementation, you'd need to implement operator precedence...
    if (Array.isArray(ast) && ast.length == 3) {
      return true;
    } else {
      return false;
    }
  }

  function toLatexRecursive(ast: MathJson) {
    if (Array.isArray(ast)) {
      const op = mathJsonOperatorMap.get(ast[0]);
      if (!op) {
        throw new Error("Unknown operator " + ast);
      }

      if (ast.length == 0) {
        throw new Error("Not well formed AST tree " + ast);
      } else if (ast.length == 2) {
        let right = toLatexRecursive(ast[1]);
        if (needsBrackets(ast[1])) {
          right = `(${right})`;
        }
        return `${op} ${right}`;
      } else if (ast.length == 3) {
        let left = toLatexRecursive(ast[1]);
        if (needsBrackets(ast[1])) {
          left = `(${left})`;
        }
        let right = toLatexRecursive(ast[2]);
        if (needsBrackets(ast[2])) {
          right = `(${right})`;
        }
        return `${left} ${op} ${right}`; // TODO:
      } else {
        throw new Error("Not well formed AST tree " + ast);
      }
    } else if (ast === true) {
      return "\\mathtt{1}";
    } else if (ast === false) {
      return "\\mathtt{0}";
    } else if (typeof ast === "string") {
      return ast.replace(/^([^_]+)_([^]+)$/, "$1_{$2}");
    }
  }

  function mathToLatex(value: { mathJson?: MathJson; error?: string }): string {
    if (value.mathJson) {
      try {
        const output = toLatexRecursive(value.mathJson);
        return output;
      } catch (e) {
        value.error = e;
      }
    }

    if (value.error) {
      // https://tex.stackexchange.com/a/34586
      let escaped = value.error
        .replace(/\\/g, "\\textbackslash")
        .replace(/[&%$#_{}]/g, "\\$&")
        .replace(/\[/g, "{[}")
        .replace(/\]/g, "{]}")
        .replace(/~/g, "{\\textasciitilde}")
        .replace(/\^/g, "{\\textasciicircum}")
        .replace(/[^\x00-\x7F]/g, function (c) {
          return `\\char"${c.codePointAt(0).toString(16)}`;
        });
      // TODO: Prevent KaTeX warnings when encountering Unicode symbols
      return `\\textcolor{red}{\\texttt{${escaped}}}`;
    }

    return "";
  }

  return {
    mathToLatex,
  };
}

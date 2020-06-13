import {values} from 'lodash/fp';
import traverser from '../../traverser';
import PotentialClass from './PotentialClass';
import PotentialMethod from './PotentialMethod';
import PotentialConstructor from './PotentialConstructor';
import matchFunctionDeclaration from './matchFunctionDeclaration';
import matchFunctionVar from './matchFunctionVar';
import matchFunctionAssignment from './matchFunctionAssignment';
import matchPrototypeFunctionAssignment from './matchPrototypeFunctionAssignment';
import matchPrototypeObjectAssignment from './matchPrototypeObjectAssignment';
import matchObjectDefinePropertyCall from './matchObjectDefinePropertyCall';
import Inheritance from './inheritance/Inheritance';
import matchFieldLiteralAssignment from './matchFieldLiteralAssignment';
import PotentialField from './PotentialField';
import matchAnonymousClassConstructionFunction from './matchAnonymousClassConstructionFunction';
import matchSuperCall from './matchSuperCall';
import matchFieldObjectAssignment from './matchFieldObjectAssignment';
import matchFieldArrayAssignment from './matchFieldArrayAssignment';

export default function(ast, logger) {
  const context = new Map();
  const potentialClasses = {};
  const inheritance = new Inheritance();

  function getContext(node) {
    return context.get(node) || (() => {
      const newCtx = {};
      context.set(node, newCtx);
      return newCtx;
    })();
  }

  traverser.traverse(ast, {
    enter(node, parent) {
      const currentNodeContext = getContext(node);
      const parentContext = parent && getContext(parent);
      currentNodeContext.parent = parent;

      if ((matchAnonymousClassConstructionFunction()(node, parent))) {
        currentNodeContext.possibleAnonymousClassConstructionFunctionCallNode = node;
      }
      else if (parent && parentContext.possibleAnonymousClassConstructionFunctionCallNode) {
        currentNodeContext.possibleAnonymousClassConstructionFunctionCallNode = parentContext.possibleAnonymousClassConstructionFunctionCallNode;
      }

      let m;

      if ((m = matchFunctionDeclaration(node) || matchFunctionVar(node))) {
        potentialClasses[m.className] = new PotentialClass({
          name: m.className,
          fullNode: node,
          commentNodes: [node],
          parent,
        });
        potentialClasses[m.className].setConstructor(
          new PotentialConstructor({
            methodNode: m.constructorNode,
            potentialClass: potentialClasses[m.className]
          })
        );
      }
      else if ((m = matchFunctionAssignment(node))) {
        const directPotentialClass = potentialClasses[m.className];
        const realClassName = parentContext && parentContext.parent && parentContext.parent.id && parentContext.parent.id.name;
        const realPotentialClass = realClassName && potentialClasses[realClassName];
        const potentialClass = realPotentialClass || directPotentialClass;
        if (potentialClass) {
          potentialClass.addMethod(new PotentialMethod({
            name: m.methodName,
            methodNode: m.methodNode,
            fullNode: node,
            commentNodes: [node],
            parent,
            static: true,
          }));
        }
      }
      else if ((m = matchFieldLiteralAssignment(node))) {
        const directPotentialClass = potentialClasses[m.classIdentifier.name];
        const realClassName = parentContext && parentContext.parent && parentContext.parent.id && parentContext.parent.id.name;
        const realPotentialClass = realClassName && potentialClasses[realClassName];
        const potentialClass = realPotentialClass || directPotentialClass;
        if (potentialClass) {
          const isStatic = potentialClass === directPotentialClass;
          potentialClass.addField(new PotentialField({
            name: m.fieldIdentifier.name,
            valueNode: m.fieldNode,
            fullNode: node,
            parent,
            static: isStatic,
          }));
        }
      }
      else if ((m = matchFieldObjectAssignment(node))) {
        const directPotentialClass = potentialClasses[m.classIdentifier.name];
        const realClassName = parentContext && parentContext.parent && parentContext.parent.id && parentContext.parent.id.name;
        const realPotentialClass = realClassName && potentialClasses[realClassName];
        const potentialClass = realPotentialClass || directPotentialClass;
        if (potentialClass) {
          const isStatic = potentialClass === directPotentialClass;
          potentialClass.addField(new PotentialField({
            name: m.objectIdentifier.name,
            valueNode: m.objectNode,
            fullNode: node,
            parent,
            static: isStatic,
          }));
        }
      }
      else if ((m = matchFieldArrayAssignment(node))) {
        const directPotentialClass = potentialClasses[m.classIdentifier.name];
        const realClassName = parentContext && parentContext.parent && parentContext.parent.id && parentContext.parent.id.name;
        const realPotentialClass = realClassName && potentialClasses[realClassName];
        const potentialClass = realPotentialClass || directPotentialClass;
        if (potentialClass) {
          const isStatic = potentialClass === directPotentialClass;
          potentialClass.addField(new PotentialField({
            name: m.arrayIdentifier.name,
            valueNode: m.arrayNode,
            fullNode: node,
            parent,
            static: isStatic,
          }));
        }
      }
      // else if ((m = matchSuperCall(node))) {
      //   let cParent = parent;
      //   let realPotentialClass;
      //   do {
      //     const realClassName = cParent && cParent.id && cParent.id.name;
      //     realPotentialClass = realClassName && potentialClasses[realClassName];
      //     const pContext = getContext(cParent);
      //     cParent = pContext && pContext.parent;
      //   } while (!realPotentialClass && cParent);
      //   if (realPotentialClass) {
      //     realPotentialClass.addSuperCall(parent, node, m.constructorArguments);
      //   }
      // }
      else if ((m = matchPrototypeFunctionAssignment(node))) {
        if (potentialClasses[m.className]) {
          potentialClasses[m.className].addMethod(new PotentialMethod({
            name: m.methodName,
            methodNode: m.methodNode,
            fullNode: node,
            commentNodes: [node],
            parent,
          }));
        }
      }
      else if ((m = matchPrototypeObjectAssignment(node))) {
        if (potentialClasses[m.className]) {
          m.methods.forEach((method, i) => {
            const assignmentComments = (i === 0) ? [node] : [];

            potentialClasses[m.className].addMethod(new PotentialMethod({
              name: method.methodName,
              methodNode: method.methodNode,
              fullNode: node,
              commentNodes: assignmentComments.concat([method.propertyNode]),
              parent,
              kind: classMethodKind(method.kind),
            }));
          });
        }
      }
      else if ((m = matchObjectDefinePropertyCall(node))) {
        if (potentialClasses[m.className]) {
          m.descriptors.forEach((desc, i) => {
            const parentComments = (i === 0) ? [node] : [];

            potentialClasses[m.className].addMethod(new PotentialMethod({
              name: m.methodName,
              methodNode: desc.methodNode,
              fullNode: node,
              commentNodes: parentComments.concat([desc.propertyNode]),
              parent,
              kind: desc.kind,
            }));
          });
        }
      }
      else if ((m = inheritance.process(node, parent))) {
        if (potentialClasses[m.className]) {
          potentialClasses[m.className].setSuperClass(
            m.superClass,
            m.relatedExpressions
          );
        }
      }
    },
    leave(node) {
      if (node.type === 'Program') {
        values(potentialClasses)
          .filter(cls => cls.isTransformable() ? true : logWarning(cls))
          .forEach(cls => cls.transform(getContext));
      }
    }
  });

  // Ordinary methods inside class use kind=method,
  // unlike methods inside object literal, which use kind=init.
  function classMethodKind(kind) {
    return kind === 'init' ? 'method' : kind;
  }

  function logWarning(cls) {
    if (/^[A-Z]/.test(cls.getName())) {
      logger.warn(
        cls.getFullNode(),
        `Function ${cls.getName()} looks like class, but has no prototype`,
        'class'
      );
    }
  }
}

import path from 'node:path';

const layers = ['shared', 'modules', 'pages', 'app'];

/** 判断源码导入是否越过分层或模块边界；供 ESLint 和规则回归测试复用。 */
export function getBoundaryError(importer, target) {
  const [sourceLayer, sourceModule] = importer.split('/');
  const [targetLayer, targetModule] = target.split('/');
  if (importer === 'main.js') {
    return ['app', 'shared'].includes(targetLayer) ? null : '入口只负责应用装配和基础样式。';
  }
  if (sourceLayer === 'data') {
    if (['app', 'pages'].includes(targetLayer)) return '数据适配器不能依赖应用或页面。';
    if (targetLayer === 'modules' && !target.includes('/model/')) {
      return '数据适配器只能引用业务模型契约。';
    }
    return null;
  }
  if (targetLayer === 'data') {
    return importer.startsWith('app/providers/') ? null : '只有应用 providers 可以装配数据适配器。';
  }
  if (layers.indexOf(targetLayer) > layers.indexOf(sourceLayer)) {
    return '禁止反向依赖上层目录。';
  }
  const isForeignModule =
    targetLayer === 'modules' && (sourceLayer !== 'modules' || sourceModule !== targetModule);
  if (isForeignModule && !/^modules\/[^/]+\/(index|services)\.js$/.test(target)) {
    return '跨模块必须通过 index.js 或 services.js 公开入口。';
  }
  return null;
}

export const architecturePlugin = {
  rules: {
    boundaries: {
      meta: { type: 'problem', schema: [], messages: { invalid: '{{reason}}' } },
      create(context) {
        function checkSource(node) {
          const filename = context.filename;
          const source = node.source?.value;
          if (typeof source !== 'string' || !filename.includes('/src/')) return;
          const sourceRoot = filename.slice(0, filename.indexOf('/src/') + 5);
          let resolved;
          if (source.startsWith('@/')) resolved = path.join(sourceRoot, source.slice(2));
          else if (source.startsWith('.')) resolved = path.resolve(path.dirname(filename), source);
          else return;
          const importer = path.relative(sourceRoot, filename).split(path.sep).join('/');
          const target = path.relative(sourceRoot, resolved).split(path.sep).join('/');
          const reason = getBoundaryError(importer, target);
          if (reason) context.report({ node, messageId: 'invalid', data: { reason } });
        }

        // 同时检查懒加载和 re-export，避免通过公开导出或动态 import 绕过边界。
        return {
          ImportDeclaration: checkSource,
          ImportExpression: checkSource,
          ExportNamedDeclaration: checkSource,
          ExportAllDeclaration: checkSource,
        };
      },
    },
  },
};

const MAX_VISUAL_DEPTH = 3;

export const normalizeThreadItems = ({
  items,
  sourceType,
  containerId,
}) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ({
    ...item,
    sourceType,
    containerId,
  }));
};

const createIndex = (comments) => {
  const byId = new Map();
  const childrenByParentId = new Map();

  comments.forEach((comment) => {
    byId.set(comment.id, comment);

    const parentId = comment.parentId ?? null;
    const children = childrenByParentId.get(parentId) || [];

    children.push(comment);
    childrenByParentId.set(parentId, children);
  });

  childrenByParentId.forEach((children) => {
    children.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    );
  });

  return {
    byId,
    childrenByParentId,
  };
};

export const getCommentVisualDepth = ({
  comment,
  byId,
  rootParentId,
}) => {
  let current = comment;
  let depth = 0;
  const visited = new Set();

  while (
    current &&
    current.parentId != null &&
    current.parentId !== rootParentId &&
    depth < MAX_VISUAL_DEPTH
  ) {
    if (visited.has(current.id)) {
      break;
    }

    visited.add(current.id);

    const parent = byId.get(current.parentId);

    if (!parent) {
      break;
    }

    depth += 1;
    current = parent;
  }

  return depth;
};

export const getDescendants = (commentId, childrenByParentId) => {
  const result = [];
  const children = childrenByParentId.get(commentId) || [];

  children.forEach((child) => {
    result.push(child);
    result.push(...getDescendants(child.id, childrenByParentId));
  });

  return result;
};

export const buildCommentTree = (
  comments,
  rootParentId,
) => {
  const { childrenByParentId } = createIndex(comments);
  const rootReplies = childrenByParentId.get(rootParentId) || [];

  return rootReplies.map((root) => ({
    root: {
      ...root,
      __depth: 0,
    },
    repliesCount: (childrenByParentId.get(root.id) || []).length,
  }));
};

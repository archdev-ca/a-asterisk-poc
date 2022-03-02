let grid = document.getElementById("canvas");
let gridX = 10;
let gridY = 10;
let cellSize = 70;
let nodes = {
  list: [],
  map: {},
};
let obstacles = {
  list: [],
  map: {},
};
let endPoints = { x: 8, y: 4 };
let startPoints = { x: 1, y: 1 };
let openNodes = [];
let closedNodes = {
  list: [],
  map: {},
};

generateGrid();

grid.addEventListener("click", handleClick);

// Create obstacles
obstacles.map[7] = {};
obstacles.map[8] = {};
obstacles.map[7][3] = updateNode(7, 3, { className: "obstacle" });
obstacles.map[7][4] = updateNode(7, 4, { className: "obstacle" });
obstacles.map[8][3] = updateNode(8, 3, { className: "obstacle" });

// Create endpoints
let startNode = updateNode(1, 1, {
  x: 1,
  y: 1,
  gCost: 0,
  className: "endpoint",
  html: '<i class="f">A</i>',
});
let endNode = updateNode(8, 4, {
  x: 8,
  y: 4,
  hCost: 0,
  className: "endpoint",
  html: '<i class="f">B<i>C<i>D</i></i></i>',
});
let endToEnd = getDistance(startNode, endNode);
startNode.hCost = endToEnd;
endNode.gCost = endToEnd;
openNodes.push(startNode);

function PathNode(props = {}) {
  let { el, x, y, gCost = 0, hCost = 0, fCost = 0, parentNode } = props;
  this.x = x;
  this.y = y;
  this.gCost = gCost;
  this.hCost = hCost;
  this.fCost = fCost;
  this.el = el;
  this.parentNode = parentNode;
}

/**
 * Create a node in the supplied coordinates
 * @param {*} x
 * @param {*} y
 * @param {*} props
 * @returns
 */
function createNode(x, y, props = {}) {
  let { className, html } = props;
  let el = document.createElement("div");
  el.className = "cell";
  el.dataset.x = x;
  el.dataset.y = y;
  el.style.left = `${x * cellSize}px`;
  el.style.top = `${y * cellSize}px`;
  el.style.width = `${cellSize}px`;
  el.style.height = `${cellSize}px`;
  if (className) {
    el.className += ` ${className}`;
  }
  if (html) {
    el.innerHTML = html;
  }
  return el;
}

/**
 * Create coords
 * @param {*} x
 * @param {*} y
 * @returns
 */
function mc(x, y) {
  return `${x}:${y}`;
}

/**
 * Update the node in the supplied coordinates
 * @param {*} x
 * @param {*} y
 * @param {*} props
 * @returns
 */
function updateNode(x, y, props = {}) {
  let { className, data, html } = props;
  let node = nodes.map[x][y];
  if (className) {
    node.el.className += ` ${className}`;
  }
  if (html) {
    node.el.innerHTML = html;
  }
  if (data) {
    node = {
      ...node,
      ...data,
    };
  }
  nodes.map[x][y] = node;
  return node;
}

/**
 * Generate the grid nodes
 */
function generateGrid() {
  grid.style.width = `${gridX * cellSize}px`;
  grid.style.height = `${gridY * cellSize}px`;
  for (let x = 0; x < gridX; x++) {
    for (let y = 0; y < gridY; y++) {
      let el = createNode(x, y);
      let node = new PathNode({ x, y, el });
      node.x = x;
      node.y = y;
      node.el = el;
      nodes.list.push(el);
      if (!nodes.map[x]) {
        nodes.map[x] = {};
      }
      nodes.map[x][y] = node;
      grid.appendChild(el);
    }
  }
}

/**
 * Get the distance between two nodes
 * @param {*} node1
 * @param {*} node2
 * @returns
 */
function getDistance(node1, node2) {
  return (Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y)) * 10;
}

/**
 * Grid click handler
 * @param {*} e
 */
function handleClick(e) {
  if ((el = getParentTarget(e.target, ".cell", "#canvas"))) {
    let node = nodes.map[el.dataset.x][el.dataset.y];
    closeNode(node.x, node.y);
    updateNode(node.x, node.y, { className: "close" });
    getSurroundingNodes(node.x, node.y);
  }
}

/**
 * Return the parent node that matches the selector
 * @param {*} node
 * @param {*} parentSelector
 * @param {*} endSelector
 * @returns
 */
function getParentTarget(node, parentSelector, endSelector) {
  let parentNode = node.parentNode;
  if (node.matches(endSelector) || parentNode.matches(endSelector)) {
    return false;
  }
  if (node.matches(parentSelector)) {
    return node;
  }
  if (parentNode && parentNode.matches(parentSelector)) {
    return parentNode;
  }
  // Continue getting parent node until it reaches endSelector
  while (
    !parentNode.matches(parentSelector) ||
    !parentNode.matches(endSelector)
  ) {
    return getParentTarget(parentNode, parentSelector, endSelector);
  }
}

/**
 * Gets the surrounding nodes of the node in this coordinate
 * @param {*} x
 * @param {*} y
 * @returns
 */
function getSurroundingNodes(x, y) {
  x = parseInt(x);
  y = parseInt(y);
  let parentNode = nodes.map[x][y];
  let surroundingNodes = [];
  if (isValidCoords(x, y - 1)) {
    let node = nodes.map[x][y - 1];
    let gCost = parentNode.gCost + 10;
    let hCost = getDistance(node, endNode);
    let fCost = gCost + hCost;
    node.parentNode = parentNode;
    surroundingNodes.push(
      updateNode(x, y - 1, {
        className: "open",
        html: `<i class="f">${fCost}</i><i class="g">${gCost}</i><i class="h">${hCost}</i>`,
        data: {
          fCost,
          gCost,
          hCost,
        },
      })
    );
  }
  if (isValidCoords(x, y + 1)) {
    let node = nodes.map[x][y + 1];
    let gCost = parentNode.gCost + 10;
    let hCost = getDistance(node, endNode);
    let fCost = gCost + hCost;
    node.parentNode = parentNode;
    surroundingNodes.push(
      updateNode(x, y + 1, {
        className: "open",
        html: `<i class="f">${fCost}</i><i class="g">${gCost}</i><i class="h">${hCost}</i>`,
        data: {
          fCost,
          gCost,
          hCost,
        },
      })
    );
  }
  if (isValidCoords(x - 1, y)) {
    let node = nodes.map[x - 1][y];
    let gCost = parentNode.gCost + 10;
    let hCost = getDistance(node, endNode);
    let fCost = gCost + hCost;
    node.parentNode = parentNode;
    surroundingNodes.push(
      updateNode(x - 1, y, {
        className: "open",
        html: `<i class="f">${fCost}</i><i class="g">${gCost}</i><i class="h">${hCost}</i>`,
        data: {
          fCost,
          gCost,
          hCost,
        },
      })
    );
  }
  if (isValidCoords(x + 1, y)) {
    let node = nodes.map[x + 1][y];
    let gCost = parentNode.gCost + 10;
    let hCost = getDistance(node, endNode);
    let fCost = gCost + hCost;
    node.parentNode = parentNode;
    surroundingNodes.push(
      updateNode(x + 1, y, {
        className: "open",
        html: `<i class="f">${fCost}</i><i class="g">${gCost}</i><i class="h">${hCost}</i>`,
        data: {
          fCost,
          gCost,
          hCost,
        },
      })
    );
  }
  return surroundingNodes;
}

/**
 * Check if coordinate is valid
 * @param {*} x
 * @param {*} y
 * @returns
 */
function isValidCoords(x, y) {
  if (
    // Inside the grid
    x > -1 &&
    x < gridX &&
    y > -1 &&
    y < gridY &&
    !(closedNodes.map[x] && closedNodes.map[x][y]) &&
    !(obstacles.map[x] && obstacles.map[x][y]) &&
    !(startNode.x == x && startNode.y == y) &&
    !(endNode.x == x && endNode.y == y) &&
    !(closedNodes.map[x] && closedNodes.map[x][y])
  ) {
    return true;
  }
  return false;
}

/**
 * Find the shortest path
 */
let counter = 10;
function solve() {
  // Get surrounding nodes of startNode
  // Sort surrounding nodes by fCost, hCost
  let node = openNodes.shift();
  node.el.className += " close";
  closeNode(node.x, node.y);
  let surroundingNodes = getSurroundingNodes(node.x, node.y);
  for (let i = 0; i < surroundingNodes.length; i++) {
    queueNode(openNodes, surroundingNodes[i]);
  }
  setTimeout(function () {}, 1000);
}

/**
 * Queue node lowest fCost and lowest hCost first
 * @param {*} queue
 * @param {*} node
 * @returns
 */
function queueNode(queue, node) {
  if (isClosedNode(node.x, node.y)) {
    return false;
  }
  for (let i = 0; i < queue.length; i++) {
    let curNode = queue[i];

    // Lower fCost or Lower gCost
    if (
      node.fCost < curNode.fCost ||
      (node.fCost == curNode.fCost && node.hCost < curNode.hCost)
    ) {
      queue.splice(i, 0, node);
      return;
    }
  }
  queue.push(node);
}

/**
 * Add this coordinate to closedNodes
 * @param {*} x
 * @param {*} y
 */
function closeNode(x, y) {
  if (!closedNodes.map[x]) {
    closedNodes.map[x] = {};
  }
  closedNodes.map[x][y] = true;
}

/**
 * Check if this coordinate is a closed node
 * @param {*} x
 * @param {*} y
 */
function isClosedNode(x, y) {
  return closedNodes.map[x] && closedNodes.map[x][y];
}

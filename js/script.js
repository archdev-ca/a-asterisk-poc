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
let openNodesList = [];

function PathNode(props = {}) {
  let { el, x, y, gCost, hCost, fCost, parentNode } = props;
  this.x = x;
  this.y = y;
  this.gCost = gCost;
  this.hCost = hCost;
  this.fCost = fCost;
  this.el = el;
  this.parentNode = parentNode;
}

function createNode(x, y, props = {}) {
  let { className, html } = props;
  let el = document.createElement("div");
  el.className = "cell";
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
  return node;
}

// Generate the grid
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
generateGrid();

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

// Get distance between nodes
function getDistance(node1, node2) {
  return (Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y)) * 10;
}

grid.addEventListener("click", handleClick);
function handleClick(e) {
  e.target.traverseToParentClass();
}

HTMLElement.prototype.traverseToParentClass = function (parentClass, endClass) {
  console.log(this.parentNode.className);
};

HTMLElement.prototype.hasClass = function (className) {
  let classes = this.className.split(" ");
  return classes.indexOf(className) > -1;
};

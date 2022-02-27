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
  let {
    el = null,
    x = null,
    y = null,
    gCost = null,
    hCost = null,
    fCost = null,
    parentNode = null,
  } = props;
  this.x = x;
  this.y = y;
  this.gCost = gCost;
  this.hCost = hCost;
  this.fCost = fCost;
  this.el = el;
  this.parentNode = parentNode;
}

function createNode(x, y, className, data) {
  let el = document.createElement("div");
  el.className = "cell";
  el.style.left = `${x * cellSize}px`;
  el.style.top = `${y * cellSize}px`;
  el.style.width = `${cellSize}px`;
  el.style.height = `${cellSize}px`;
  if (className) {
    el.className += ` ${className}`;
  }
  if (data) {
    el.innerHTML = data;
  }
  return el;
}

// Generate the grid
function generateGrid() {
  grid.style.width = `${gridX * cellSize}px`;
  grid.style.height = `${gridY * cellSize}px`;
  for (let x = 0; x < gridX; x++) {
    for (let y = 0; y < gridY; y++) {
      let nodeEl = createNode(x, y);
      let node = new PathNode();
      node.x = x;
      node.y = y;
      node.el = nodeEl;
      nodes.list.push(nodeEl);
      nodes.map[`${x}:${y}`] = node;
      nodeEl.addEventListener("click", function () {
        getSurroundingNodes(node);
      });
    }
  }
}
generateGrid();

// Create obstacles
obstacles.map[7] = {};
obstacles.map[8] = {};
obstacles.map[7][3] = createNode(7, 3, "obstacle");
obstacles.map[7][4] = createNode(7, 4, "obstacle");
obstacles.map[8][3] = createNode(8, 3, "obstacle");

// Create endpoints
let startNode = new PathNode();
startNode.el = createNode(1, 1, "endpoint", '<i class="f">A</i>');
startNode.x = 1;
startNode.y = 1;
startNode.gCost = 0;
startNode.el.addEventListener("click", function () {
  getSurroundingNodes(startNode);
});

let endNode = new PathNode();
endNode.el = createNode(8, 4, "endpoint", '<i class="f">B</i>');
endNode.x = 8;
endNode.y = 4;
endNode.hCost = 0;
openNodesList.push(startNode);
endNode.el.addEventListener("click", function () {
  getSurroundingNodes(endNode);
});

let endToEnd = getDistance(startNode, endNode);
startNode.hCost = endToEnd;
endNode.gCost = endToEnd;

function getDistance(node1, node2) {
  return (Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y)) * 10;
}

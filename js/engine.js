function Engine(canvas, config = {}) {
  const defaultConfig = {
    cellW: 50,
    cellH: 50,
    gridW: 15, // Number of cells
    gridH: 15, // Number of cells
  };
  const engine = this;
  let cfg = {
    ...defaultConfig,
    ...config,
  };
  let c = canvas.getContext("2d");
  let nodes = {
    map: {},
    list: [],
  };
  let cells = {
    list: [],
    map: {},
  };
  let openNodes = {
    list: [],
    map: {},
  };
  let closedNodes = {
    map: {},
  };
  let obstacleNodes = {
    map: {},
  };
  let startNode = null;
  let endNode = null;

  function Cell(x, y, props) {
    props = {
      ...props,
    };
    this.x = x;
    this.y = y;
    this.update = function () {
      engine.addRect(x * cfg.cellW, y * cfg.cellH, cfg.cellW, cfg.cellH, {
        lineWidth: 1,
        strokeStyle: "#ccc",
        color: "#fff",
      });
    };
  }

  function Node(x, y, props) {
    props = {
      gCost: 0,
      hCost: 0,
      fCost: 0,
      prevNode: null,
      isStartNode: false,
      isEndNode: false,
      ...props,
    };
    this.x = x;
    this.y = y;
    this.gCost = props.gCost;
    this.hCost = props.hCost;
    this.close = function () {};
  }

  this.generateGrid = function () {
    canvas.width = `${cfg.cellW * cfg.gridW}`;
    canvas.height = `${cfg.cellH * cfg.gridH}`;
    c.fillStyle = "#fff";
    c.fillRect(0, 0, canvas.width, canvas.height);
    // Create cells
    for (let x = 0; x < cfg.gridW; x++) {
      for (let y = 0; y < cfg.gridW; y++) {
        let cell = new Cell(x, y);
        if (!cells.map[x]) {
          cells.map[x] = {};
        }
        cells.map[x][y] = cell;
        cells.list.push(cell);
        cell.update();
      }
    }
  };

  this.setStartNode = function (x, y) {
    this.addRect(x * cfg.cellW, y * cfg.cellH, cfg.cellW, cfg.cellH, {
      color: "#00b9ff",
      strokeStyle: "#fff",
      lineWidth: 2,
    });
    this.addText(
      "A",
      x * cfg.cellW + cfg.cellW / 2,
      y * cfg.cellH + cfg.cellH / 2,
      { size: "20px", align: "center", baseline: "middle", color: "#000" }
    );
    startNode = new Node(x, y);
    this.queueNode(startNode);
  };

  this.setEndNode = function (x, y) {
    this.addRect(x * cfg.cellW, y * cfg.cellH, cfg.cellW, cfg.cellH, {
      color: "#00b9ff",
      strokeStyle: "#fff",
      lineWidth: 2,
    });
    this.addText(
      "B",
      x * cfg.cellW + cfg.cellW / 2,
      y * cfg.cellH + cfg.cellH / 2,
      { size: "20px", align: "center", baseline: "middle", color: "#000" }
    );
    endNode = new Node(x, y);
    this.queueNode(endNode);
  };

  this.addObstacles = function (coords) {
    for (let i = 0; i < coords.length; i++) {
      let coord = coords[i];
      this.addRect(
        coord[0] * cfg.cellW,
        coord[1] * cfg.cellH,
        cfg.cellW,
        cfg.cellH,
        {
          strokeStyle: "#fff",
          lineWidth: 2,
          color: "#000",
        }
      );
    }
  };

  this.addText = function (text, x, y, props) {
    props = {
      align: "center",
      font: "arial",
      size: "10px",
      baseline: "bottom",
      align: "start",
      color: "#000",
      ...props,
    };
    c.font = `${props.size} ${props.font}`;
    c.textAlign = props.align;
    c.textBaseline = props.baseline;
    c.fillStyle = props.color;
    c.fillText(text, x, y);
  };

  this.addRect = function (x, y, width, height, props) {
    props = {
      lineWidth: 0,
      strokeStyle: "#00",
      color: "#f00",
      ...props,
    };
    c.fillStyle = props.color;
    c.fillRect(x, y, width, height);
    if (props.lineWidth) {
      c.lineWidth = props.lineWidth;
      c.strokeStyle = props.strokeStyle;
      c.strokeRect(x, y, width, height);
    }
  };

  this.findNearestPath = function () {
    console.log("Finding nearest path");
    let node = openNodes.list.shift();
    let surroundingNodes = this.getSurroundingNodes(node.x, node.y);
    this.queueNode(node.x, node.y);
  };

  this.queueNode = function (node) {
    openNodes.map.addProp([node.x, node.y], node);
    openNodes.list.push(node);
  };

  this.getDistance = function (node1, node2) {};

  this.isNodeClosed = function (x, y) {
    return !!closedNodes.map[x] && closedNodes.map[x][y];
  };

  this.isValidCoords = function (x, y) {
  let isValidCoords = function (x, y) {
    if (
      // Inside the grid
      x > -1 &&
      x < cfg.gridW &&
      y > -1 &&
      y < cfg.gridH &&
      // Not closed Nodes
      !isNodeClosed(x, y) &&
      // Not an obstacle node
      !isObstacle(x, y) &&
      // Not start node
      !(startNode.x == x && startNode.y == y)
    ) {
      return true;
    }
    return false;
  };

  this.getSurroundingNodes = function (x, y) {
    // x = parseInt(x);
    // y = parseInt(y);
    let parentNode = openNodes.map[x][y];
    let surroundingNodes = [];
    if (isValidCoords(x, y - 1)) {
      let node = new Node(x, y - 1);
      node.gCost = parentNode.gCost + 10;
      node.hCost = getDistance(node, endNode);
      node.fCost = node.gCost + node.hCost;
      node.parentNode = parentNode;
      if (
        !isNodeOpen(x, y - 1) ||
        node.fCost < node.fCost ||
        (node.fCost == node.fCost && node.hCost < node.hCost)
      ) {
        surroundingNodes.push(node);
        node.open();
      }
    }
    if (isValidCoords(x, y + 1)) {
      let node = new Node(x, y + 1);
      node.gCost = parentNode.gCost + 10;
      node.hCost = getDistance(node, endNode);
      node.fCost = node.gCost + node.hCost;
      node.parentNode = parentNode;
      if (
        !isNodeOpen(x, y + 1) ||
        node.fCost < node.fCost ||
        (node.fCost == node.fCost && node.hCost < node.hCost)
      ) {
        surroundingNodes.push(node);
        node.open();
      }
    }
    if (isValidCoords(x - 1, y)) {
      let node = new Node(x - 1, y);
      node.gCost = parentNode.gCost + 10;
      node.hCost = getDistance(node, endNode);
      node.fCost = node.gCost + node.hCost;
      node.parentNode = parentNode;
      if (
        !isNodeOpen(x - 1, y) ||
        node.fCost < node.fCost ||
        (node.fCost == node.fCost && node.hCost < node.hCost)
      ) {
        surroundingNodes.push(node);
        node.open();
      }
    }
    if (isValidCoords(x + 1, y)) {
      let node = new Node(x + 1, y);
      node.gCost = parentNode.gCost + 10;
      node.hCost = getDistance(node, endNode);
      node.fCost = node.gCost + node.hCost;
      node.parentNode = parentNode;
      if (
        !isNodeOpen(x + 1, y) ||
        node.fCost < node.fCost ||
        (node.fCost == node.fCost && node.hCost < node.hCost)
      ) {
        surroundingNodes.push(node);
        node.open();
      }
    }
    return surroundingNodes;
  };
}

Object.prototype.addProp = function (keys, value) {
  let curobj = this;
  for (let i = 0; i < keys.length; i++) {
    key = keys[i];
    if (!curobj[key]) {
      curobj[key] = i === keys.length - 1 ? value : {};
    } else {
      if (i === keys.length - 1) {
        curobj[key] = value;
      }
    }
    curobj = curobj[key];
  }
};

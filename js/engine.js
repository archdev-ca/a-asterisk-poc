function Engine(canvas, config = {}) {
  const defaultConfig = {
    cellW: 50,
    cellH: 50,
    gridW: 15, // Number of cells
    gridH: 15, // Number of cells
  };
  const engine = this;
  const debug = true;
  let cfg = {
    ...defaultConfig,
    ...config,
  };
  let c = canvas.getContext("2d");
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
    this.close = function () {
      if (!closedNodes.map[this.x]) {
        closedNodes.map[this.x] = {};
      }
      closedNodes.map[this.x][this.y] = true;
    };
    this.open = function () {
      if (debug) {
        engine.addRect(
          this.x * cfg.cellW,
          this.y * cfg.cellH,
          cfg.cellW,
          cfg.cellH,
          {
            color: "#00c93c",
            strokeStyle: "#fff",
            lineWidth: 2,
          }
        );
        engine.addText(
          this.fCost,
          this.x * cfg.cellW + cfg.cellW / 2,
          this.y * cfg.cellH + cfg.cellH / 2,
          { size: "14px", align: "center", baseline: "top", color: "#000" }
        );
        engine.addText(
          this.gCost,
          this.x * cfg.cellW + 5,
          this.y * cfg.cellH + 15,
          {
            size: "10px",
            align: "left",
            baseline: "bottom",
            color: "#000",
          }
        );
        engine.addText(
          this.hCost,
          this.x * cfg.cellW + cfg.cellW - 5,
          this.y * cfg.cellH + 15,
          { size: "10px", align: "right", baseline: "bottom", color: "#000" }
        );
      }
    };
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
    queueNode(startNode);
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

  let breakpoint = 100;
  let iterCount = 0;
  this.findNearestPath = function () {
    let node = openNodes.list.shift();

    if (node.x == endNode.x && node.y == endNode.y) {
      return;
    }

    let surroundingNodes = getSurroundingNodes(node.x, node.y);
    for (let i = 0; i < surroundingNodes.length; i++) {
      queueNode(surroundingNodes[i]);
      if (debug) {
        surroundingNodes[i].open();
      }
    }

    iterCount++;
    if (iterCount < breakpoint) {
      setTimeout(() => {
        this.findNearestPath();
      }, 200);
    }
  };

  let queueNode = function (node) {
    if (isNodeClosed(node.x, node.y)) {
      return false;
    }
    for (let i = 0; i < openNodes.list.length; i++) {
      let curNode = openNodes.list[i];

      // Lower fCost or Lower gCost
      if (
        node.fCost < curNode.fCost ||
        (node.fCost == curNode.fCost && node.hCost < curNode.hCost)
      ) {
        openNodes.list.splice(i, 0, node);
        openNodes.map.addProp([node.x, node.y], node);
        return;
      }
    }
    openNodes.list.push(node);
    openNodes.map.addProp([node.x, node.y], node);
  };

  let getDistance = function (node1, node2) {
    return (Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y)) * 10;
  };

  let isNodeClosed = function (x, y) {
    return !!closedNodes.map[x] && closedNodes.map[x][y];
  };

  let isNodeOpen = function (x, y) {
    return !!openNodes.map[x] && openNodes.map[x][y];
  };

  let isObstacle = function (x, y) {
    return !!obstacleNodes.map[x] && obstacleNodes.map[x][y];
  };

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

  let getSurroundingNodes = function (x, y) {
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

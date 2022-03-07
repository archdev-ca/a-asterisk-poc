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
    let startingNode = new Node(2, 2);
    let node = openNodes.list.shift();
  };

  this.queueNode = function (x, y) {
    openNodes.map.addProp([x, y], true);
    openNodes.list.push(nodes.map[(x, y)]);
  };

  this.getDistance = function (node1, node2) {};

  this.isNodeClosed = function (x, y) {
    return !!closedNodes.map[x] && closedNodes.map[x][y];
  };

  this.isValidCoords = function (x, y) {
    if (
      // Inside the grid
      x > -1 &&
      x < cfg.gridW &&
      y > -1 &&
      y < cfg.gridH &&
      // Not closed Nodes
      !this.isClosedNode(x, y) &&
      // Not an obstacle node
      !(obstacleNodes.map[x] && obstacleNodes.map[x][y]) &&
      // Not start node
      !(startNode.x == x && startNode.y == y)
    ) {
      return true;
    }
    return false;
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

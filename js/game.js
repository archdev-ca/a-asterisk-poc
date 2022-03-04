var engine = new Engine(document.getElementById("game-canvas"));

engine.generateGrid();
engine.setStartNode(2, 2);
engine.setEndNode(10, 10);
engine.addObstacles([
  [9, 10],
  [9, 9],
  [10, 9],
]);

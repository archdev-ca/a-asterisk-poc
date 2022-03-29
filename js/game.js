var engine = new Engine(document.getElementById("game-canvas"));

engine.generateGrid();
engine.setStartNode(2, 2);
engine.setEndNode(10, 10);
engine.addObstacles([
  [2, 4],
  [3, 4],
  [4, 4],
  [5, 4],
  [6, 4],
  [6, 3],
  [6, 2],
  [9, 10],
  [9, 9],
  [10, 9],
]);

function solve() {
  engine.findNearestPath();
}

window.addEventListener("keydown", function (e) {
  console.log(e);
  switch (e.key) {
    case "ArrowUp":
      break;
    case "ArrowDown":
      break;
    case "ArrowLeft":
      break;
    case "ArrowRight":
      break;
  }
});

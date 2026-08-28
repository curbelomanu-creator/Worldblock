function generateWorld(){
  // Fixed medieval hub. The infinite exterior is generated separately by chunks.
  setGroundPatch(-24,-24,24,24,3,'grass');

  // Permanent ground beneath the gate road and troll patrol routes.
  setGroundPatch(-4,-44,4,-23,3,'grass');
  setGroundPatch(-31,-20,-27,10,3,'grass');
  setGroundPatch(27,-12,31,18,3,'grass');
  setGroundPatch(-16,-32,16,-28,3,'grass');
  setGroundPatch(-24,28,24,32,3,'grass');

  buildWall(-22,-22,22,-22,3,5);
  buildWall(-22,22,22,22,3,5);
  buildWall(-22,-22,-22,22,3,5);
  buildWall(22,-22,22,22,3,5);

  // Monumental northern gate opening toward the procedural forest.
  clearBox(-5,4,-22,5,10,-22);
  buildTower(-9,3,-22,3,11);
  buildTower(9,3,-22,3,11);
  for(let x=-5;x<=5;x++){
    addBlock(x,10,-22,'stone');
    addBlock(x,11,-22,'stone');
  }
  for(let y=4;y<=9;y++){
    addBlock(-6,y,-22,'wood');
    addBlock(6,y,-22,'wood');
  }
  buildOpenGateDoors();

  buildPath(0,-22,0,22,3,1);
  buildPath(-22,0,22,0,3,1);
  buildPath(-22,-10,22,-10,3,0);
  buildPath(-22,10,22,10,3,0);
  buildPath(-10,-22,-10,22,3,0);
  buildPath(10,-22,10,22,3,0);
  buildPlaza(0,0,3,5);

  buildMedievalHouse(-16,3,-16,7,6,4);
  buildMedievalHouse(-6,3,-16,8,6,4);
  buildMedievalHouse(6,3,-16,8,6,4);
  buildMedievalHouse(-17,3,-4,6,5,4);
  buildMedievalHouse(-7,3,-4,6,5,4);
  buildMedievalHouse(5,3,-4,7,5,4);
  buildMedievalHouse(14,3,-4,6,5,4);
  buildMedievalHouse(-16,3,8,7,6,4);
  buildMedievalHouse(-6,3,8,7,6,4);
  buildMedievalHouse(6,3,8,8,6,4);
  buildTower(0,3,14,3,12);

  buildTerrainPath(0,-23,0,-43,2);
  addVillageDetails();
}

generateWorld();

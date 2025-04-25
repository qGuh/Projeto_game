class VirusBot extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, level = 1) {
    const spriteName = level > 5 ? 'virus_level_5' : 'virus_level_' + level;
    super(scene, x, y, spriteName);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.level = level;
    this.life = level * 2;
    this.body.setVelocityX(30 + level * 5);
  }

  receiveDamage(damage) {
    this.life -= damage;
    if (this.life <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }

  update() {
    if (this.x >= 1160 && !gameState.gameOver) {
      this.destroy();
      gameState.serverLife--;
      if (gameState.serverLife <= 0) gameState.gameOver = true;
    }
  }
}
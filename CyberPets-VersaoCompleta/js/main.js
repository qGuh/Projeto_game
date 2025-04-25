let virusGroup, petGroup, bulletGroup;
let lifeText;

const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 600,
  backgroundColor: '#001f33',
  physics: { default: 'arcade' },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

function selectPet() {
  if (gameState.coins >= gameState.petCost) {
    gameState.selectedPet = true;
    alert("Clique para posicionar o Pet.");
  } else {
    alert("Moedas insuficientes!");
  }
}

function preload() {
  for (let i = 1; i <= 5; i++) {
    this.load.image('virus_level_' + i, 'assets/virus_level_' + i + '.png');
  }
  for (let i = 1; i <= 3; i++) {
    this.load.image('pet_level_' + i, 'assets/pet_level_' + i + '.png');
  }
  this.load.image('bullet', 'assets/bullet.png');
  this.load.image('server', 'assets/server.png');
}

function create() {
  virusGroup = this.add.group();
  petGroup = this.add.group();
  bulletGroup = this.physics.add.group();

  this.add.image(1160, 300, 'server').setScale(1.2);

  this.time.addEvent({
    delay: 2000,
    callback: () => {
      const level = Phaser.Math.Between(1, gameState.currentPhase + 1);
      const virus = new VirusBot(this, 0, Phaser.Math.Between(80, 520), level);
      virusGroup.add(virus);
    },
    loop: true
  });

  this.input.on('pointerdown', (pointer) => {
    if (gameState.selectedPet && !gameState.gameOver) {
      const pet = this.add.sprite(pointer.x, pointer.y, 'pet_level_1');
      this.physics.add.existing(pet);
      pet.attackCooldown = 0;
      pet.level = 1;
      pet.damage = 1;
      pet.kills = 0;
      petGroup.add(pet);
      gameState.coins -= gameState.petCost;
      document.getElementById('coins').innerText = '💰 Moedas: ' + gameState.coins;
      gameState.selectedPet = false;
    }
  });

  this.physics.add.overlap(bulletGroup, virusGroup, (bullet, virus) => {
    const damage = bullet.damage || 1;
    if (virus.receiveDamage(damage)) {
      bullet.origin.kills++;
      gameState.coins += 2;
      gameState.killsThisPhase++;
      document.getElementById('coins').innerText = '💰 Moedas: ' + gameState.coins;

      // Verifica se o pet sobe de nível
      if (bullet.origin.kills >= 3 && bullet.origin.level < 3) {
        bullet.origin.level++;
        bullet.origin.setTexture('pet_level_' + bullet.origin.level);
        bullet.origin.damage++;
      }

      // Progresso de fase
      if (gameState.killsThisPhase >= 10) {
        gameState.killsThisPhase = 0;
        gameState.currentPhase++;
        document.getElementById('fase').innerText = '🗺️ Fase: ' + gameState.currentPhase;
      }
    }
    bullet.destroy();
  });

  lifeText = this.add.text(20, 550, 'Integridade do Servidor: 5', {
    fontSize: '18px',
    fill: '#ffffff'
  });

  this.cameras.main.setBounds(0, 0, 1200, 600);
}

function update(time, delta) {
  virusGroup.getChildren().forEach(v => v.update());

  petGroup.getChildren().forEach(pet => {
    if (pet.attackCooldown <= 0) {
      const target = virusGroup.getChildren().find(v => Phaser.Math.Distance.Between(pet.x, pet.y, v.x, v.y) < 150);
      if (target) {
        const bullet = bulletGroup.create(pet.x, pet.y, 'bullet');
        bullet.damage = pet.damage;
        bullet.origin = pet;
        this.physics.moveToObject(bullet, target, 250);
        pet.attackCooldown = 1000;
      }
    } else {
      pet.attackCooldown -= delta;
    }
  });

  lifeText.setText('Integridade do Servidor: ' + gameState.serverLife);

  if (gameState.gameOver && !this.gameOverShown) {
    this.add.text(460, 280, '⚠️ GAME OVER ⚠️', {
      fontSize: '32px',
      fill: '#ff3333'
    });
    this.gameOverShown = true;
    this.scene.pause();
  }
}

(() => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  // --- Globale Spiel-Konstanten ---
  const TARGET_WIDTH = 800;
  const TARGET_HEIGHT = 600;
  const STAR_COUNT = 120;
  const SHIP_RADIUS = 14;
  const SHIP_THRUST = 220;
  const SHIP_FRICTION = 0.992;
  const SHIP_TURN_SPEED = Math.PI * 1.8;
  const LASER_SPEED = 520;
  const LASER_LIFE = 0.9;
  const INVULNERABLE_TIME = 2.0;
  const START_LIVES = 3;

  const ASTEROID_CONFIG = {
    large: { radius: 46, speedMin: 35, speedMax: 70, points: 20, next: "medium" },
    medium: { radius: 28, speedMin: 60, speedMax: 95, points: 50, next: "small" },
    small: { radius: 16, speedMin: 85, speedMax: 130, points: 100, next: null },
  };

  const keys = {
    left: false,
    right: false,
    thrust: false,
  };

  let stars = [];
  let lasers = [];
  let asteroids = [];
  let ship;
  let score;
  let lives;
  let gameOver;
  let spawnTimer;
  let spawnInterval;
  let lastTime = 0;

  // --- Hilfsfunktionen ---
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function wrapPosition(entity) {
    if (entity.x < -entity.radius) entity.x = canvas.width + entity.radius;
    if (entity.x > canvas.width + entity.radius) entity.x = -entity.radius;
    if (entity.y < -entity.radius) entity.y = canvas.height + entity.radius;
    if (entity.y > canvas.height + entity.radius) entity.y = -entity.radius;
  }

  function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }

  function createStars() {
    stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: rand(0.6, 2.1),
      a: rand(0.35, 0.95),
    }));
  }

  function resetShip() {
    ship = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      radius: SHIP_RADIUS,
      invulnerable: INVULNERABLE_TIME,
    };
  }

  // Erstellt einen Asteroiden am Bildschirmrand.
  function spawnAsteroid(size = "large") {
    const edge = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;

    if (edge === 0) {
      x = rand(0, canvas.width);
      y = -20;
    } else if (edge === 1) {
      x = canvas.width + 20;
      y = rand(0, canvas.height);
    } else if (edge === 2) {
      x = rand(0, canvas.width);
      y = canvas.height + 20;
    } else {
      x = -20;
      y = rand(0, canvas.height);
    }

    // Nicht direkt auf dem Schiff spawnen.
    if (ship && distance({ x, y }, ship) < 150) {
      return spawnAsteroid(size);
    }

    const cfg = ASTEROID_CONFIG[size];
    const speed = rand(cfg.speedMin, cfg.speedMax);
    const angle = Math.atan2(ship.y - y, ship.x - x) + rand(-0.8, 0.8);

    asteroids.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: cfg.radius,
      size,
      spin: rand(-1.4, 1.4),
      rotation: rand(0, Math.PI * 2),
      vertices: Array.from({ length: 11 }, () => rand(0.72, 1.28)),
    });
  }

  function splitAsteroid(asteroid) {
    const cfg = ASTEROID_CONFIG[asteroid.size];
    score += cfg.points;

    if (!cfg.next) return;

    // Zwei kleinere Asteroiden mit leicht unterschiedlicher Richtung erzeugen.
    for (let i = 0; i < 2; i += 1) {
      const newSize = cfg.next;
      const nextCfg = ASTEROID_CONFIG[newSize];
      const angle = Math.atan2(asteroid.vy, asteroid.vx) + rand(-0.9, 0.9);
      const speed = rand(nextCfg.speedMin, nextCfg.speedMax);
      asteroids.push({
        x: asteroid.x,
        y: asteroid.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: nextCfg.radius,
        size: newSize,
        spin: rand(-2.0, 2.0),
        rotation: rand(0, Math.PI * 2),
        vertices: Array.from({ length: 10 }, () => rand(0.7, 1.3)),
      });
    }
  }

  function fireLaser() {
    if (gameOver) return;

    lasers.push({
      x: ship.x + Math.cos(ship.angle) * (ship.radius + 6),
      y: ship.y + Math.sin(ship.angle) * (ship.radius + 6),
      vx: Math.cos(ship.angle) * LASER_SPEED + ship.vx * 0.4,
      vy: Math.sin(ship.angle) * LASER_SPEED + ship.vy * 0.4,
      radius: 2,
      life: LASER_LIFE,
    });
  }

  function restartGame() {
    score = 0;
    lives = START_LIVES;
    gameOver = false;
    spawnTimer = 0;
    spawnInterval = 1.6;
    lasers = [];
    asteroids = [];
    resetShip();

    for (let i = 0; i < 4; i += 1) {
      spawnAsteroid("large");
    }
  }

  function resizeCanvas() {
    // Fullscreen mit Mindestgröße für ein angenehmes Spielfeld.
    const w = Math.max(window.innerWidth, TARGET_WIDTH);
    const h = Math.max(window.innerHeight, TARGET_HEIGHT);

    canvas.width = w;
    canvas.height = h;
    createStars();
  }

  // --- Eingabe-Handling ---
  window.addEventListener("keydown", (e) => {
    if (e.code === "ArrowLeft") keys.left = true;
    if (e.code === "ArrowRight") keys.right = true;
    if (e.code === "ArrowUp") keys.thrust = true;

    if (e.code === "Space") {
      e.preventDefault();
      fireLaser();
    }

    if (e.code === "KeyR") {
      restartGame();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.code === "ArrowLeft") keys.left = false;
    if (e.code === "ArrowRight") keys.right = false;
    if (e.code === "ArrowUp") keys.thrust = false;
  });

  window.addEventListener("resize", resizeCanvas);

  // --- Update-Logik ---
  function update(delta) {
    if (gameOver) return;

    // Schiff drehen.
    if (keys.left) ship.angle -= SHIP_TURN_SPEED * delta;
    if (keys.right) ship.angle += SHIP_TURN_SPEED * delta;

    // Schub anwenden.
    if (keys.thrust) {
      ship.vx += Math.cos(ship.angle) * SHIP_THRUST * delta;
      ship.vy += Math.sin(ship.angle) * SHIP_THRUST * delta;
    }

    ship.vx *= SHIP_FRICTION;
    ship.vy *= SHIP_FRICTION;
    ship.x += ship.vx * delta;
    ship.y += ship.vy * delta;
    wrapPosition(ship);

    if (ship.invulnerable > 0) {
      ship.invulnerable -= delta;
    }

    // Neue Asteroiden spawnen.
    spawnTimer += delta;
    if (spawnTimer >= spawnInterval) {
      spawnTimer = 0;
      spawnAsteroid("large");

      // Langsam schwieriger machen.
      spawnInterval = Math.max(0.75, spawnInterval - 0.03);
    }

    // Laser bewegen und auslaufen lassen.
    lasers = lasers.filter((laser) => {
      laser.x += laser.vx * delta;
      laser.y += laser.vy * delta;
      laser.life -= delta;
      return laser.life > 0;
    });

    // Asteroiden bewegen.
    asteroids.forEach((asteroid) => {
      asteroid.x += asteroid.vx * delta;
      asteroid.y += asteroid.vy * delta;
      asteroid.rotation += asteroid.spin * delta;
      wrapPosition(asteroid);
    });

    // Laser -> Asteroid Kollision.
    for (let l = lasers.length - 1; l >= 0; l -= 1) {
      const laser = lasers[l];
      let hit = false;

      for (let a = asteroids.length - 1; a >= 0; a -= 1) {
        const asteroid = asteroids[a];
        if (distance(laser, asteroid) < laser.radius + asteroid.radius) {
          asteroids.splice(a, 1);
          splitAsteroid(asteroid);
          hit = true;
          break;
        }
      }

      if (hit) lasers.splice(l, 1);
    }

    // Schiff -> Asteroid Kollision.
    if (ship.invulnerable <= 0) {
      for (const asteroid of asteroids) {
        if (distance(ship, asteroid) < ship.radius + asteroid.radius * 0.9) {
          lives -= 1;
          ship.invulnerable = INVULNERABLE_TIME;
          ship.x = canvas.width / 2;
          ship.y = canvas.height / 2;
          ship.vx = 0;
          ship.vy = 0;

          if (lives <= 0) {
            gameOver = true;
          }
          break;
        }
      }
    }
  }

  // --- Zeichnen ---
  function drawBackground() {
    ctx.fillStyle = "#03060f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const star of stars) {
      ctx.globalAlpha = star.a;
      ctx.fillStyle = "#d7e7ff";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawShip() {
    const flicker = ship.invulnerable > 0 && Math.floor(performance.now() / 80) % 2 === 0;
    if (flicker) return;

    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);

    ctx.strokeStyle = "#f6f8ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ship.radius + 2, 0);
    ctx.lineTo(-ship.radius, ship.radius * 0.75);
    ctx.lineTo(-ship.radius * 0.65, 0);
    ctx.lineTo(-ship.radius, -ship.radius * 0.75);
    ctx.closePath();
    ctx.stroke();

    // Triebwerksflamme nur bei aktivem Schub.
    if (keys.thrust && !gameOver) {
      ctx.strokeStyle = "#ff9f40";
      ctx.beginPath();
      ctx.moveTo(-ship.radius * 0.9, 0);
      ctx.lineTo(-ship.radius - rand(10, 18), 0);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawAsteroid(asteroid) {
    ctx.save();
    ctx.translate(asteroid.x, asteroid.y);
    ctx.rotate(asteroid.rotation);

    ctx.strokeStyle = "#98a8c3";
    ctx.lineWidth = 2;
    ctx.beginPath();
    const count = asteroid.vertices.length;
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2;
      const radius = asteroid.radius * asteroid.vertices[i];
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }

  function drawLasers() {
    ctx.fillStyle = "#ff4d7a";
    lasers.forEach((laser) => {
      ctx.beginPath();
      ctx.arc(laser.x, laser.y, laser.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawHud() {
    ctx.fillStyle = "#ecf3ff";
    ctx.font = "bold 20px Trebuchet MS, Segoe UI, sans-serif";
    ctx.fillText(`Score: ${score}`, 16, 32);
    ctx.fillText(`Lives: ${lives}`, 16, 60);

    if (gameOver) {
      ctx.textAlign = "center";
      ctx.font = "bold 58px Trebuchet MS, Segoe UI, sans-serif";
      ctx.fillStyle = "#ff5b7f";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = "24px Trebuchet MS, Segoe UI, sans-serif";
      ctx.fillStyle = "#f0f4ff";
      ctx.fillText("Drücke R für Neustart", canvas.width / 2, canvas.height / 2 + 35);
      ctx.textAlign = "left";
    }
  }

  function draw() {
    drawBackground();
    drawShip();
    asteroids.forEach(drawAsteroid);
    drawLasers();
    drawHud();
  }

  function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const delta = Math.min((timestamp - lastTime) / 1000, 0.033);
    lastTime = timestamp;

    update(delta);
    draw();
    requestAnimationFrame(loop);
  }

  // --- Initialisierung ---
  resizeCanvas();
  restartGame();
  requestAnimationFrame(loop);
})();

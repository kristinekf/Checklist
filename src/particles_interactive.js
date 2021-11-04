tsParticles.load("tsparticles", {
  fpsLimit: 60,
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    },
    color: {
      value: "#ff0000",
      animation: {
        enable: true,
        speed: 10,
        sync: true
      }
    },
    shape: {
      type: ["circle", "square"]
    },
    opacity: {
      value: 0.3
    },
    size: {
      value: 20,
      random: {
        enable: true,
        minimumValue: 10
      }
    },
    rotate: {
      value: 0,
      direction: "clockwise",
      animation: {
        speed: 5,
        enable: true
      }
    },
    move: {
      enable: true,
      speed: 3,
      direction: "none",
      out_mode: "out"
    }
  },
  detectRetina: true,
  background: {
    color: "#17163e"
  }
});

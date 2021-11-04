const fps = 60;
const c1 = "#000";
const c2 = "#555";
const c3 = "#888";
const link_col = "#AAA";

tsParticles.load("tsparticles", {
  fpsLimit: fps,
  backgroundMode: {
    enable: true
  },
  particles: {
    color: {
      value: [c1, c2, c3]
    },
    links: {
      color: link_col,
      enable: true
    },
    move: {
      enable: true,
      speed: 1,
    },
    size: {
      value: 5,
      random: {
        enable: true,
        minimumValue: 2
      },
      animation: {
        enable: true,
        speed: 4,
        minimumValue: 1
      }
    },
    opacity: {
      value: .8,
      random: {
        enable: true,
        minimumValue: 0.4
      }
    }
  }
});

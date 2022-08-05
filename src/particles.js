const opts_geom = {
  fpsLimit: 48,
  particles: {
    number: {
      value: 10,
      density: {
        enable: true,
        value_area: 800
      }
    },
    color: {
      value: "#990",
      animation: {
        enable: true,
        speed: 20,
        sync: false
      }
    },
    shape: {
      type: ["circle"],
    },
    opacity: {
      value: 1.0
    },
    size: {
      value: 20,
      random: {
        enable: true,
        minimumValue: 5
      }
    },
    rotate: {
      value: 0,
      direction: "clockwise",
      animation: {
        speed: 10,
        enable: false,
      }
    },
    move: {
      enable: true,
      speed: 1,
      direction: "none",
      out_mode: "out"
    }
  },
  detectRetina: true,
  background: {
    // color: "#17163e"
    color: "black"
  }
}

const fps = 60;
const c1 = "#000";
const c2 = "#555";
const c3 = "#888";
const link_col = "#AAA";

const opts_normal = {
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
}

const opts_fireworks = {
  detectRetina: true,
  background: {
    color: "#000"
  },
  fpsLimit: 60,
  emitters: {
    direction: "top",
    life: {
      count: 0,
      duration: 0.1,
      delay: 0.1
    },
    rate: {
      delay: 0.5,
      quantity: 1
    },
    size: {
      width: 100,
      height: 0
    },
    position: {
      y: 100,
      x: 50
    }
  },
  particles: {
    number: {
      value: 0
    },
    destroy: {
      mode: "split",
      split: {
        count: 1,
        factor: { value: 1 / 3 },
        rate: {
          value: 100
        },
        particles: {
          stroke: {
            color: {
              value: ["#5bc0eb", "#fde74c", "#9bc53d", "#e55934", "#fa7921"]
            },
            width: 1
          },
          number: {
            value: 0
          },
          collisions: {
            enable: false
          },
          opacity: {
            value: 1,
            animation: {
              enable: true,
              speed: 0.6,
              minimumValue: 0.1,
              sync: false,
              startValue: "max",
              destroy: "min"
            }
          },
          shape: {
            type: "circle"
          },
          size: {
            value: 1,
            animation: {
              enable: false
            }
          },
          life: {
            count: 1,
            duration: {
              value: {
                min: 1,
                max: 2
              }
            }
          },
          move: {
            enable: true,
            gravity: {
              enable: false
            },
            speed: 2,
            direction: "none",
            random: true,
            straight: false,
            outMode: "destroy"
          }
        }
      }
    },
    life: {
      count: 1
    },
    shape: {
      type: "line"
    },
    size: {
      value: { min: 0.1, max: 50 },
      animation: {
        enable: true,
        sync: true,
        speed: 150,
        startValue: "max",
        destroy: "min"
      }
    },
    stroke: {
      color: {
        value: "#ffffff"
      },
      width: 1
    },
    rotate: {
      path: true
    },
    move: {
      enable: true,
      gravity: {
        acceleration: 15,
        enable: true,
        inverse: true,
        maxSpeed: 100
      },
      speed: { min: 10, max: 20 },
      outModes: {
        default: "destroy",
        top: "none"
      },
      trail: {
        fillColor: "#000",
        enable: true,
        length: 10
      }
    }
  }
}

export { opts_geom, opts_normal, opts_fireworks }
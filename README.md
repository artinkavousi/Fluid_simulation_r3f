# WebGL Fluid Simulation with React Three Fiber

[![Version](https://img.shields.io/badge/version-0.4.0-blue.svg)](https://github.com/artinkavousi/Fluid_simulation_r3f)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-latest-orange.svg)](https://threejs.org/)

A high-performance real-time fluid simulation using WebGL 2.0 and React Three Fiber. This project implements a stable fluid solver with advanced visual effects and interactive features.

[Live Demo](https://artinkavousi.github.io/Fluid_simulation_r3f) | [Documentation](docs/TECHNICAL.md) | [Quick Start](docs/QUICKSTART.md)

![Fluid Simulation Demo](https://raw.githubusercontent.com/artinkavousi/Fluid_simulation_r3f/main/docs/demo.gif)

## ✨ Key Features

### 🌊 Fluid Dynamics
- Real-time Navier-Stokes fluid simulation
- Temperature-driven buoyancy effects
- Vorticity confinement for detailed swirls
- Interactive mouse-based fluid manipulation

### 🎨 Visual Effects
- High-quality bloom lighting
- Chromatic aberration with radial distortion
- Velocity-based motion blur
- Kaleidoscope effect with dynamic segments
- Rainbow color cycling and blending
- Real-time color diffusion

### 🎮 Interactive Controls
- Resolution and quality settings
- Real-time parameter adjustment
- Multiple visualization modes
- Audio reactivity support

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/artinkavousi/Fluid_simulation_r3f.git

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the simulation in action!

## 📖 Documentation

- [Quick Start Guide](docs/QUICKSTART.md) - Get up and running
- [Technical Documentation](docs/TECHNICAL.md) - Deep dive into the implementation
- [API Reference](docs/API.md) - Detailed component documentation

## 🛠️ Built With

- **React** - UI framework
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **WebGL 2.0** - GPU-accelerated graphics
- **TypeScript** - Type-safe code
- **Zustand** - State management

## ⚡ Performance Tips

1. **Resolution Control**
   - Lower resolution for better performance (128-256)
   - Higher resolution for better quality (512-1024)

2. **Effect Management**
   - Disable unused effects for +20-30% performance
   - Adjust effect quality based on FPS
   - Start with bloom and add effects gradually

3. **Render Modes**
   - Use 'dye' mode for best performance
   - 'velocity' and 'pressure' modes for debugging
   - Complex effects for visual showcase

## 🌐 Browser Support

Requires WebGL 2.0 support:
- ✅ Chrome 56+
- ✅ Firefox 51+
- ✅ Safari 15+
- ✅ Edge 79+

## 🔄 Version History

### v0.4.0 (Latest)
- Enhanced fluid dynamics with temperature
- Added advanced visual effects (bloom, chromatic aberration, motion blur)
- Added kaleidoscope and rainbow effects
- Improved render mode switching
- Optimized performance and resource management

### v0.3.0
- Initial fluid simulation implementation
- Basic mouse interaction
- Simple color diffusion

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Based on [Jos Stam's Stable Fluids](http://www.dgp.toronto.edu/people/stam/reality/Research/pdf/GDC03.pdf)
- Inspired by various WebGL fluid simulations
- Built with React Three Fiber ecosystem

## 📞 Contact & Support

- Create an [issue](https://github.com/artinkavousi/Fluid_simulation_r3f/issues) for bug reports
- Star the repo if you find it useful
- Follow [@artinkavousi](https://twitter.com/artinkavousi) for updates

---
Made with ❤️ by [Artin Kavousi] 
# Quick Start Guide

## 🚀 Getting Started

### System Requirements
- Node.js v14+
- GPU with WebGL 2.0 support
- Modern web browser (Chrome 56+, Firefox 51+, Safari 15+, Edge 79+)
- 4GB RAM minimum

### Installation

1. Clone and setup:
```bash
# Clone the repository
git clone https://github.com/artinkavousi/Fluid_simulation_r3f.git

# Navigate to project directory
cd Fluid_simulation_r3f

# Install dependencies
npm install

# Start development server
npm run dev
```

2. Open `http://localhost:3000` in your browser

## 🎮 Controls

### Mouse Controls
```typescript
// Mouse interaction is handled automatically
// Move mouse to create fluid motion
// Speed affects fluid velocity
// Direction affects fluid movement
```

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `R` | Reset simulation |
| `Space` | Pause/Resume |
| `1` | Dye mode |
| `2` | Velocity mode |
| `3` | Pressure mode |
| `4` | Temperature mode |
| `5` | Rainbow mode |
| `6` | Kaleidoscope mode |
| `+` | Increase resolution |
| `-` | Decrease resolution |
| `B` | Toggle bloom |
| `C` | Toggle chromatic aberration |
| `M` | Toggle motion blur |
| `K` | Toggle kaleidoscope |

## ⚙️ Common Configurations

### High Performance
```typescript
const highPerformanceConfig = {
  resolution: 128,
  pressureIterations: 10,
  bloomStrength: 0,
  chromaticAberration: 0,
  motionBlurStrength: 0,
  kaleidoscopeSegments: 0
};
```

### Balanced
```typescript
const balancedConfig = {
  resolution: 256,
  pressureIterations: 20,
  bloomStrength: 0.5,
  chromaticAberration: 0.2,
  motionBlurStrength: 0.3,
  kaleidoscopeSegments: 0
};
```

### Visual Quality
```typescript
const visualQualityConfig = {
  resolution: 512,
  pressureIterations: 30,
  bloomStrength: 0.8,
  chromaticAberration: 0.4,
  motionBlurStrength: 0.5,
  kaleidoscopeSegments: 6
};
```

## 🎨 Render Modes

### 1. Dye Mode (Default)
Shows fluid colors and mixing
```typescript
useStore.setState({ renderMode: 'dye' });
```

### 2. Velocity Mode
Displays fluid movement
```typescript
useStore.setState({ renderMode: 'velocity' });
```

### 3. Pressure Mode
Shows pressure distribution
```typescript
useStore.setState({ renderMode: 'pressure' });
```

### 4. Temperature Mode
Visualizes heat distribution
```typescript
useStore.setState({ renderMode: 'temperature' });
```

### 5. Rainbow Mode
Dynamic color cycling
```typescript
useStore.setState({ renderMode: 'rainbow' });
```

### 6. Kaleidoscope Mode
Mirror effect visualization
```typescript
useStore.setState({ renderMode: 'kaleidoscope' });
```

## 🔧 Performance Tuning

### Resolution Scaling
```typescript
// Adjust based on performance
const resolutionScale = {
  high: 512,    // High-end GPUs
  medium: 256,  // Most devices
  low: 128      // Mobile/low-end
};
```

### Effect Quality
```typescript
// Disable effects for better performance
const performanceMode = {
  bloom: false,
  chromatic: false,
  motionBlur: false,
  kaleidoscope: false
};
```

## 🐛 Troubleshooting

### Common Issues

1. **Black Screen**
```typescript
// Check WebGL support
if (!gl.getExtension('EXT_float_blend')) {
  console.error('WebGL float blending not supported');
}
```

2. **Low FPS**
```typescript
// Reduce quality settings
useStore.setState({
  resolution: 128,
  pressureIterations: 10,
  bloomStrength: 0
});
```

3. **Visual Glitches**
```typescript
// Clear FBOs and reset state
fluidSolver.reset();
useStore.setState({ renderMode: 'dye' });
```

### Browser Support

Check WebGL 2.0 support:
```typescript
const checkSupport = () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) {
    throw new Error('WebGL 2 not supported');
  }
  return true;
};
```

## 📈 Advanced Usage

### Custom Colors
```typescript
// Add custom color splat
fluidSolver.splat(
  x, y,                    // Position
  dx, dy,                  // Velocity
  [1.0, 0.5, 0.0],        // Color (RGB)
  temperature              // Heat
);
```

### Audio Reactivity
```typescript
// Connect audio input
navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then(stream => {
    // Process audio data
    const audioContext = new AudioContext();
    const analyzer = audioContext.createAnalyser();
    // ... setup audio processing
  });
```

### Custom Effects
```typescript
// Add custom post-processing effect
const CustomEffect = () => {
  const effect = useMemo(() => new ShaderEffect({
    // ... effect configuration
  }), []);
  return <primitive object={effect} />;
};
```

## 📚 Next Steps

1. Explore the [Technical Documentation](TECHNICAL.md)
2. Check out the [API Reference](API.md)
3. Join our [Discord Community](https://discord.gg/yourdiscord)

## 🆘 Support

Need help? Try these resources:
1. [GitHub Issues](https://github.com/yourusername/Fluid_simulation_r3f/issues)
2. [Discord Community](https://discord.gg/yourdiscord)
3. [Stack Overflow](https://stackoverflow.com/questions/tagged/fluid-simulation)
# Fluid Simulation

A real-time fluid simulation using WebGL, React Three Fiber, and TypeScript. This project implements a stable fluid solver with interactive features and visual effects.

## Features

- Real-time fluid simulation using GPU-accelerated computations
- Interactive mouse control - fluid reacts to mouse movements
- Multiple emitter types (point, line, dye)
- Audio visualization (requires user interaction to start)
- Post-processing effects (bloom, chromatic aberration)
- Timeline editor for keyframe animation
- Adjustable simulation parameters

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
\`\`\`bash
git clone [repository-url]
cd fluid-simulation
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

## Running the Project

1. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

2. Open your browser and navigate to `http://localhost:3000` (or the port shown in the terminal)

## Usage

- **Mouse Interaction**: Move your mouse over the canvas to interact with the fluid
- **Control Panel**: Use the control panel on the right to adjust simulation parameters:
  - Resolution
  - Time step (dt)
  - Dye decay
  - Pressure iterations
  - Curl strength
  - Render mode (dye/velocity/pressure)
  - Background color
- **Toolbar**: Use the toolbar on the top-left to add different types of emitters:
  - Point Emitter
  - Line Emitter
  - Dye Emitter
- **Timeline**: Use the timeline at the bottom to create keyframe animations
- **Audio Visualization**: Click anywhere to start the audio visualization

## Technical Details

The simulation implements the following steps:
1. Velocity advection
2. Divergence computation
3. Pressure solving
4. Pressure gradient subtraction
5. Dye advection

All computations are performed on the GPU using WebGL shaders for maximum performance.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
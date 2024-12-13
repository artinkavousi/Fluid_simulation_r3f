Below is a comprehensive planning document and a set of instructions detailing the reasoning, steps, and considerations behind the provided codebase. This planning will help you understand how all pieces fit together and how you can run, modify, and extend the project.

---

## Planning and Reasoning

### Project Goals

1. **Stable Fluid Simulation**: Implement a stable fluid solver using a GPU-based method (advection, divergence, pressure solve, gradient subtraction, vorticity confinement, and dye advection).
2. **Inline Shaders in FluidSolver**: Include all shader code directly in the `FluidSolver.ts` file to make the solver self-contained and easier to transport or modify.
3. **Cursor Interactivity**: Allow the user's mouse movements to interact with the fluid. As the user moves the mouse over the canvas, "splats" (disturbances) are introduced into the fluid field, causing ripples and swirls.
4. **User Interface (UI)**:
   - A control panel to adjust simulation parameters (via Leva).
   - A toolbar to add emitters of different types.
   - A timeline editor to enable keyframe-based animation of emitter properties.
   - An error boundary for graceful error handling.
5. **Advanced Features**:
   - Multiple emitters (point, line, dye) to influence fluid.
   - Audio reactivity (optional), capturing frequency data from an audio file or microphone.
   - Post-processing (Bloom effect) for a polished final look.
6. **TypeScript and Three.js Integration**: Utilize React Three Fiber, Zustand for state management, and TypeScript for type safety and better code reliability.

### Architectural Overview

- **React & R3F Setup**:
  - `main.tsx` and `App.tsx` bootstrap the application.
  - `SimulationManager.tsx` creates and manages the `FluidSolver` and runs the simulation steps in a loop.
  - `CanvasView.tsx` renders a `Canvas` with React Three Fiber. This includes the interactive scene where user mouse movements cause fluid splats.
  
- **FluidSolver**:
  - A self-contained class `FluidSolver` manages all GPU resources (framebuffers, shaders), simulation steps, and utility methods (like `splat` for adding disturbances).
  - All shader code for the fluid simulation is included inline in `FluidSolver.ts`.
  - The solver steps include:
    1. Advection of velocity and dye fields.
    2. Vorticity calculation and confinement.
    3. Divergence calculation.
    4. Pressure solving via Jacobi iterations.
    5. Gradient subtraction to enforce incompressibility.
    6. Dye advection.
  - The `splat` method injects dye and velocity into the field at a given point (like a brush stroke).

- **Emitters**:
  - `PointEmitter`: A single point emitting fluid/dye.
  - `LineEmitter`: Emission along a line; endpoints draggable.
  - `DyeEmitter`: Allows painting a texture and integrating it into the fluid (shown as a placeholder but structured to be extended).
  - These are integrated into the simulation by adjusting `FluidSolver` or by directly calling its methods to add dye/velocity.

- **UI**:
  - `ControlPanel.tsx`: Uses Leva to allow real-time parameter adjustments (dt, pressure iterations, curl strength, and render mode).
  - `TimelineEditor.tsx`: Manages keyframes for emitter properties (animate color, position over time).
  - `Toolbar.tsx`: Quick buttons to add new emitters.

- **Audio Integration**:
  - `AudioEQ.tsx` and `AudioProcessor.ts`: Process audio input, store frequency data. This data can be used to modulate fluid parameters (e.g., curlStrength) for audio-reactive visuals.

- **State Management (Zustand)**:
  - `useStore.ts`: Holds global simulation parameters, emitter configurations, timeline keyframes, and UI states. The solver reads these states to run the simulation and apply changes over time.
  
- **Mouse Interactivity**:
  - `CanvasView.tsx` hooks into R3F's pointer events. `onPointerMove` retrieves the mouse position (in normalized device coordinates), then calls `solverRef.current?.splat(...)` to disturb the fluid at that point.
  - A random color and a fixed radius are currently used, but this can be adjusted to depend on velocity, audio data, or user settings.

- **Error Boundary**:
  - `ErrorBoundary.tsx`: Wraps the entire app to catch runtime errors and display a friendly message instead of a blank screen.

- **Performance Considerations**:
  - Linear filtering and clamp-to-edge wrapping for FBOs ensure stable numerical methods.
  - Only the necessary steps are run each frame.
  - Advection uses a semi-Lagrangian method for stability.
  - The code uses `requestAnimationFrame` loops for smooth animation.
  - Removing unnecessary console logs and adding type checking with TypeScript ensure fewer runtime errors and better maintainability.

### Instructions and Setup

1. **Prerequisites**:
   - Node.js and npm (or yarn) installed.
   - A bundler setup that supports TypeScript, React, and GLSL imports (e.g., Vite or CRA with an appropriate GLSL plugin).
   - Dependencies:
     ```
     npm install react react-dom three @react-three/fiber @react-three/drei zustand leva @react-three/postprocessing typescript @types/react @types/react-dom vite-plugin-glsl
     ```
   
2. **Project Structure**:
   - Follow the directory structure as provided.
   - `FluidSolver.ts` now contains all shader strings inline.
   - Place `music.mp3` in `public/audio/music.mp3` if you want to test audio reactivity.

3. **Running the Project**:
   - If using Vite, add `vite-plugin-glsl` to your Vite config to handle GLSL imports (not needed now since we inlined shaders).
   - Run `npm start` (or `npm run dev` with Vite) to start the development server.
   - Open `http://localhost:3000` (or `http://localhost:5173` for Vite) in your browser.

4. **Interacting**:
   - Move your mouse over the canvas; the fluid will react to your cursor (splats of color).
   - Use the Control Panel (Leva UI) to change simulation parameters.
   - Click "Add Point Emitter" or "Add Line Emitter" in the Toolbar to add new emitters. Drag line endpoints to reshape line emitters.
   - Click "Add Test Keyframes" in the Timeline Editor to see color changes of an emitter over time.
   - If you have audio playing, the `AudioEQ` component shows a placeholder. You can integrate the audio data into `FluidSolver.step` or `onPointerMove` to modulate behavior.

5. **Modifications**:
   - To change the splat radius or color: edit `onPointerMove` in `CanvasView.tsx`.
   - To integrate audio data into fluid properties: read `useStore.getState().audioData` in `FluidSolver` or `SimulationManager` and adjust parameters like `curlStrength`.
   - To add textures or gradient maps: Extend `ColorProgram` or add uniforms/shaders as needed.

6. **Further Extensions**:
   - Add a UI selector for brush radius or splat color for mouse interaction.
   - Enhance the DyeEmitter to truly paint on a hidden canvas and feed it into fluid fields.
   - Implement collision boundaries or complex shapes by introducing obstacle masks in the solver.
   - Record frames to create video outputs of the simulation.

### Troubleshooting

- **WebGL Errors**:  
  If shaders fail to compile, check the inline shader code for typos or syntax issues.
- **Performance Issues**:  
  Lower resolution (in `useStore`, `resolution`) to improve performance on weaker machines.
- **No Reaction to Mouse**:  
  Ensure that `onPointerMove` is firing. Check the console for errors. Make sure `splat` is being called and that the solver is running (`solverRef.current` is not null).

---

## Summary

This plan and set of instructions explain the architecture, rationale, and usage of the provided code. By following this guidance, you can run the project successfully, understand its internals, and extend it for more complex fluid behaviors, advanced UI controls, or custom visualization effects.

With this reference, you have both the full codebase and a thorough understanding of how all parts interact, from the low-level shader operations in `FluidSolver` to the user input handling in `CanvasView`, and the global state management in `useStore`.
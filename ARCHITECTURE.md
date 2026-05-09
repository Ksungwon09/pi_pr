# Architecture and Implementation Study: Visualizing Pi (π)

## Overview
This document outlines the architecture, technology stack, and implementation plan for a web application dedicated to visualizing the mathematical constant π (Pi). The application will serve as an educational and interactive platform, demonstrating various methods of calculating Pi and offering engaging activities involving its digits.

## Technology Stack Justification
*   **Core Framework**: React.js
    *   *Reason*: React's component-based architecture perfectly aligns with the requirement to "develop each one as a separate unit to minimize the risk of errors". It allows state management for interactive visualizations (like stepping through an algorithm or rendering dynamic charts).
*   **Language**: TypeScript
    *   *Reason*: Provides static typing, which reduces runtime errors and makes the codebase robust, especially when dealing with complex mathematical algorithms and data structures.
*   **Build Tool**: Vite
    *   *Reason*: Offers an extremely fast development server and optimized build process, providing a smooth developer experience compared to Create React App or Webpack.
*   **Styling**: Tailwind CSS
    *   *Reason*: Utility-first CSS framework allows for rapid UI development without context switching, ensuring a consistent and responsive design across all visualization components.
*   **Visualization Library**: HTML5 Canvas API / SVG (Native React)
    *   *Reason*: For algorithms like Monte Carlo or Archimedes' polygons, direct control over the rendering loop via Canvas or SVG is crucial for performance and fine-grained visual feedback. We will use native Canvas/SVG via React refs to minimize external dependency overhead.
*   **Data Handling**: Pre-computed JSON or raw text files for Pi digits.
    *   *Reason*: To support "Fun with Pi" (searching for numbers), loading the first million digits of Pi statically is more reliable and faster than relying on an external API that might rate-limit or go down.

## Web Architecture
*   **Client-Side SPA (Single Page Application)**: The application will be a static SPA. Since the visualizations require high interactivity and do not rely on a backend database (other than static files for Pi digits), a client-side architecture is optimal.
*   **Component Structure**:
    *   `App Shell`: Manages routing/navigation between different Pi visualizations.
    *   `Visualization Container`: A generic wrapper that provides a consistent layout (Title, Explanation, Interactive Viewport, Controls).
    *   `Specific Units`: Independent visualization modules (e.g., `MonteCarloVisualization`, `ArchimedesVisualization`).

## Layout Plan
1.  **Header/Navigation**: A top bar allowing users to switch between different visualization methods and "Fun with Pi".
2.  **Main Content Area**:
    *   **Left Column (or Top Section on Mobile)**: Interactive Visualization (Canvas/SVG).
    *   **Right Column (or Bottom Section on Mobile)**:
        *   **Title**: Name of the method.
        *   **Explanation**: Brief, clear explanation of the mathematical principle.
        *   **Controls**: Buttons to Start/Stop/Step the algorithm, adjust speed, or change parameters (e.g., number of points/polygons).
        *   **Live Output**: Display the current estimated value of Pi and the error margin.

## What to Create: Visualization Units

### 1. The Monte Carlo Method
*   **Concept**: Randomly scatter points in a square that circumscribes a quarter-circle. The ratio of points inside the circle to the total points approximates π / 4.
*   **Implementation Details**:
    *   HTML5 Canvas to draw the square and arc.
    *   Use `requestAnimationFrame` to rapidly draw random points (red if inside, blue if outside).
    *   Real-time update of the equation: `π ≈ 4 * (Points in Circle / Total Points)`.

### 2. Gregory-Leibniz Infinite Series
*   **Concept**: `π = 4/1 - 4/3 + 4/5 - 4/7 + 4/9 - ...`
*   **Implementation Details**:
    *   A dynamic line chart (or a visual number line) showing the value oscillating and slowly converging towards 3.14159...
    *   Controls to adjust the number of iterations or jump to a high number (since it converges very slowly).

### 3. Archimedes' Polygon Approximation
*   **Concept**: Inscribe and circumscribe regular polygons around a circle. As the number of sides increases, the perimeter of the polygons approaches the circumference of the circle.
*   **Implementation Details**:
    *   SVG rendering of a circle with inner and outer polygons.
    *   A slider to increase the number of sides (n) from a hexagon (n=6) to a 96-sided polygon (what Archimedes used) and beyond.
    *   Display the upper and lower bounds of Pi calculated from the perimeters.

### 4. "Fun with Pi" (Search in Pi)
*   **Concept**: Find personal numeric sequences (birthdays, phone numbers) within the digits of Pi.
*   **Implementation Details**:
    *   Load a static text file containing the first 1,000,000 digits of Pi.
    *   An input field for the user to type a numeric string.
    *   A string matching algorithm (e.g., basic `indexOf`) to find the position.
    *   A visual display highlighting the matched sequence surrounded by neighboring digits.

## Summary
This architecture prioritizes modularity. By developing each visualization as a standalone React component, we ensure that the complex logic of one algorithm (like Archimedes) does not interfere with another (like Monte Carlo). The use of Vite and Tailwind guarantees a fast, modern development workflow and a responsive, clean user interface.

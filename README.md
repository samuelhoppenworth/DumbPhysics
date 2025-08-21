# DumbPhysics




## What is DumbPhysics:

DumbPhysics is a basic mechanics simulator that allows students to explore concepts taught in class through custom scenarios and simulations. Users are able to interact with the interface by adding new objects to the simulator and editing their properties.
 

<b><a href="https://dumb-physics.vercel.app/">Try DumbPhysics</a></b> – no download necessary.


## Technical Architecture:

<img width="597" alt="Screenshot 2024-05-03 at 12 58 39 PM" src="https://github.com/CS222-UIUC-SP24/group-project-team-69/assets/46136202/b0118c0b-c8b4-4ef5-b32d-82347377e37d">





## Environment Setup:
1.  **Install Dependencies:**
    Clone the repository and install the necessary development packages.
    ```bash
    git clone https://github.com/samuelhoppenworth/DumbPhysics.git
    cd DumbPhysics
    npm install
    ```

2.  **Build the Project:**
    Compile the TypeScript source code and copy static files into a distributable `dist` folder.
    ```bash
    npm run build
    ```

3.  **Run the Local Server:**
    Serve the contents of the `dist` folder using a local web server. This command will also automatically open the project in your default browser.
    ```bash
    npx live-server dist
    ```
	

## Developers:

- **Navid**: Developed overall framework.
- **Sam**: Added object properties editing. Added gravity toggling. Deployed live link.
- **Anuprova**: Added functionality to connect user interface to simulation engine and graphics by adding buttons to add new items to the simulation. 
- **Hozaifa**: Added color functionality, debugging other errors






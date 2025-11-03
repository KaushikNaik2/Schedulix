#!/bin/bash

# This script runs both the Spring Boot backend and the React frontend
# by opening them in separate, new terminal windows.

echo "Starting Schedulix Development Environment..."

# 1. Start the Spring Boot Backend (on port 8080)
# We use 'gnome-terminal' (common on Ubuntu) to open a new window.
# It will 'cd' into the backend folder, set a title, and run the mvn command.
# 'exec bash' keeps the window open if the server crashes, so you can read the error.
echo "Starting Backend (Spring Boot)..."
gnome-terminal --title="Schedulix BACKEND (Java)" -- bash -c "cd schedulix-backend && mvn spring-boot:run; exec bash"

# 2. Start the React Frontend (on port 5173)
# We wait 5 seconds to let the backend start up first (optional)
echo "Waiting 5 seconds for backend..."
sleep 5
echo "Starting Frontend (Vite)..."
gnome-terminal --title="Schedulix FRONTEND (Vite)" -- bash -c "cd schedulix-fronntend && npm run dev; exec bash"

echo "All servers are launching in new windows!"
``
### 2. How to Use the Script


#1.  **Save the file:** Save the code above as `start-dev.sh` inside your `~/Documents/Schedulix/` directory.
#2.  **Make it executable:** Open your terminal and go to that directory. You only need to do this *once*.
#    ```bash
 #   cd ~/Documents/Schedulix
  #  chmod +x start-dev.sh
   # ```
#3.  **Run the script:** From now on, just run this one command to start everything:
 #   ```bash
  #  ./start-dev.sh


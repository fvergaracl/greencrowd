const axios = require("axios");
const fs = require("fs");

// Load configuration
const config = JSON.parse(fs.readFileSync("config_testing_creation_game.json", "utf8"));

const API_URL = config.api_url;
const BEARER_TOKEN = config.token_bearer;
const GAME_ID = config.existing_game_id; // Asegúrate de tener esta nueva propiedad en el JSON
const POI_TASKS = config.poi_and_task;

const headers = {
  Authorization: `Bearer ${BEARER_TOKEN}`,
  "Content-Type": "application/json",
  Accept: "application/json",
};

// Function to create tasks for each POI
async function createTasks(gameId) {
  for (const poi of POI_TASKS) {
    for (const taskId of poi.TASKS) {
      if (!poi.latitude || !poi.longitude) {
        console.error(`❌ Missing latitude/longitude for POI: ${poi.POI}`);
        continue;
      }

      try {
        const externalTaskId = `POI_${poi.POI}_Task_${taskId}`;
        const response = await axios.post(
          `${API_URL}/games/${gameId}/tasks`,
          {
            externalTaskId,
            strategyId: "greencrowdStrategy",
            params: [
              { key: "latitude", value: poi.latitude },
              { key: "longitude", value: poi.longitude },
            ],
          },
          { headers }
        );

        console.log(`✅ Task Created: ${response.data.externalTaskId}`);
      } catch (error) {
        console.error(
          `❌ Error creating task for POI ${poi.POI}:`,
          error.response ? error.response.data : error.message
        );
      }
    }
  }
}

// Main execution
(async () => {
  if (!GAME_ID) {
    console.error("❌ Missing existing_game_id in config file.");
    process.exit(1);
  }
  await createTasks(GAME_ID);
})();

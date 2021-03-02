import dotenv from "dotenv";

// Add required environmental variables to this array
const requiredEnvironmentalVariables = [
  "SLACK_APP_TOKEN",
  "SLACK_CHANNEL_ID",
  "MESSARI_API_KEY",
  "COIN_MARKETCAP_API_KEY",
];

export function checkEnvironmentalVariables(): void {
  dotenv.config(); // checks your .env file at the top level of your project -- Define your env-vars in that file
  let isMissingEnvVar = false;

  requiredEnvironmentalVariables
    .filter((environmentalVariable) => {
      if (
        process.env[environmentalVariable] === "" ||
        !process.env[environmentalVariable]
      ) {
        isMissingEnvVar = true;
        return true;
      }
      return false;
    })
    .forEach((missingEnvVar) => {
      console.log("\x1b[31m", `${missingEnvVar} env-var is missing`, "\x1b[0m");
    });

  if (isMissingEnvVar) {
    console.log(
      "\x1b[31m",
      "Missing required env-vars to run this application.\n Please edit/create a .env file with the specified missing env-vars",
      "\x1b[0m"
    );
    throw new Error(
      "Missing required env-vars to run this application. Please edit/create a .env file with the specified missing env-vars"
    );
  }
}

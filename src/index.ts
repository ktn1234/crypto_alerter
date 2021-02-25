// npm imports
import dotenv from "dotenv";
import { WebClient } from "@slack/web-api";

// Local Imports
import { major_crypto } from "./const/crypto_currency_symbol";
import { crypto_messari_etl } from "./etl/crypto_etl";
import { getMessariCryptoData } from "./crypto_api/messari";
import {
  postCrytoAlertsToSlack,
  postCrytoAlertsToSlackRecursiveTimeout,
} from "./util/post_to_slack";

/**
 * Inject the following environment variables specified in .env with dotenv library:
 *
 * SLACK_APP_TOKEN
 * SLACK_CHANNEL_ID
 *
 * ANY CYRPTO API KEYS
 *
 */
const result = dotenv.config();
if (result.error) {
  throw result.error;
}

const slack_app_token: string = process.env.SLACK_APP_TOKEN as string;
const slack_channel_id: string = process.env.SLACK_CHANNEL_ID as string;

// assign api key variables here
const messari_api_key: string = process.env.MESSARI_API_KEY as string;
const coin_marketcap_api_key: string = process.env
  .COIN_MARKETCAP_API_KEY as string;

if (require.main === module) {
  const slack_client: WebClient = new WebClient(slack_app_token);
  const now: Date = new Date();

  /**
   * you will define your interested crypto tickers,
   * the function for returning the JSON data via a crypto API,
   * and the ETL function to process the JSON crypto data
   *
   * @crypto_tickers - defined and import from src/const/crypto_currency_symbol.ts
   * @crypto_source_func - defined and import from src/crypto_api/*.ts
   * @api_key - define api key for crypto_source_func to get the data
   * @etl_func - defined and import from src/etl/crypto_etl.ts
   */
  const crypto_tickers: Array<string> = major_crypto;
  const crypto_source_func: Function = getMessariCryptoData;
  const api_key: string = messari_api_key;
  const etl_func: Function = crypto_messari_etl;

  // Use when running on crontab
  // postCrytoAlertsToSlack(
  //   slack_client,
  //   crypto_tickers,
  //   crypto_source_func,
  //   api_key,
  //   etl_func,
  //   slack_channel_id,
  //   now
  // );

  // Use when running without crontab
  const timeout_time = 60000 * 60; // in ms
  postCrytoAlertsToSlackRecursiveTimeout(
    slack_client,
    crypto_tickers,
    crypto_source_func,
    api_key,
    etl_func,
    slack_channel_id,
    now,
    timeout_time
  );
}

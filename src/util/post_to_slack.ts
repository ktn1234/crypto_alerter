import { WebClient } from "@slack/web-api";
import { CryptoDataFunction, EtlFunction } from "../const/custom_types";

export function postCrytoAlertsToSlack(
  slack_client: WebClient,
  crypto_tickers: Array<string>,
  crypto_source_func: CryptoDataFunction,
  api_key: string,
  etl_func: EtlFunction,
  slack_channel_id: string,
  now: Date
): Promise<any> {
  return Promise.all(
    crypto_tickers.map((crypto_ticker) => {
      // gets data from crypto API source
      return crypto_source_func(crypto_ticker, api_key);
    })
  ).then((data: any) => {
    // Transform data after processing it in crypto_etl function
    const transformed_data: Array<any> = data.map((crypto_data) => {
      return etl_func(crypto_data);
    });

    // Create crypto alert body
    const crypto_alert_body: string = `${transformed_data.reduce(
      (acc, curr) => {
        return acc + curr;
      },
      ""
    )}`.concat(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);

    // Send crypto alert message to slack channel
    return slack_client.chat
      .postMessage({
        text: crypto_alert_body,
        channel: slack_channel_id,
      })
      .then((result) => {
        // The result contains an identifier for the message, `ts`.
        console.log(
          `${now.toLocaleDateString()} ${now.toLocaleTimeString()} -- Successfully sent crypto alert message to slack.`
        );
      })
      .catch((err) => {
        console.error(
          `${now.toLocaleDateString()} ${now.toLocaleTimeString()} -- ${err}`
        );
        console.error("Terminating process...");
        process.exit(1);
      });
  });
}

export function postCrytoAlertsToSlackRecursiveTimeout(
  slack_client: WebClient,
  crypto_tickers: Array<string>,
  crypto_source_func: CryptoDataFunction,
  api_key: string,
  etl_func: EtlFunction,
  slack_channel_id: string,
  now: Date,
  timeout_time: number
): Promise<any> {
  return postCrytoAlertsToSlack(
    slack_client,
    crypto_tickers,
    crypto_source_func,
    api_key,
    etl_func,
    slack_channel_id,
    now
  ).then(() => {
    setTimeout(() => {
      postCrytoAlertsToSlackRecursiveTimeout(
        slack_client,
        crypto_tickers,
        crypto_source_func,
        api_key,
        etl_func,
        slack_channel_id,
        new Date(),
        timeout_time
      );
    }, timeout_time);
  });
}

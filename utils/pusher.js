const Pusher = require("pusher");

let pusher = null;

function getPusherClient() {
  if (pusher) {
    return pusher;
  }

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    return null;
  }

  pusher = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return pusher;
}

async function triggerQueueUpdate(payload) {
  try {
    const client = getPusherClient();

    if (!client) {
      console.log("Pusher credentials missing. Queue update simulated.");
      console.log(payload);

      return {
        status: "Simulated",
        error: "Pusher credentials missing",
      };
    }

    await client.trigger("equeue-channel", "queue-updated", payload);

    return {
      status: "Sent",
      error: "",
    };
  } catch (error) {
    console.log("Pusher trigger failed:", error.message);

    return {
      status: "Failed",
      error: error.message,
    };
  }
}

module.exports = {
  triggerQueueUpdate,
};

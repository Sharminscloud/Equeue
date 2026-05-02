function padQueueNumber(queueNumber) {
  return String(queueNumber).padStart(3, "0");
}

function formatTokenNumber({ isPriority, queueNumber }) {
  const prefix = isPriority ? "P" : "N";
  return `${prefix}${padQueueNumber(queueNumber)}`;
}

function generateTokenCode(isPriority, queueNumber) {
  return formatTokenNumber({
    isPriority,
    queueNumber,
  });
}

module.exports = {
  formatTokenNumber,
  generateTokenCode,
};

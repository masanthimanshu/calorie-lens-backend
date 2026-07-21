const time = () => new Date().toISOString();

export const logger = {
  // log info messages to cloudwatch logs
  info(msg, data) {
    console.log(
      JSON.stringify({
        ...data,
        time: time(),
        message: msg,
        level: "✅ INFO",
      }),
    );
  },

  // log error messages to cloudwatch logs
  error(msg, data) {
    console.error(
      JSON.stringify({
        ...data,
        time: time(),
        message: msg,
        level: "❎ ERROR",
      }),
    );
  },
};

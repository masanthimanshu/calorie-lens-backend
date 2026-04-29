const time = () => new Date().toISOString();

export const logger = {
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

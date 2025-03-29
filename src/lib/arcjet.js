import arcjet, {
  detectBot,
  protectSignup,
  shield,
  slidingWindow,
  validateEmail,
} from "@arcjet/next";

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    //protecting the signup form
    protectSignup({
      email: {
        mode: "LIVE",
        block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
      },
      bots: {
        mode: "LIVE",
        allow: [],
      },
      rateLimit: {
        mode: "LIVE",
        interval: "15m",
        max: 500,
      },
    }),
  ],
});

export const loginRules = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    validateEmail({
      mode: "LIVE",
      block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    }),
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
    // slidingWindow({
    //   mode: "LIVE",
    //   interval: "30m",
    //   max: 800,
    // }),
  ],
});

export const postBlogRules = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
    shield({ mode: "LIVE" }),
  ],
});

export default aj;

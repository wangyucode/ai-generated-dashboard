import { createConsola } from "consola";

const logger = createConsola({
  level: process.env.NODE_ENV === "production" ? 3 : 4, // 3: info, 4: debug
});

export default logger;

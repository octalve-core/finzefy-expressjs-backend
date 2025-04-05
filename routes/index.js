import userRouter from "./userRoutes/index.js"
import businessRouter from "./businessRoutes/index.js"

const router = (app) => {
  app.use("/api/v1/user", userRouter)
  app.use("/api/v1/business", businessRouter)
}

export default router
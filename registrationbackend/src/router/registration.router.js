import { Router } from "express"
import { NewRegistrationfrom  } from "../controller/regitstration.controller.js"
const router = Router()

router.post("/",NewRegistrationfrom)



export default router
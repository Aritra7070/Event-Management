import {Router} from "express"
import { NewEventCreation } from "../controller/newevent.controller.js"
const router=Router()

router.post("/",NewEventCreation)

export default router
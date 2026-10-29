import {Router} from "express"
import { Health_check } from "../controller/healthcheck.controller.js"
const router=Router()
router.get("/",Health_check)
export default router
import dotenv from "dotenv"
dotenv.config({ path: "../.env" })

import express from "express"
import new_event_creation from "./router/newevent.router.js"
import new_registration from "./router/registration.router.js"
import healthcheck from "./router/healthcheck.router.js"

const app=express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))


app.use("/api/v1/neweventcreation",new_event_creation)

app.use("/api/v1/newregistration",new_registration)
app.use("/api/v1/healthcheck",healthcheck)

app.get("/",(req,res)=>{
    res.send("Server is running")
})



const PORT=process.env.PORT ||8000
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)

})


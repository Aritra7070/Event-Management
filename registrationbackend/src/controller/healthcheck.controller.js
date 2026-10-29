
const Health_check= async (req,res) =>{
    try{

        return res.status(200).json({
            msg: "Server is running"
        })
    }
    catch(error){
        console.error("Server is not running", error);
        return res.status(500).json({
            msg: "Server is not running"
        })
    }
}

export { Health_check }
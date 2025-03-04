const Availability = require("../models/Availability");


const createAvalability = async (req, res) =>{
    const {startTime, endTime } = req.body;
    try{
        const availability = new Availability({professor: req.user.id, startTime,endTime});
        await availability.save();

        res.json({availability});

    } catch(err){
        res.status(500).send("server error");
    }

};

const getAvalability = async(req, res) =>{
    try{
        const availabilities = await Availability.fine({ professor: req.params.professorId, isAvailable: true});

        res.json({availabilities});

    } catch (err){
        res.status(500).send("server error");
    }

};

module.exports = { createAvalability, getAvalability};
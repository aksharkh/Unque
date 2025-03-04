const Availability = require("../models/Availability");
const Appointment = require("../models/Appointment");
const mongoose = require("mongoose");

const createAppointment = async (req, res)=>{
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const {availabilityId} = req.body;
        const availability = await Availability.findById(availabilityId).session(session);

        if(!availability || !availability.isAvailable){
            await session.abortTransaction();
            return resizeBy.status(400).json({msg:"slot not available"});
        }

        const appointment = new Appointment({student:req.user.id,professor:availability.professor,availability:availabilityId});

        await appointment.save({session});

        availability.isAvailable = false;
        await availability.save({session});
        await session.commitTransaction();


        res.json({appointment});
    } catch(err){
        await session.abortTransaction();
        res.status(500).send("server error");
    } finally{
        session.endSession();
    }
};



const cancelAppointment = async() =>{
    try{

    }catch{

    }
};

const getAppointment = async() =>{
    try{

    } catch{

    }

};

module.exports = {createAppointment,cancelAppointment,getAppointment};
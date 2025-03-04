const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const register = async (req, res) =>{
    const { email, password, role} = req.body;
    try{
        let user = await User.findOne({ email});
        if(user) return res.status(400).json({msg: "user already exists"});

        user = new user({email,password,role});
        const salt = await bcrypt.getSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = {id: user.id, role: user.role};
        const token = jwt.sign(payload, process.env.JWT_SCRET, {expiresIn:"1h"});


        res.json({ token});


    } catch(err){
        res.status(500).send("server error");
    }

};

const login = async (req, res)=>{
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user)
            return res.status(400).json({msg:"invalid email"});

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch)
            return res.status(400).json({msg: "invalid password"});

        res.json({token});


    } catch(err){
        res.status(500).send("server");
        
    }

};

module.exports = { register, login};
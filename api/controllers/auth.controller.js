import Role from "../models/Role.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";
import { CreateSuccess } from "../utils/success.js";

export const register= async (req,res,next)=>{
   //return next(createError(500,"My custom error"));

    const role = await Role.find({role:'User'});
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password,salt);
    const newUser= new User({
        firstName:req.body.firstname,
        lastName:req.body.lastname,
        email:req.body.email,
        password:hashPassword,
        roles:role,
    });
    await newUser.save();
    return next(CreateSuccess(200,"user register"));
     
}

export const registerAdmin = async (req,res,next)=>{
     const role = await Role.find({});
     const salt = await bcrypt.genSalt(10);
     const hashPassword = await bcrypt.hash(req.body.password,salt);
     const newUser= new User({
         firstName:req.body.firstname,
         lastName:req.body.lastname,
         email:req.body.email,
         password:hashPassword,
         isAdmin:true,
         roles: role
     });
     await newUser.save();
     return next(CreateSuccess(200,"Admin register"));
     
 }

export const login = async (req,res,next)=>{
    try {
        const user= await User.findOne({email:req.body.email})
        .populate("roles","role");

        const{roles}=user;

        if(!user){
            return next(createError(404,"User not found"));
        }   
        const isPasswordCorrect = await bcrypt.compare(req.body.password,user.password);
        if(!isPasswordCorrect){
            return next(createError(400,"Password is incorrect"));
        }
        const token =jwt.sign(
            {id:user._id,isAdmin:user.isAdmin,roles:roles},
            process.env.JWT_SECRET
        )
        //return next(CreateSucces(200,"Login success"));
            res.cookie("access_token", token , {httpOnly:true})
            .status(200)
            .json({
                status:200,
                message:"login success",
                data:user
            })
    } catch (error) {
        return next(createError(500,"wrong"));
    }
}
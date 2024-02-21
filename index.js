import { config } from "dotenv";
import express from "express";
import { initiateApp } from "./src/initiateApp.js";
config({path:"./config/dev.config.env"})

let app = express()
initiateApp(app,express)
import express from "express";
import {ctlLog} from '../controllers/auth.controller.js'
const router = express.Router();

router.post("/", ctlLog)

export {router};
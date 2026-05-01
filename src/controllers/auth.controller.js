import {loginUser} from '../services/auth.service.js';

const ctlLog = async (req, res) => {
  try{

    const {email, pass} = req.body;

    const result = await loginUser(email, pass);

    res.status(200).json(result)

  }catch(error){
    res.status(404).json({msg: error.message})
  }
}

export {ctlLog}
import React, {useState} from "react"
import { useNavigate } from "react-router-dom";
import Mapa from './Mapa';
import FileUpload from './upload'
import VideoCall from "./VideoCall";
import { Button } from "@material-ui/core";

export const CallPublic = (props) => {
  const [inCall, setInCall] = useState(true);
  

  return (
    <div className="container" id="sesion-box">
  {inCall ? (
        <VideoCall setInCall={setInCall} />
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setInCall(true)}
        >
          Join Call
        </Button>
      )}
  </div>
  )
}


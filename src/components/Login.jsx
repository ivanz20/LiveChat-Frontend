import React, {useState} from "react"
import { useNavigate } from "react-router-dom";
import Mapa from './Mapa';
import FileUpload from './upload'
import VideoCall from "./VideoCall";
import { Button } from "@material-ui/core";

export const Login = (props) => {
  const [inCall, setInCall] = useState(false);



  const navigate = useNavigate();

  const [dataLogin,setDataLogin] = useState({
    email : '',
    password : ''
  });
  

  async function loginUser(credentials) {
    return fetch('http://localhost:8080/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
      .then(data => data.json())
   }


  const handleSubmit = async (e) =>{
      e.preventDefault();
      const email = dataLogin.email;
      const password = dataLogin.password;
      try{
        const res = await loginUser({
          email,
          password
        });
        console.log(res);
        //variables de sesion
        sessionStorage.setItem("email_logged",res.email);
        sessionStorage.setItem("password_logged",res.password);
        sessionStorage.setItem("id_logged",res.id);
        sessionStorage.setItem("names_logged",res.nombres);
        sessionStorage.setItem("lastnames_logged",res.apellidos);
        sessionStorage.setItem("foto_logged",res.fotoperfil);
        sessionStorage.setItem("username_logged",res.username);


        navigate('/mensajes')
      }catch(err){
        alert("Error en credenciales");
      }
  }


  return (
    <div className="container" id="sesion-box">
    <div className="row" style={{height: '100%'}}>
      <div className="col-7" id="foto-login" >
        <h1>Conecta con tu equipo.</h1>
      </div>
      <div className="col-5">
        <div id="form-login">
          <h2>Inicio de Sesión</h2>
          <p>Bienvenido, por favor ingresa tus credenciales para entrar a tu cuenta.</p>
          <form onSubmit={handleSubmit}>
            <input value={dataLogin.email} onChange={(e)=>setDataLogin({...dataLogin,"email": e.target.value})} type="email" placeholder="Correo Electronico" />
            <input value={dataLogin.pass} onChange={(e)=>setDataLogin({...dataLogin,"password": e.target.value})} type="password" placeholder="Contraseña" />
            <button  type="submit">Ingresar</button>
          </form>
          <button onClick={() => navigate("/registro")}>Registrarse</button>
        </div>
      </div>
    </div>

 
  </div>
  )
}


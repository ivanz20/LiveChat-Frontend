import React, {useState} from "react"
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const Register =(props) =>{

    const navigate = useNavigate();

    const [userData,setUserData] = useState({
        nombres:'',
        apellidos:'',
        email:'',
        password:'',
        fotoperfil:'',
        username:''
    });


    const handleSubmit = async (e) =>{
      e.preventDefault();
      var fotoaux = userData.fotoperfil;
      const fotoarray = fotoaux.split('\\');
      var position = fotoarray.length;
      let fotoSave = fotoarray[position-1];

      var usernameaux = userData.email;
      const usernamearray = usernameaux.split('@');
      let usernamenew = usernamearray[0];

      try{
        await axios.post("http://localhost:8080/api/users",{
            nombres:userData.nombres,
            apellidos:userData.apellidos,
            email:userData.email,
            password:userData.password,
            fotoperfil: fotoSave,
            username: usernamenew
        });
        alert("Usuario Registrado");
        navigate("/");
      }catch(err){
        alert(err);
      }
    }

    return (
        <div className="container" id="sesion-box">
            <div className="row" style={{height: '100%'}}>
                <div className="col-7" id="foto-login" >
                    <h1>Conecta con tu equipo.</h1>
                </div>
                <div className="col-5">
                    <div id="form-signin">
                        <h2>Registro</h2>
                        <form onSubmit={handleSubmit}>
                        <input value={userData.email} onChange={(e) => setUserData({...userData,"email": e.target.value})} type="email" placeholder="Correo Electronico" required/>
                            <input value={userData.pass} onChange={(e) => setUserData({...userData,"password": e.target.value})} type="password" placeholder="Contraseña" required/>
                            <input value={userData.nombre} onChange={(e) => setUserData({...userData,"nombres": e.target.value})} type="text" placeholder="Nombre(s)" required/>
                            <input value={userData.apellidos} onChange={(e) => setUserData({...userData,"apellidos": e.target.value})} type="text" placeholder="Apellido(s)" required/>
                            <div className="custom-file">
                                <input type="file" value={userData.fotoperfil} onChange={(e) => setUserData({...userData,"fotoperfil": e.target.value})} className="custom-file-input" id="inputGroupFile01" aria-describedby="inputGroupFileAddon01" />
                                <label className="custom-file-label" htmlFor="inputGroupFile01"><strong>Elige tu foto de perfil</strong></label>
                            </div>
                            <br></br>
                            <button  type="submit">Registrarse</button>
                        </form>
                        <button onClick={() => navigate("/")} >Regresar</button>
                    </div>
                </div>
            </div>
        </div> 
    )
}
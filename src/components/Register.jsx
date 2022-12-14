import { useNavigate } from "react-router-dom";
import axios from 'axios'
import { getStorage,ref,uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";
import React, { useEffect, useState, useRef,useLayoutEffect } from 'react'


const firebaseConfig = ({
    apiKey: "AIzaSyC7T3KdfTQ-jRHafC-u0CMtRfdSZwHNfgA",
    authDomain: "archivos-poi.firebaseapp.com",
    databaseURL: "https://archivos-poi-default-rtdb.firebaseio.com",
    projectId: "archivos-poi",
    storageBucket: "archivos-poi.appspot.com",
    messagingSenderId: "56109750421",
    appId: "1:56109750421:web:60d65df59955e3dd51639c"
  });
  
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);

export const Register =(props) =>{

    const inputFile = useRef(null) 


    const navigate = useNavigate();

    const [userData,setUserData] = useState({
        nombres:'',
        apellidos:'',
        email:'',
        password:'',
        fotoperfil:'',
        username:''
    });

    const HandleUpload =(event) => {
        const file = event.target.files[0];

        var seconds = new Date().getTime() / 1000;
        var tipoarchivo = file.name.toString();
        var auxarchivo = tipoarchivo.split('.');

            const storageRef = ref(storage, `/fotos/fotosperfil/${seconds + file.name}`)
            const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', snapshot => {
        },error => {console.log(error.message)},
        () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                setUserData({...userData,"fotoperfil": downloadURL})
            });
            
        }
        );

    }
    
    const handleSubmit = async (e) =>{
      e.preventDefault();

      let fotoSave = userData.fotoperfil;

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
                            <input value={userData.nombres} onChange={(e) => setUserData({...userData,"nombres": e.target.value})} type="text" placeholder="Nombre(s)" required/>
                            <input value={userData.apellidos} onChange={(e) => setUserData({...userData,"apellidos": e.target.value})} type="text" placeholder="Apellido(s)" required/>
                            <div className="custom-file">
                                <input type="file"  onChange={(event) => HandleUpload(event)} ref={inputFile}  className="custom-file-input" id="inputGroupFile01" aria-describedby="inputGroupFileAddon01" />
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
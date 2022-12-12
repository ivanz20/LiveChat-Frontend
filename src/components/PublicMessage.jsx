import React, { useEffect, useState, useRef,useLayoutEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMessage } from '@fortawesome/free-solid-svg-icons'
import { faUserFriends } from '@fortawesome/free-solid-svg-icons'
import { faVideo } from '@fortawesome/free-solid-svg-icons'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { faPenSquare } from '@fortawesome/free-solid-svg-icons'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { faPaperclip } from '@fortawesome/free-solid-svg-icons'
import { faLocation } from '@fortawesome/free-solid-svg-icons'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from "react-router-dom";
import {over} from 'stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios'
import Modal from './Modal';
import {useJsApiLoader, GoogleMap} from '@react-google-maps/api';
import {MarkerF} from '@react-google-maps/api'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import FileUpload from './upload'
import { getStorage,ref,uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";



var stompClient =null;
var datetime=''
var conectado = false;
var archivo = '';
var KindOFArchive = "";

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

export const PublicMessage  = (props) => {

    const {isLoaded} = useJsApiLoader({
        googleMapsApiKey: 'AIzaSyCj3CaAQnBsR2BB-oh1MXKfgb1hmyX13e4',
    })
    const inputFile = useRef(null) 
    const inputFile2 = useRef(null) 
    const [active, setActive] = useState(false);
    const [active2, setActive2] = useState(false);
    const [active3, setActive3] = useState(false);

    const [onlineUsers, setOnlineUsers] = useState(new Map());
    const [chatsUsers, setChatsUsers] = useState(new Map());
    const [infoBanner, setInfoBanner] = useState(new Map());
    const [encriptar, setEncriptar] = useState("false");


    useEffect(() => {
        if(!conectado){
            connect();
            conectado = true;
        }
     });

  
    var objDiv = document.getElementById("mensajes-contenedor");
    var objDiv2 = document.getElementById("chat-messages-priv");
    const [privateChats, setPrivateChats] = useState(new Map());
    const [publicChats, setPublicChats] = useState([]);
    const [tab,setTab] =useState("CHATROOM");
    const [typeMessage,setTypeMessage] = useState("private");

    const [userData, setUserData] = useState({
        sender_name: '',
        receiver_name: '',
        connected: false,
        message: '',
        fotoperfil:'',
        username: ''
      });

    useEffect(() => {
    }, [userData]);


    const GetUserMessages = () =>{
        fetch("http://localhost:8080/api/chatsprivados/UserChats/" + sessionStorage.getItem("id_logged"))
        .then((response) => response.json())
        .then((chat) => {
            for (let value of chat.values()){
             
                var chatMessage = {
                    sender_name: value['username'],
                    fotoperfil: value['fotoperfil'],
                    statususer: value['status'],
                    status:"JOIN"
                  };
        
                  stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
            }

            setChatsUsers(chat); // ⬅️ Guardar datos
        });

    }

    const setInfo=()=>{
        userData.sender_name = sessionStorage.getItem('username_logged').toString();
        userData.fotoperfil = sessionStorage.getItem('foto_logged').toString();
        userData.username = sessionStorage.getItem('username_logged').toString();
        userData.id_user = sessionStorage.getItem('id_logged').toString();
       
    } 

   
    const connect =()=>{
        setInfo();
        let Sock = new SockJS('http://localhost:8080/ws/');
        stompClient = over(Sock);
        stompClient.connect({},onConnected, onError);
        
    }

    const onConnected = () => {
       
        userData.connected = 'true'
        stompClient.subscribe('/chatroom/public', onMessageReceived);
        stompClient.subscribe('/user/' + userData.sender_name + '/private', onPrivateMessage);
        GetPublicMessage();
        GetUserMessages();
        userJoin();
        

    }

    const userJoin=()=>{
        var chatMessage = {
          sender_name: userData.sender_name,
          fotoperfil: userData.fotoperfil,
          statususer: "online",
          status:"JOIN"
        };
        stompClient.send("/app/message", {}, JSON.stringify(chatMessage));


    }

  const onMessageReceived = (payload)=>{
    // GetUserMessages();
    var payloadData = JSON.parse(payload.body);
    switch(payloadData.status){
        case "JOIN":
            if(!privateChats.get(payloadData.sender_name)){
                privateChats.set(payloadData.sender_name,[payloadData]);
                setPrivateChats(new Map(privateChats));
            }
            break;
        case "MESSAGE":
            if (payloadData.encriptado == true){
                var aux = atob(payloadData.message)
                payloadData.message = aux;
            }
            publicChats.push(payloadData);
            setPublicChats([...publicChats]);
            break;
    }
   
}
const onPrivateMessage = (payload)=>{
    var payloadData = JSON.parse(payload.body);
    if(privateChats.get(payloadData.sender_name)){
        privateChats.get(payloadData.sender_name).push(payloadData);
        setPrivateChats(new Map(privateChats));
    }else{
        let list =[];
        list.push(payloadData);
        privateChats.set(payloadData.sender_name,list);
        setPrivateChats(new Map(privateChats));
    }

}





const onError = (err) => {
    console.log(err);
    
}

const handleMessage =(event)=>{
    const {value}=event.target;
    setUserData({...userData,"message": value});
}
const sendValue=()=>{
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
        datetime =  today.toISOString(); 
        if (stompClient) {
          var chatMessage = {
            sender_name: sessionStorage.getItem("username_logged"),
            message: userData.message,
            fecha_enviado: datetime,
            fotoperfil : sessionStorage.getItem("foto_logged"),
            status:"MESSAGE",
            id_chat: sessionStorage.getItem("id_logged"),
            encriptado: encriptar
          };
          stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
          setUserData({...userData,"message": ""});
        }
}

const sendPrivateValue=()=>{

    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
        datetime =  today.toISOString(); 
    if (stompClient) {
      var chatMessage = {
        sender_name: sessionStorage.getItem("username_logged"),
        receiver_name:tab,
        message: userData.message,
        fecha_enviado: datetime,
        fotoperfil : sessionStorage.getItem("foto_logged"),
        status:"MESSAGE",
        id_chat: sessionStorage.getItem("id_logged"),
        encriptado: encriptar

      };
      
      if(userData.sender_name !== tab){
        privateChats.get(tab).push(chatMessage);
        setPrivateChats(new Map(privateChats));
      }
      
      stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
      setUserData({...userData,"message": ""});
    }
}

const sendArchivePrivate=()=>{
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
        datetime =  today.toISOString(); 
    if (stompClient) {
      var chatMessage = {
        sender_name: sessionStorage.getItem("username_logged"),
        receiver_name:tab,
        fecha_enviado: datetime,
        message: sessionStorage.getItem("username_logged") + " envió un archivo",
        fotoperfil : sessionStorage.getItem("foto_logged"),
        status:"MESSAGE",
        id_chat: sessionStorage.getItem("id_logged"),
        mensaje_archivo : archivo,
        tipo_archivo:  KindOFArchive
      };
      
      if(userData.sender_name !== tab){
        privateChats.get(tab).push(chatMessage);
        setPrivateChats(new Map(privateChats));
      }
      
      stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
      setUserData({...userData,"message": ""});
    }
}

const sendArchivePublic=()=>{
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
        datetime =  today.toISOString(); 
    if (stompClient) {
      var chatMessage = {
        sender_name: sessionStorage.getItem("username_logged"),
        receiver_name:null,
        fecha_enviado: datetime,
        message: sessionStorage.getItem("username_logged") + " envió un archivo",
        fotoperfil : sessionStorage.getItem("foto_logged"),
        status:"MESSAGE",
        id_chat: sessionStorage.getItem("id_logged"),
        mensaje_archivo : archivo,
        tipo_archivo:  KindOFArchive
      };
      
      if(userData.sender_name !== tab){
        publicChats.push(chatMessage);
        setPublicChats([...publicChats]);
      }
      
      stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
      setUserData({...userData,"message": ""});
    }
}


const sendLocationPrivate=()=>{
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    datetime =  today.toISOString(); 
    navigator.geolocation.getCurrentPosition(function(position){
    

    if (stompClient) {
      var chatMessage = {
        sender_name: sessionStorage.getItem("username_logged"),
        receiver_name:tab,
        message: sessionStorage.getItem("username_logged") + ' compartio su localización',
        fecha_enviado: datetime,
        fotoperfil : sessionStorage.getItem("foto_logged"),
        status:"MESSAGE",
        id_chat: sessionStorage.getItem("id_logged"),
        latitud: position.coords.latitude,
        longitud: position.coords.longitude,
      };
      
      if(userData.sender_name !== tab){
        privateChats.get(tab).push(chatMessage);
        setPrivateChats(new Map(privateChats));
      }
      
      stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
      setUserData({...userData,"message": ""});
    }
});

}

const sendLocationPublic=()=>{
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    datetime =  today.toISOString(); 
    navigator.geolocation.getCurrentPosition(function(position){
    

    if (stompClient) {
      var chatMessage = {
        sender_name: sessionStorage.getItem("username_logged"),
        receiver_name:null,
        message: sessionStorage.getItem("username_logged") + ' compartio su localización',
        fecha_enviado: datetime,
        fotoperfil : sessionStorage.getItem("foto_logged"),
        status:"MESSAGE",
        id_chat: sessionStorage.getItem("id_logged"),
        latitud: position.coords.latitude,
        longitud: position.coords.longitude,
      };
      
      if(userData.sender_name !== tab){
        publicChats.push(chatMessage);
        setPublicChats([...publicChats]);
      }
      
      stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
      setUserData({...userData,"message": ""});
    }
});

}

const HandleUpload =(event) => {
    const file = event.target.files[0];

    var seconds = new Date().getTime() / 1000;
    var tipoarchivo = file.name.toString();
    var auxarchivo = tipoarchivo.split('.');
    var extension = auxarchivo[1];
    archivo="";
    KindOFArchive="";

        const storageRef = ref(storage, `/fotos/${sessionStorage.getItem('username_logged')+'-'+tab}/${seconds + file.name}`)
        const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', snapshot => {
    },error => {console.log(error.message)},
    () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            if(extension == "jpg" || extension == "png"){
            archivo=downloadURL;
            KindOFArchive='imagen';
            sendArchivePrivate();

            }else{
                archivo=downloadURL;
                KindOFArchive='otro'
                sendArchivePrivate();

            }

          });
        
    }
    );
    
    

}

const HandleUpload2 =(event) => {
    const file = event.target.files[0];

    var seconds = new Date().getTime() / 1000;
    var tipoarchivo = file.name.toString();
    var auxarchivo = tipoarchivo.split('.');
    var extension = auxarchivo[1];
    archivo="";
    KindOFArchive="";

        const storageRef = ref(storage, `/fotos/public/${seconds + file.name}`)
        const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', snapshot => {
    },error => {console.log(error.message)},
    () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            if(extension == "jpg" || extension == "png"){
            archivo=downloadURL;
            KindOFArchive='imagen';
            sendArchivePublic();

            }else{
                archivo=downloadURL;
                KindOFArchive='otro'
                sendArchivePublic();

            }

          });
        
    }
    );
    
    

}

const getUserMessage=(username)=>{

    fetch("http://localhost:8080/api/chatsprivados/getusermensajes")
            .then((response) => response.json())
            .then((chats) => {
                for (let value of chats.values()){
                        if(value['receiver_name']==username && value['sender_name']==sessionStorage.getItem("username_logged") 
                        || value['sender_name']==username && value['receiver_name']==sessionStorage.getItem("username_logged" )){
                            if(value['encriptado'] == true){
                                var auxdecode = atob(value['message']);
                                value['message'] = auxdecode;
                            }
                            privateChats.get(username).push(value);
                            setPrivateChats(new Map(privateChats));
                        }
                }
    
            });
   
    setInfoBanner(privateChats.get(username));

}

const GetPublicMessage = () => {
    fetch("http://localhost:8080/api/chatsprivados/getusermensajes")
    .then((response) => response.json())
    .then((chats) => {
    for (let value of chats.values()){
            if(value['receiver_name']==null){
                if(value['encriptado'] == true){
                    var auxdecode = atob(value['message']);
                    value['message'] = auxdecode;
                }
                publicChats.push(value);
                setPublicChats([...publicChats]);
            }
    }

});}

const handleUsername=(event)=>{
    const {value}=event.target;
    setUserData({...userData,"sender_name": value});
}

const registerUser=()=>{
    connect();
}

// For todays date;
Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

// For the time now
Date.prototype.timeNow = function () {
     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

const SaveUserChanges = () => {
    var statususer = document.getElementById('status-user').value;
    var encript = document.getElementById('encript-check').value;

    if(encript=='on'){
        setEncriptar("true")
    }else{
        setEncriptar("false")
    }

    fetch("http://localhost:8080/api/users/userUpdate/?id=" + sessionStorage.getItem("id_logged") + "&status=" + statususer)
        .then((response) => response.json())
        .then((chat) => {
            GetUserMessages();
        });


    alert("Cambios guardados"); 
}

 const _handleKeyDown = function(e) {
    if (e.key === 'Enter') {
        objDiv.scrollTop = objDiv.scrollHeight;
        sendValue();

    }
  }

  const _handleKeyDownPrivate = function(e) {
    objDiv2.scrollTop = objDiv2.scrollHeight;
    if (e.key === 'Enter') {
        sendPrivateValue();

    }
  }

  const MensajesPublicos = function(e){
    var chatprivado = document.getElementById("mensajesprivados")
    chatprivado.style.display = "none";
    setTypeMessage('public');
    setTab('CHATROOM');
  }

  const filesToFirebase = () => {
    inputFile.current.click()
  }

  const filesToFirebase2 = () => {
    inputFile2.current.click()
  }

  const toggle =()=>{
    setActive(!active);
    }

    const checkBase64 = (string) => {
        var isBase64 = require('is-base64');
       if(isBase64(string)){
        return atob(string)
       }else{
        return (string);
       } 
    }
    const toggle3 =()=>{
        setActive3(!active3);
        }

    const toggle2 =()=>{
        setActive2(!active2);
        }


        const navigate = useNavigate();



      const GetOnlineUsers = async () => {
        const res = await fetch("http://localhost:8080/api/users/UsersOnline");
        const data = await res.json();
        setOnlineUsers(data);
      };

    
      
    


    return (
        <div>
            
        {typeMessage === 'public' &&
        <div className="PublicMessage">
        <div className="vertical-nav" id="sidebar">
            <ul className="nav flex-column mb-0" id="nav-bar-chat">
                <li className="nav-item mx-auto">
                    <div className="nav-link text-dark font-italic" onClick={() => setTypeMessage('private')}>
                        <FontAwesomeIcon icon={faMessage} color='white' size='3x'/>
                    </div>
                </li>
                    <br />
                <li className="nav-item mx-auto">
                    <div className="nav-link text-dark font-italic" onClick={() => MensajesPublicos()}>
                    <FontAwesomeIcon icon={faUserFriends} color='white' size='3x'/>
                    </div>
                </li>
                <br />  
            </ul>
            <div className="media d-flex " id="profile-picture">
                <img src={userData.fotoperfil} alt="..." width={60} className=" mx-auto rounded-circle img-thumbnail shadow-sm" />
            </div>      
        </div>
        <div className="container">
        <div style={{backgroundColor: '#F4F4F4'}}>
                    <div className="titulo-nombre">
                        <h2>Chat Grupal</h2>
                        <img src="https://cdn-icons-png.flaticon.com/512/236/236842.png" alt="..." width={80} className="rounded-circle shadow-sm" />
                        <FontAwesomeIcon icon={faVideo} color='white' />
                        <FontAwesomeIcon icon={faCircleInfo} color='white'/>
                    </div>
                
                    {tab==="CHATROOM" && <div className="chat-content">
                <ul id="mensajes-contenedor" className="mensajes-container">
                {publicChats.map((chat,index)=>(
                    <li className={`message ${chat.sender_name === userData.sender_name && "self"}`} key={index} >
                            {
                            chat.sender_name !== userData.sender_name 
                            ?
                                
                                chat.latitud == null 
                                ?
                                    chat.mensaje_archivo == null
                                    ?
                                        <div className="mensaje-recibido-card">
                                        <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                        <p className="avatar">{chat.sender_name}</p>
                                        <p id="mensaje-burbuja" className="message-data">{chat.message}</p>
                                        <p id="hora-burbuja">{chat.fecha_enviado}</p>
                                        </div>
                                    :
                                    chat.tipo_archivo == 'imagen'
                                    ?
                                    <div className="mensaje-recibido-card imagenes">
                                        <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                        <p className="avatar">{chat.sender_name}</p>
                                        <p id="mensaje-burbuja-img" className="message-data">
                                        <img src={chat.mensaje_archivo}></img>
                                        </p>
                                        <p id="hora-burbuja-img">{chat.fecha_enviado}</p>
                                        </div>
                                    :
                                    <div className="mensaje-recibido-card archivo">
                                        <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                        <p className="avatar">{chat.sender_name}</p>
                                        <p id="mensaje-burbuja-archivo" className="message-data">
                                        <a className='link-archivo' href={chat.mensaje_archivo}>Archivo enviado {chat.mensaje_archivo}</a>
                                        </p>
                                        <p id="hora-burbuja-archivo">{chat.fecha_enviado}</p>
                                        </div>

                                :
                                <div className="mensaje-recibido-card localizacion">
                                <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                <p className="avatar">{chat.sender_name}</p>
                                <p id="mensaje-burbuja-loca" className="message-data">
                                <GoogleMap
                                                        center={{lat:  chat.latitud,lng: chat.longitud}}
                                                        zoom={15}
                                                        mapContainerStyle={{width: '100%', height: '100%', position: 'absolute', left: '0',top: '0', borderRadius: '20px'}}
                                                        options={{
                                                            zoomControl: false,
                                                            streetViewControl: false,
                                                            mapTypeControl: false,
                                                            fullscreenControl: false,
                                                            noClear: false,
                                                        }}>
                                                        <MarkerF key="marker_1"position={{lat:  chat.latitud,lng: chat.longitud}}/>
                                    </GoogleMap>
                                </p>
                                <p id="hora-burbuja-loca">{chat.fecha_enviado}</p>
                                </div>
                            :   
                                    chat.latitud == null 
                                    ?
                                        chat.mensaje_archivo == null
                                            ?
                                            <div className="mensaje-enviado-card">
                                            <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                            <p className="avatar self">{chat.sender_name}</p>
                                            <p id="mensaje-burbuja-enviado" className="message-data">{chat.message}</p>
                                            <p id="hora-burbuja-enviado">{chat.fecha_enviado}</p>
                                            </div>
                                            :
                                                        chat.tipo_archivo == 'imagen'
                                                        ?
                                                        <div className="mensaje-enviado-card imagenes">
                                                        <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                                        <p className="avatar self">{chat.sender_name}</p>
                                                        <p id="mensaje-burbuja-enviado-foto" className="message-data">
                                                        <img src={chat.mensaje_archivo}></img>
                                                        </p>
                                                        <p id="hora-burbuja-enviado-img">{chat.fecha_enviado}</p>
                                                        </div>
                                                        :
                                                        <div className="mensaje-enviado-card archivo">
                                                        <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                                        <p className="avatar self">{chat.sender_name}</p>
                                                        <p id="mensaje-burbuja-enviado-archivo" className="message-data">
                                                        <a className='link-archivo' href={chat.mensaje_archivo}>Archivo enviado {chat.mensaje_archivo}</a>
                                                        </p>
                                                        <p id="hora-burbuja-enviado-archivo">{chat.fecha_enviado}</p>
                                                        </div>

                                    :
                                    <div className="mensaje-enviado-card localizacion">
                                    <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                    <p className="avatar self">{chat.sender_name}</p>
                                    <p id="mensaje-burbuja-enviado-loca" className="message-data">
                                    <GoogleMap
                                                        center={{lat:  chat.latitud,lng: chat.longitud}}
                                                        zoom={15}
                                                        mapContainerStyle={{width: '100%', height: '100%', position: 'absolute', left: '0',top: '0', borderRadius: '20px'}}
                                                        options={{
                                                            zoomControl: false,
                                                            streetViewControl: false,
                                                            mapTypeControl: false,
                                                            fullscreenControl: false,
                                                            noClear: false,
                                                        }}>
                                                        <MarkerF key="marker_1"position={{lat:  chat.latitud,lng: chat.longitud}}/>
                                    </GoogleMap>
                                    </p>
                                    <p id="hora-burbuja-enviado-loca">{chat.fecha_enviado}</p>
                                    </div>
                            }   
                        
                    </li>
                ))}
                </ul >
                <div className="escribir-mensaje">
                            <input type="text" id="w3review" name="w3review" className="input-message" placeholder="Escribe tu mensaje" value={userData.message} onChange={handleMessage} onKeyDown={_handleKeyDown} rows={1} cols={70} />
                            <input type='file' id='file' onChange={(event) => HandleUpload2(event)} ref={inputFile2} style={{display: 'none'}}/>
                            <button type="button" className="send-button" onClick={sendValue}>
                                <FontAwesomeIcon icon={faPaperPlane} color='gray' size='xl' className="send-button" />
                            </button>
                            <button type='button'   onClick={() => filesToFirebase2()}>
                                <FontAwesomeIcon icon={faPaperclip} color='gray' size='xl'/>
                            </button>
                            <button type='button'  onClick={() => sendLocationPublic()}>
                                            <FontAwesomeIcon icon={faLocation} color='gray' size='xl'/>
                            </button>
                    </div>
        </div>}
                    
        </div>
        </div>
        
    </div>
    }:
    <div className="PrivateMessageClass" id="mensajesprivados">

            <Modal active={active} toggle={toggle}>

                <h2 id='titulo-chats'>En línea</h2>

                <ul className='no-bullets'>
                            {[...onlineUsers].map((usuario,index)=>(
                            <li key={index} >
                                {
                                    <button className='btn-enlinea'>
                                    <div className="card-online">
                                        <div className={"status2 " + usuario['status']} />
                                        <img src={usuario['fotoperfil']} alt="..." width={50} className="rounded-circle shadow-sm" />
                                        <p className="nombre-contactos">{usuario['nombres'] + " " + usuario['apellidos']}</p>
                                        <p className="email-contactos">{usuario['email']}</p>
                                    </div>
                                </button>
                                }
                            </li>
                            ))}
                                
                </ul>

            </Modal>

            <Modal active={active2} toggle={toggle2}>

                <h2 id='titulo-chats'>Configuración</h2>
                <br></br>

                <p>Status:</p>
                <Form.Select className='status-usuario' id='status-user'>
                    <option value='online'>Online</option>
                    <option value='busy'>Busy</option>
                    <option value='offline'>Offline</option>                
                </Form.Select>
                <br></br>
                <p>Activar/Desactivar encriptación:</p>
                <Form.Select className='encriptacion-select' id='encript-check'>
                    <option value='on'>Activado</option>
                    <option value='off'>Desactivado</option>
                </Form.Select>
                <br></br>
                <Button type="button" style={{width: '100%', backgroundColor    : '#3f4d6a', border: 'none'}} onClick={()=>{SaveUserChanges()}}>Guardar Cambios</Button>
                <br></br>
                <br></br>
                <Button type="button" style={{width: '100%', backgroundColor    : '#3f4d6a', border: 'none'}}>Cerrar Sesión</Button>


            </Modal>
       
            <div className="vertical-nav" id="sidebar">
                    <ul className="nav flex-column mb-0" id="nav-bar-chat">
                        <li className="nav-item mx-auto">
                            <div className="nav-link text-dark font-italic" onClick={() => setTypeMessage('private')}>
                                <FontAwesomeIcon icon={faMessage} color='white' size='3x'/>
                            </div>
                        </li>
                        <br />
                        <li className="nav-item mx-auto">
                            <div className="nav-link text-dark font-italic" onClick={() => setTypeMessage('public')} >
                                <FontAwesomeIcon icon={faUserFriends} color='white' size='3x'/>
                            </div>
                        </li>
                        <br /> 
                    </ul>
                    <div className="media d-flex" id="profile-picture">
                        <img src={sessionStorage.getItem("foto_logged")} alt="..." width={60} className=" mx-auto rounded-circle img-thumbnail shadow-sm" />
                    </div> 
            </div>

            <div className="container-fluid">
                <div className="row">
                    <div className="col-5 col-xl-4" id="mensajes-lista">
                        <br /><br />
                        <h3 style={{fontWeight: 700, display: 'inline-flex'}}>Mensajes
                            <div style={{marginLeft: '10px'}} onClick={() => {toggle(); GetOnlineUsers(); }}>
                            <FontAwesomeIcon icon={faPenSquare} color='white'  id="nuevo-mensaje" />
                            </div>
                            <div style={{marginLeft: '10px'}}  onClick={() => {toggle2(); GetOnlineUsers(); }}>
                            <FontAwesomeIcon icon={faGear} color='white'  id="nuevo-mensaje" />
                            </div>
                        </h3>
                        
                        <p id="titulo-mensajes">Privados</p>
                        <hr />

                    <div className="member-list">
                        <ul>
                            {[...chatsUsers.values()].map((chats,index)=>(
                            <li onClick={() =>  {getUserMessage(chats['username']);  setTab(chats['username']); }} className={`member ${tab===chats['username'] && "active"}`} key={index} style={{display: chats['username'] === sessionStorage.getItem("username_logged") ? 'none' : 'block'}}>
                                <div className="card-mensaje">
                                    <div className={"status " + chats['status']} />
                                    <img src={chats['fotoperfil']} alt="..." width={80} className="rounded-circle shadow-sm" />
                                    <p className="nombre-mensaje">{chats['username']}</p>
                                    <p className="mensaje-card">{
                                    checkBase64(chats['ultimomensaje'])
                                    }</p>
                                </div>
                            
                            </li>
                            ))}

                         </ul>
                    </div>    

                </div>
                    <div className="col" style={{backgroundColor: '#F4F4F4'}}>
                        
            {tab!=="CHATROOM" && 
                
                <div className="chat-content" >
                    
                         {
                        <div className="titulo-nombre">
                            <h2>{infoBanner[0]['sender_name']}</h2>
                            <p>{infoBanner[0]['statususer']}</p>
                            <img src={infoBanner[0]['fotoperfil']} alt="..." width={80} className="rounded-circle shadow-sm" />
                            <FontAwesomeIcon icon={faVideo} color='white' />
                        </div>}

                            <ul className="chat-messages-priv" id="chat-messages-priv">
                                {[...privateChats.get(tab)].map((chat,index)=>(
                                <li className={`message ${chat.sender_name === userData.username && "self"}`} key={index} >
                                    {chat.sender_name !== userData.sender_name &&
                                        <div>
                                            
                                            {
                                                chat.latitud == null  
                                                ?
                                                    chat.mensaje_archivo == null
                                                    ?
                                                        <div className="mensaje-recibido-card-privado" style={{display: chat.message != null ? 'block' : 'none'}}>
                                                        <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                                        <p className="avatar-privado"><strong>{chat.sender_name}</strong></p>
                                                        <p id="mensaje-burbuja-privado" className="message-data">{chat.message}</p>
                                                        <p id="hora-burbuja-privado">{chat.fecha_enviado}</p>
                                                        </div>
                                                    :
                                                    chat.tipo_archivo == 'imagen'
                                                    ?
                                                        <div className="mensaje-recibido-card-privado imagenes" style={{display: chat.message != null ? 'block' : 'none'}}>
                                                        <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                                        <p className="avatar-privado"><strong>{chat.sender_name}</strong></p>
                                                        <p id="mensaje-burbuja-privado-img" className="message-data">
                                                        <img src={chat.mensaje_archivo}></img>
                                                        </p>
                                                        <p id="hora-burbuja-privado-foto">{chat.fecha_enviado}</p>
                                                        </div>
                                                    :
                                                    <div className="mensaje-recibido-card-privado archivo" style={{display: chat.message != null ? 'block' : 'none'}}>
                                                    <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                                    <p className="avatar-privado"><strong>{chat.sender_name}</strong></p>
                                                    <p id="mensaje-burbuja-privado-archivo" className="message-data">
                                                    <a className='link-archivo' href={chat.mensaje_archivo}>Archivo enviado {chat.mensaje_archivo}</a>
                                                    </p>
                                                    <p id="hora-burbuja-privado-archive">{chat.fecha_enviado}</p>
                                                    </div>
                                                :
                                                <div className="mensaje-recibido-card-privado localizacion" style={{display: chat.message != null ? 'block' : 'none'}}>
                                                    <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                                    <p className="avatar-privado"><strong>{chat.sender_name}</strong></p>
                                                    <p id="mensaje-burbuja-privado-loca" className="message-data">
                                                    <GoogleMap
                                                        center={{lat:  chat.latitud,lng: chat.longitud}}
                                                        zoom={15}
                                                        mapContainerStyle={{width: '100%', height: '100%', position: 'absolute', left: '0',top: '0', borderRadius: '20px'}}
                                                        options={{
                                                            zoomControl: false,
                                                            streetViewControl: false,
                                                            mapTypeControl: false,
                                                            fullscreenControl: false,
                                                            noClear: false,
                                                        }}>
                                                        <MarkerF key="marker_1"position={{lat:  chat.latitud,lng: chat.longitud}}/>
                                                    </GoogleMap>
                                                    </p>
                                                    <p id="hora-burbuja-privado-loca">{chat.fecha_enviado}</p>
                                                </div> 

                                            }
                                        </div>
                                    }
                                    {chat.sender_name === userData.sender_name && 
                                    <div>
                                        
                                        {
                                                chat.latitud == null 
                                                ?
                                                    chat.mensaje_archivo == null
                                                    ?
                                                        <div className="mensaje-enviado-card-privado">
                                                            <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                                            <p className="avatar-privado self"><strong>{chat.sender_name}</strong></p>
                                                            <p id="mensaje-burbuja-enviado-privado" className="message-data">{chat.message}</p>
                                                            <p id="hora-burbuja-enviado-privado">{chat.fecha_enviado}</p>
                                                        </div>
                                                    :
                                                        chat.tipo_archivo == 'imagen'
                                                        ?
                                                        <div className="mensaje-enviado-card-privado imagenes">
                                                                <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                                                <p className="avatar-privado self"><strong>{chat.sender_name}</strong></p>
                                                                <p id="mensaje-burbuja-enviado-privado-img" className="message-data">
                                                                    <img src={chat.mensaje_archivo}></img>
                                                                </p>
                                                                <p class="hora-burbuja-enviado-privado-foto">{chat.fecha_enviado}</p>
                                                        </div>
                                                        :
                                                        <div className="mensaje-enviado-card-privado archivo">
                                                            <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                                            <p className="avatar-privado self"><strong>{chat.sender_name}</strong></p>
                                                            <p id="mensaje-burbuja-enviado-privado-archivo" className="message-data">
                                                                <a className='link-archivo' href={chat.mensaje_archivo}>Archivo enviado {chat.mensaje_archivo}</a>
                                                            </p>
                                                            <p class="hora-burbuja-enviado-privado-archivo">{chat.fecha_enviado}</p>
                                                        </div>

                                                :
                                                <div className="mensaje-enviado-card-privado localizacion">
                                                 <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                                <p className="avatar-privado self"><strong>{chat.sender_name}</strong></p>
                                                <p id="mensaje-burbuja-enviado-privado-loca" className="message-data"><GoogleMap
                                                        center={{lat:  chat.latitud,lng: chat.longitud}}
                                                        zoom={15}
                                                        mapContainerStyle={{width: '100%', height: '100%', position: 'absolute', right: '0',top: '0', borderRadius: '20px'}}
                                                        options={{
                                                            zoomControl: false,
                                                            streetViewControl: false,
                                                            mapTypeControl: false,
                                                            fullscreenControl: false,
                                                            noClear: false,
                                                        }}>
                                                <MarkerF key="marker_1"position={{lat:  chat.latitud,lng: chat.longitud}}/>
                                                </GoogleMap></p>
                                                <p id="hora-burbuja-enviado-privado-loca">{chat.fecha_enviado}</p>
                                                
                                                </div>
                                        }
                                    </div>
                                    }
                                </li>
                                ))}
                            </ul>

                            <div className="send-message">
                                <div className="escribir-mensaje">
                                        <input type="text" id="w3review2" name="w3review2" className="input-message2" placeholder="Escribe tu mensaje" autoComplete='off' value={userData.message} onChange={handleMessage} onKeyDown={_handleKeyDownPrivate} rows={1} cols={70} />
                                        <input type='file' id='file' onChange={(event) => HandleUpload(event)} ref={inputFile} style={{display: 'none'}}/>
                                        <button type="button" className="send-button2" onClick={() => {sendPrivateValue(); GetUserMessages();}}>
                                            <FontAwesomeIcon icon={faPaperPlane} color='gray' size='xl' className="send-button" />
                                        </button>

                                        <button type='button'  onClick={() => filesToFirebase()}>
                                            <FontAwesomeIcon icon={faPaperclip} color='gray' size='xl'/>
                                        </button>

                                        <button type='button'  onClick={() => sendLocationPrivate()}>
                                            <FontAwesomeIcon icon={faLocation} color='gray' size='xl'/>
                                        </button>
                                    </div> 
                            </div>
                </div>}
            
                        

                        


                    </div>
                </div>                  
            </div>       
        </div>  
    </div>
        
        
        


    )
}
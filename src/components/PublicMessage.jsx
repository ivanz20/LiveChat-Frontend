import React, { useEffect, useState, useRef} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMessage } from '@fortawesome/free-solid-svg-icons'
import { faUserFriends } from '@fortawesome/free-solid-svg-icons'
import { faVideo } from '@fortawesome/free-solid-svg-icons'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { faPenSquare } from '@fortawesome/free-solid-svg-icons'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { faPaperclip } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from "react-router-dom";
import {over} from 'stompjs';
import SockJS from 'sockjs-client';

var stompClient =null;
var datetime=''

export const PublicMessage  = (props) => {
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

    const setInfo=()=>{
        userData.sender_name = sessionStorage.getItem('username_logged').toString();
        userData.fotoperfil = sessionStorage.getItem('foto_logged').toString();
        userData.username = sessionStorage.getItem('username_logged').toString();

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
        userJoin();
    }

    const userJoin=()=>{
        var chatMessage = {
          sender_name: userData.sender_name,
          fotoperfil: userData.fotoperfil,
          status:"JOIN"
        };
        console.log(chatMessage)
        console.log("-----------------------------------------")
        stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
  }

  const onMessageReceived = (payload)=>{
    var payloadData = JSON.parse(payload.body);
    switch(payloadData.status){
        case "JOIN":
            if(!privateChats.get(payloadData.sender_name)){
                privateChats.set(payloadData.sender_name,[]);
                setPrivateChats(new Map(privateChats));
            }
            break;
        case "MESSAGE":
            publicChats.push(payloadData);
            setPublicChats([...publicChats]);
            break;
    }
}
const onPrivateMessage = (payload)=>{
    var payloadData = JSON.parse(payload.body);
    console.log(payloadData);
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
    console.log("AY UN ERROR")
    console.log(err);
    
}

const handleMessage =(event)=>{
    const {value}=event.target;
    setUserData({...userData,"message": value});
}
const sendValue=()=>{
        datetime =  new Date().today() + " - " + new Date().timeNow()
        if (stompClient) {
          var chatMessage = {
            sender_name: sessionStorage.getItem("username_logged"),
            message: userData.message,
            date: datetime,
            fotoperfil : sessionStorage.getItem("foto_logged"),
            status:"MESSAGE"
          };
          stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
          setUserData({...userData,"message": ""});
        }
}

const sendPrivateValue=()=>{
    datetime =  new Date().today() + " - " + new Date().timeNow()
    if (stompClient) {
      var chatMessage = {
        sender_name: sessionStorage.getItem("username_logged"),
        receiver_name:tab,
        message: userData.message,
        date: datetime,
        fotoperfil : sessionStorage.getItem("foto_logged"),
        status:"MESSAGE"
      };
      console.log("----------------------------MENSAJE ENVIADO PRIVADO")
      console.log(chatMessage)
      
      if(userData.sender_name !== tab){
        privateChats.get(tab).push(chatMessage);
        setPrivateChats(new Map(privateChats));
      }
      stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
      setUserData({...userData,"message": ""});
    }
}

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
    setTypeMessage('public');
    setTab('CHATROOM');
  }



    const navigate = useNavigate();

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
            <div className="media d-flex" id="profile-picture">
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
                    <li className={`message ${chat.sender_name === userData.sender_name && "self"}`} key={index}>

                            {chat.sender_name !== userData.sender_name &&
                            <div className="mensaje-recibido-card">
                            <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                            <p className="avatar">{chat.sender_name}</p>
                            <p id="mensaje-burbuja" className="message-data">{chat.message}</p>
                            <p id="hora-burbuja">{chat.date}</p>
                            </div>
                            }
                            {chat.sender_name === userData.sender_name && 
                            <div className="mensaje-enviado-card">
                            <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                            <p className="avatar self">{chat.sender_name}</p>
                            <p id="mensaje-burbuja-enviado" className="message-data">{chat.message}</p>
                            <p id="hora-burbuja-enviado">{chat.date}</p>
                            </div>
                            }
                        
                    </li>
                ))}
                </ul >
                <div className="escribir-mensaje">
                            <input type="text" id="w3review" name="w3review" className="input-message" placeholder="Escribe tu mensaje" value={userData.message} onChange={handleMessage} onKeyDown={_handleKeyDown} rows={1} cols={70} defaultValue={""} />
                            <button type="button" className="send-button" onClick={sendValue}>
                                <FontAwesomeIcon icon={faPaperPlane} color='gray' size='xl' className="send-button" />
                            </button>
                            <button type='button'  onClick={connect}>
                                <FontAwesomeIcon icon={faPaperclip} color='gray' size='xl'/>
                            </button>
                    </div>
        </div>}
                    
        </div>
        </div>
        
    </div>
    }:
    <div className="PrivateMessageClass">
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
            {/* Lista Mensajes */}
            <div className="container-fluid">
                <div className="row">
                    <div className="col-5 col-xl-4" id="mensajes-lista">
                        <br /><br />
                        <h3 style={{fontWeight: 700}}>Mensajes
                            {/* <FontAwesomeIcon icon={faPenSquare} color='white'  id="nuevo-mensaje" /> */}
                        </h3>
                        <p id="titulo-mensajes">Privados</p>
                        <hr />

                <div className="member-list">
                <ul>
                    {/* <li onClick={()=>{setTab("CHATROOM")}} className={`member ${tab==="CHATROOM" && "active"}`}>Chatroom</li> */}

                    {[...privateChats.keys()].map((name,index)=>(
                        <li onClick={()=>{setTab(name)}} className={`member ${tab===name && "active"}`} key={index}>
                            
                            <div className="card-mensaje">
                            <div className="status online" />
                            <img src="https://bootstrapious.com/i/snippets/sn-v-nav/avatar.png" alt="..." width={80} className="rounded-circle shadow-sm" />
                            <p className="nombre-mensaje">{name}</p>
                            <p className="mensaje-card">Mensaje</p>
                            {/* <p className="hora-mensaje">Hoy, 05:45 pm</p> */}
                        </div>
                        
                        </li>
                    ))}

                </ul>
            </div>    

                    </div>
                    {/* MensajeContenedor */}
                    <div className="col" style={{backgroundColor: '#F4F4F4'}}>
                        <div className="titulo-nombre">
                            <h2>Jon Pardi</h2>
                            <p>Activo(a)</p>
                            <img src="https://bootstrapious.com/i/snippets/sn-v-nav/avatar.png" alt="..." width={80} className="rounded-circle shadow-sm" />
                            <FontAwesomeIcon icon={faVideo} color='white' />
                            <FontAwesomeIcon icon={faCircleInfo} color='white' onClick={connect} />
                        </div>
            {tab!=="CHATROOM" && 
            
                <div className="chat-content">
                    <ul className="chat-messages-priv" id="chat-messages-priv">
                        {[...privateChats.get(tab)].map((chat,index)=>(
                        <li className={`message ${chat.sender_name === userData.username && "self"}`} key={index}>
                            {chat.sender_name !== userData.sender_name &&
                            <div className="mensaje-recibido-card-privado">
                                <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                <p className="avatar-privado"><strong>{chat.sender_name}</strong></p>
                                <p id="mensaje-burbuja-privado" className="message-data">{chat.message}</p>
                                <p id="hora-burbuja-privado">{chat.date}</p>
                            </div>
                            }
                            {chat.sender_name === userData.sender_name && 
                            <div className="mensaje-enviado-card-privado">
                            <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                            <p className="avatar-privado self"><strong>{chat.sender_name}</strong></p>
                            <p id="mensaje-burbuja-enviado-privado" className="message-data">{chat.message}</p>
                            <p id="hora-burbuja-enviado-privado">{chat.date}</p>
                            </div>
                            }
                        </li>
                        ))}
                    </ul>

                    <div className="send-message">
                        <div className="escribir-mensaje">
                                <input type="text" id="w3review2" name="w3review2" className="input-message2" placeholder="Escribe tu mensaje" value={userData.message} onChange={handleMessage} onKeyDown={_handleKeyDownPrivate} rows={1} cols={70} defaultValue={""} />
                                <button type="button" className="send-button2" onClick={sendPrivateValue}>
                                    <FontAwesomeIcon icon={faPaperPlane} color='gray' size='xl' className="send-button" />
                                </button>
                                <button type='button'  onClick={connect}>
                                    <FontAwesomeIcon icon={faPaperclip} color='gray' size='xl'/>
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
import React, { useEffect, useState, useRef,useLayoutEffect } from 'react'
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
import axios from 'axios'
import Modal from './Modal';

var stompClient =null;
var datetime=''
var conectado = false;

export const PublicMessage  = (props) => {

    const [active, setActive] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Map());
    const [chatsUsers, setChatsUsers] = useState(new Map());
    const [infoBanner, setInfoBanner] = useState(new Map());

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




    // useLayoutEffect(() => {
    //      fetch("http://localhost:8080/api/chatsprivados/UserChats/" + sessionStorage.getItem("id_logged"))
    //     .then((response) => response.json())
    //     .then((chat) => {
    //         for (let value of chat.values()){

    //             var chatMessage = {
    //                 sender_name: value['username'],
    //                 fotoperfil: value['fotoperfil'],
    //                 statususer: value['status'],
    //                 status:"JOIN"
    //               };
        
    //               stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
    //         }   
    //         setChatsUsers(chat); // ⬅️ Guardar datos
    //     });
    //   }, []);


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
    var payloadData = JSON.parse(payload.body);
    switch(payloadData.status){
        case "JOIN":
            if(!privateChats.get(payloadData.sender_name)){
                privateChats.set(payloadData.sender_name,[payloadData]);
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
    GetUserMessages();

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
            id_chat: sessionStorage.getItem("id_logged")
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

      };
      
      if(userData.sender_name !== tab){
        privateChats.get(tab).push(chatMessage);
        setPrivateChats(new Map(privateChats));
      }
      
      stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
      setUserData({...userData,"message": ""});
    }
}



const getUserMessage=(username)=>{

    fetch("http://localhost:8080/api/chatsprivados/getusermensajes")
            .then((response) => response.json())
            .then((chats) => {
                for (let value of chats.values()){
                        if(value['receiver_name']==username && value['sender_name']==sessionStorage.getItem("username_logged") 
                        || value['sender_name']==username && value['receiver_name']==sessionStorage.getItem("username_logged" )){
                            privateChats.get(username).push(value);
                            setPrivateChats(new Map(privateChats));
                        }
                }
    
            });
   
    setInfoBanner(privateChats.get(username));


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

  const toggle =()=>{
    setActive(!active);
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
                    <li className={`message ${chat.sender_name === userData.sender_name && "self"}`} key={index} >

                            {chat.sender_name !== userData.sender_name &&
                            <div className="mensaje-recibido-card">
                            <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                            <p className="avatar">{chat.sender_name}</p>
                            <p id="mensaje-burbuja" className="message-data">{chat.message}</p>
                            <p id="hora-burbuja">{chat.fecha_enviado}</p>
                            </div>
                            }
                            {chat.sender_name === userData.sender_name && 
                            <div className="mensaje-enviado-card">
                            <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                            <p className="avatar self">{chat.sender_name}</p>
                            <p id="mensaje-burbuja-enviado" className="message-data">{chat.message}</p>
                            <p id="hora-burbuja-enviado">{chat.fecha_enviado}</p>
                            </div>
                            }
                        
                    </li>
                ))}
                </ul >
                <div className="escribir-mensaje">
                            <input type="text" id="w3review" name="w3review" className="input-message" placeholder="Escribe tu mensaje" value={userData.message} onChange={handleMessage} onKeyDown={_handleKeyDown} rows={1} cols={70} />
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
                        <h3 style={{fontWeight: 700}}>Mensajes
                            <div onClick={() => {toggle(); GetOnlineUsers(); }}>
                            <FontAwesomeIcon icon={faPenSquare} color='white'  id="nuevo-mensaje" />
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
                                    <p className="mensaje-card">{chats['ultimomensaje']}</p>
                                </div>
                            
                            </li>
                            ))}

                         </ul>
                    </div>    

                </div>
                    <div className="col" style={{backgroundColor: '#F4F4F4'}}>
                        
            {tab!=="CHATROOM" && 
                
                <div className="chat-content">
                    
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
                                    <div className="mensaje-recibido-card-privado" style={{display: chat.message != null ? 'block' : 'none'}}>
                                        <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                        <p className="avatar-privado"><strong>{chat.sender_name}</strong></p>
                                        <p id="mensaje-burbuja-privado" className="message-data">{chat.message}</p>
                                        <p id="hora-burbuja-privado">{chat.fecha_enviado}</p>
                                    </div>
                                    }
                                    {chat.sender_name === userData.sender_name && 
                                    <div className="mensaje-enviado-card-privado" >
                                        <img src={chat.fotoperfil} alt="..." width={60} className="rounded-circle shadow-sm" />
                                        <p className="avatar-privado self"><strong>{chat.sender_name}</strong></p>
                                        <p id="mensaje-burbuja-enviado-privado" className="message-data">{chat.message}</p>
                                        <p id="hora-burbuja-enviado-privado">{chat.fecha_enviado}</p>
                                    </div>
                                    }
                                </li>
                                ))}
                            </ul>

                            <div className="send-message">
                                <div className="escribir-mensaje">
                                        <input type="text" id="w3review2" name="w3review2" className="input-message2" placeholder="Escribe tu mensaje" autoComplete='off' value={userData.message} onChange={handleMessage} onKeyDown={_handleKeyDownPrivate} rows={1} cols={70} />
                                        <button type="button" className="send-button2" onClick={() => {sendPrivateValue(); GetUserMessages();}}>
                                            <FontAwesomeIcon icon={faPaperPlane} color='gray' size='xl' className="send-button" />
                                        </button>
                                        <button type='button'  onClick="">
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
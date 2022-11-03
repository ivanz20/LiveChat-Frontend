import React, {useState} from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMessage } from '@fortawesome/free-solid-svg-icons'
import { faUserFriends } from '@fortawesome/free-solid-svg-icons'
import { faPenSquare } from '@fortawesome/free-solid-svg-icons'
import { faVideo } from '@fortawesome/free-solid-svg-icons'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { faPaperclip } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from "react-router-dom";



export const PrivateMessage  = (props) => {
    const navigate = useNavigate();

    return (
        <div className="PrivateMessageClass">
            <div className="vertical-nav" id="sidebar">
                <ul className="nav flex-column mb-0" id="nav-bar-chat">
                    <li className="nav-item mx-auto">
                        <div className="nav-link text-dark font-italic" onClick={() => navigate('/mensajesprivados')}>
                            <FontAwesomeIcon icon={faMessage} color='white' size='3x'/>
                        </div>
                    </li>
                    <br />
                    <li className="nav-item mx-auto">
                        <div className="nav-link text-dark font-italic" onClick={() => navigate('/mensajepublicos')} >
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
                            <FontAwesomeIcon icon={faPenSquare} color='white'  id="nuevo-mensaje" />
                        </h3>
                        {/* <input type="text" id="buscar-mensaje" placeholder="Buscar" /> */}
                        <p id="titulo-mensajes">Personales</p>
                        <hr />
                        <div className="card-mensaje selected">
                            <div className="status online" />
                            <img src="https://bootstrapious.com/i/snippets/sn-v-nav/avatar.png" alt="..." width={80} className="rounded-circle shadow-sm" />
                            <p className="nombre-mensaje">Jon Pardi</p>
                            <p className="mensaje-card">Que onda q pedo</p>
                            <p className="hora-mensaje">Hoy, 05:45 pm</p>
                        </div>
                        <div className="card-mensaje">
                            <div className="status offline" />
                            <img src="https://bootstrapious.com/i/snippets/sn-v-nav/avatar.png" alt="..." width={80} className="rounded-circle shadow-sm" />
                            <p className="nombre-mensaje">Luke Combs</p>
                            <p className="mensaje-card">k onda inje ya comio?</p>
                            <p className="hora-mensaje">01/10/2022</p>
                            <div className="mensaje-unread" />
                        </div>
                        <div className="card-mensaje">
                            <div className="status busy" />
                            <img src="https://bootstrapious.com/i/snippets/sn-v-nav/avatar.png" alt="..." width={80} className="rounded-circle shadow-sm" />
                            <p className="nombre-mensaje">Macarena Lopez</p>
                            <p className="mensaje-card">ola wapo q vas hacer el fin</p>
                            <p className="hora-mensaje">29/09/2022</p>
                            <div className="mensaje-unread" />
                        </div>            
                    </div>
                    {/* MensajeContenedor */}
                    <div className="col" style={{backgroundColor: '#F4F4F4'}}>
                        <div className="titulo-nombre">
                            <h2>Jon Pardi</h2>
                            <p>Activo(a)</p>
                            <img src="https://bootstrapious.com/i/snippets/sn-v-nav/avatar.png" alt="..." width={80} className="rounded-circle shadow-sm" />
                            <FontAwesomeIcon icon={faVideo} color='white' />
                            <FontAwesomeIcon icon={faCircleInfo} color='white' />
                        </div>
                        <div className="mensajes-container">
                            <div className="mensaje-recibido-card">
                                <img src="https://bootstrapious.com/i/snippets/sn-v-nav/avatar.png" alt="..." width={60} className="rounded-circle shadow-sm" />
                                <p id="mensaje-burbuja">Q onda q pex q andas hacindo</p>
                                <p id="hora-burbuja">11:30 AM</p>
                            </div>
                        </div>
                        <div className="escribir-mensaje">
                                <textarea id="w3review" name="w3review" rows={1} cols={70} defaultValue={""} />
                                <a href="https://www.youtube.com">
                                    <FontAwesomeIcon icon={faPaperPlane} color='gray' size='xl'/>
                                </a>
                                <a href="https://www.google.com">
                                    <FontAwesomeIcon icon={faPaperclip} color='gray' size='xl'/>
                                </a>
                        </div>
                    </div>
                </div>                  
            </div>       
        </div>    

    )
}
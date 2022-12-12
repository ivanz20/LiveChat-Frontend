import React, { Component } from 'react'
import { initializeApp } from "firebase/app";
import { getStorage,ref,uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { faPaperclip } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'



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
  const usario = 'ivanzv';

export default class upload extends Component {
    
    constructor(){
        super();
        this.state = {
            uploadValue: 0,
            picture: null
        };

        this.HandleUpload = this.HandleUpload.bind(this);

        

    }

    
    HandleUpload (event){
        const file = event.target.files[0];
         const storageRef = ref(storage, `/fotos/${usario}/${file.name}`)
         const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', snapshot => {
            let perc = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            this.setState({
                uploadValue: perc,
            }) 
        },error => {console.log(error.message)},
        () => {
          
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                console.log(downloadURL)
                this.setState({
                    uploadValue: 100,
                    picture: downloadURL
                });
              });

        }
        );
    }

  render() {
    return (
      <div>
         {/* <progress value={this.state.uploadValue} max="100"></progress> */}
         <div class="image-upload">
            <label for="file-input">
                <FontAwesomeIcon icon={faPaperclip} color='gray' size='xl'/>
            </label>

            <input id="file-input" type="file" onChange={this.HandleUpload} />
            </div>
         <br></br>
         <img width='320' src={this.state.picture} ></img>
      </div>
    )
  }
}

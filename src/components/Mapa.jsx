import { faMultiply } from '@fortawesome/free-solid-svg-icons';
import React, { Component } from 'react'
import { ThemeConsumer } from 'react-bootstrap/esm/ThemeProvider';
import {useJsApiLoader, GoogleMap} from '@react-google-maps/api';
import {MarkerF} from '@react-google-maps/api'




export default class Mapa extends Component {

    const = (isLoaded) =>  useJsApiLoader({
        googleMapsApiKey: 'AIzaSyCj3CaAQnBsR2BB-oh1MXKfgb1hmyX13e4',
    })

  constructor(props){
    super(props);
    this.state = {
        latitud:null,
        longitud:null,
        userAddress: null
    };
    this.getLocation = this.getLocation.bind(this);
    this.getCoordinates = this.getCoordinates.bind(this);
     this.center = {lat: this.state.latitud, lng: this.state.longitud}
  }
  
  getLocation(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(this.getCoordinates);
        }
        else{
            console.log("Errorxd")
        }
    }
    
    getCoordinates(position){
        this.setState({
            latitud: position.coords.latitude,
            longitud: position.coords.longitude
        })
    }
   
  render() {
    
   

    return (
                 <div>
                 
                    <GoogleMap
                    center={{lat:  this.state.latitud,lng: this.state.longitud}}
                    zoom={15}
                    mapContainerStyle={{width: '250px', height: '250px'}}
                    options={{
                        zoomControl: false,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        noClear: false,
                    }}>
                    <MarkerF key="marker_1"position={{lat: this.state.latitud,lng: this.state.longitud}}/>
                    </GoogleMap>
                 
               </div>
    )
  }
}

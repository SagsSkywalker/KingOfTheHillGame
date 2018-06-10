import React, { Component } from 'react'
class Map extends Component{

    constructor(props)
    {
        super(props);
        var userMarkers = [];
        this.initMap = this.initMap.bind(this);
    }

    componentDidMount()
    {
        this.initMap();
    }

    cargarMarkers(map)
    {
        alert("startmarkers");
        this.props.currentMarkers.forEach(user => {
            
            var marker = new this.props.google.maps.Marker({
                map: map,
                animation: this.google.maps.Animation.DROP,
                position: {lat : user.Location.l[0], lng : user.Location.l[1]},
                title: user.nickname
            });
        
            this.userMarkers.push(marker);
        });
        alert("endmarkers");
    }

    initMap()
    {
        this.map = new this.props.google.maps.Map(
            this.refs.map,
            {
                center: {lat: 21.150908, lng: -101.71110470000002},
                zoom: 15
            }
        );
        this.cargarMarkers(this.map);
    }

    render()
    {
        return(
            <div ref="map" style= { {height: 400} }>
                cargando mapa...
            </div>
        );
    }
}

export default Map;
Jaf.maps = {
    cartes : {},
    initEffect : function() {
        Jaf.maps.geocoder   = new google.maps.Geocoder();
        Jaf.maps.itineraire = new google.maps.DirectionsService();
        Jaf.maps.flagInit   = true;
    },

    createMap : function (idmap,idpanel) {
        var div_map = $('#'+idmap);
        if ( div_map.length > 0 ) {
            Jaf.maps.initEffect();
            div_map.html('');
            Jaf.maps.cartes[ idmap ] = new google.maps.Map(document.getElementById(idmap), {
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            if (idpanel && idpanel.length > 0) dirRenderer.setPanel(document.getElementById(idpanel));
            return Jaf.maps.cartes[ idmap ] ;
        }
        return null;
    },
    
    addParcours : function( idmap , tab ) {
        var bounds = new google.maps.LatLngBounds();
        var carte    = Jaf.maps.cartes[ idmap ];
        var parcours = [];
        for(var i in tab) {
            var pos = new google.maps.LatLng(tab[i][0],tab[i][1]);
            parcours.push(pos);
            bounds.extend(pos);
        }
        carte.fitBounds(bounds);
        
        var flightPath = new google.maps.Polyline({
            path: parcours,
            geodesic: true,
            strokeColor: '#0000FF',
            strokeOpacity: 0.9,
            strokeWeight: 4
          });

        flightPath.setMap(carte);
        
        var m_depart = new google.maps.Marker({
            position: new google.maps.LatLng(tab[0][0],tab[0][1]),
            map: carte,
            title: 'Depart'
          });
        var m_arriver = new google.maps.Marker({
            position: new google.maps.LatLng(tab[ tab.length-1 ][0],tab[tab.length-1][1]),
            map: carte,
            title: 'Arivée'
          });
    },

    loadMap : function (idmap,depart,idpanel,macallbackfonction) {
        var div_map = $('#'+idmap);
        if ( div_map.length > 0 ) {
            Jaf.maps.initEffect();
            div_map.html('');
            Jaf.maps.geocoder.geocode({
                address: depart,
            }, function(geoResult, geoStatus) {
                var res={};
                if (geoStatus == google.maps.GeocoderStatus.OK) {
                    map = new google.maps.Map(document.getElementById(idmap), {
                        zoom: 11,
                        center: geoResult[0].geometry.location,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    });
                    var marker = new google.maps.Marker({
                    position: geoResult[0].geometry.location,
                    map: map
                    });

                    if (idpanel && idpanel.length > 0) dirRenderer.setPanel(document.getElementById(idpanel));
                    if ( macallbackfonction ) {
                        macallbackfonction(geoResult);
                    }
                }
            });
        }
    },

    loadMapItineraireNew : function (options,macallbackfonction) {
        // a faire pour afficher les étapes
        
        var idmap = options.idmap;
        var etapes = options.etapes ? options.etapes : [] ;
        if ( options.idpanel) var idpanel =options.idpanel;
        var traffic =  options.traffic ? options.traffic : false;

        var div_map = $('#'+idmap);
        if ( div_map.length > 0 ) {
            Jaf.maps.initEffect();
            div_map.html('');
            
            var itineraireOptions = {
                origin                   : etapes[0],
                destination              : etapes[ etapes.length - 1],
                travelMode               : google.maps.DirectionsTravelMode.DRIVING,
                unitSystem               : metricLocale ? ( metricLocale == 'mi' ? google.maps.DirectionsUnitSystem.IMPERIAL : google.maps.DirectionsUnitSystem.METRIC ) : google.maps.DirectionsUnitSystem.METRIC,
                provideRouteAlternatives : true
            }
          
            if (etapes.length>2) {
                itineraireOptions.waypoints = new Array();
                for (i in etapes) {
                    if (1*i>0 && 1*i<(etapes.length-1)) {
                       itineraireOptions.waypoints.push({location:etapes[i]});
                    }
                }
            }
            
            Jaf.maps.itineraire.route(itineraireOptions, function(dirResult, dirStatus) {
                if (dirStatus != google.maps.DirectionsStatus.OK) {
                    Jaf.log('Directions failed: ' + dirStatus);
                    return;
                }
                //Jaf.log(dirResult);
                var res={
                    distance_km   : 0,
                    duree_seconde : 0,
                    duree         : '00:00:00'
                };
                for(var i in dirResult.routes[0].legs ) {
                    var resultatChoisi = dirResult.routes[0].legs[i];
                    res.distance_km   += resultatChoisi.distance.value/1000;
                    res.duree_seconde += resultatChoisi.duration.value;
                }
                var heure        = Math.floor(res.duree_seconde/3600);
                var minute       = Math.round(res.duree_seconde/60 - heure*60);
                res.duree        = sprintf('%02d:%02d:00',heure,minute);
                // Show directions
                var map = new google.maps.Map(document.getElementById(idmap), {
                    zoom: 8,
                    center: new google.maps.LatLng(resultatChoisi.start_location.lat, resultatChoisi.start_location.lng),
                    mapTypeId: google.maps.MapTypeId.ROADMAP //[SATELLITE, HYBRID, TERRAIN, ROADMAP]
                });
                

                var dirRenderer = new google.maps.DirectionsRenderer();
                dirRenderer.setMap(map);
                for(var i in dirResult.routes[0].legs ) {
                    var b = new google.maps.LatLngBounds(dirResult.routes[0].legs[i].start_location);
                    map.fitBounds(b);
                    var c = new google.maps.LatLngBounds(dirResult.routes[0].legs[i].end_location);
                    map.fitBounds(c);
                }
                if ( traffic ) {
                    var trafficLayer = new google.maps.TrafficLayer();
                    trafficLayer.setMap(map);
                }
                
                if (idpanel && idpanel.length > 0) dirRenderer.setPanel(document.getElementById(idpanel));
                dirRenderer.setDirections(dirResult);
                if ( macallbackfonction ) {
                    macallbackfonction(res,map);
                }
            });
            
        }
                            
        //Jaf.maps.loadMapItineraire(idmap,etapes[0],etapes[ etapes.length - 1],idpanel,macallbackfonction);
    },

    getDataListeResultatGeocode : function(data) {
        var result        = [];
        
        for (i in data.results) { 
            var r=data.results[i];
            if ( data.results[i].formatted_address ) {
                r.type = 'adresse';
                for (j in data.results[i].address_components) {
                    var ac=data.results[i].address_components[j];
                    if (ac.types.indexOf('postal_code')>-1) {
                        r.cp = ac.long_name;
                    }
                    if (ac.types.indexOf('street_number')>-1) {
                        r.street_number = ac.long_name;
                    }
                    if (ac.types.indexOf('route')>-1) {
                        r.route = ac.long_name;
                    }
                    if (ac.types.indexOf('locality')>-1) {
                        r.ville = ac.long_name;
                    }
                    if ( ac.types.indexOf('country')>-1) {
                        r.pays = ac.long_name;
                    }
                    
                }
                
                r.lat = r.geometry.location.lat();
                r.lng = r.geometry.location.lng();
                r.adresse = (r.street_number ? r.street_number + ' ' : '' ) + ( r.route ? r.route : '' );
                result.push(r);
            }
        }

        return result;
    },

    getDataListeResultatGeocode_new : function(data) {
        var result        = [];
        
        for (i in data) { 
            var r=data[i];
            if ( r.formatted_address ) {
                for (j in r.address_components) {
                    if (r.address_components[j].types.indexOf('postal_code')>-1) {
                        r.cp = r.address_components[j].long_name;
                    }
                    if (r.address_components[j].types.indexOf('street_number')>-1) {
                        r.street_number = r.address_components[j].long_name;
                    }
                    if (r.address_components[j].types.indexOf('route')>-1) {
                        r.route = r.address_components[j].long_name;
                    }
                    if (r.address_components[j].types.indexOf('locality')>-1) {
                        r.ville = r.address_components[j].long_name;
                    }
                    if ( r.address_components[j].types.indexOf('country')>-1) {
                        r.pays = r.address_components[j].long_name;
                    }
                    if ( r.address_components[j].types.indexOf('street_address')>-1) {
                        r.type = 'adresse';
                    }
                    if ( r.address_components[j].types.indexOf('airport')>-1) {
                        r.type = 'aeroport';
                        r.libelle = r.address_components[j].long_name;
                    }
                    if ( r.address_components[j].types.indexOf('train_station')>-1) {
                        r.type = 'gare';
                        r.libelle = r.address_components[j].long_name;
                    }
                    if ( r.address_components[j].types.indexOf('establishment')>-1) {
                        r.libelle = r.address_components[j].long_name;
                    }
                    
                }
                if ( r.types.indexOf('airport')>-1) {
                        r.type = 'aeroport';
                }
                if ( r.types.indexOf('train_station')>-1) {
                        r.type = 'gare';

                }					
                r.lat = r.geometry.location.lat();
                r.lng = r.geometry.location.lng();
                r.adresse = (r.street_number ? r.street_number + ' ' : '' ) + ( r.route ? r.route : '' );
                if ( !r.type || r.type.length==0 ) r.type='adresse'; 

                result.push(r);
            }
        }
        return result;
    },

    initEffect_completeForm : function( monform , callbackfonction ) {
        var form = $(monform);
        form.find('[data-maps-role="adresse"],[data-maps-role="cp"],[data-maps-role="ville"],[data-maps-role="pays"],[data-maps-role="departement"]').keyup(function(){
            if ($(this).val().length>=5) { 
                var adresseComplete = 
                            (typeof $('[data-maps-role="adresse"]')!='undefined' ? $('[data-maps-role="adresse"]').val() : '');
                    + ' ' + (typeof $('[data-maps-role="cp"]')!='undefined' ? $('[data-maps-role="cp"]').val() : '');
                    + ' ' + (typeof $('[data-maps-role="ville"]')!='undefined' ? $('[data-maps-role="ville"]').val() : '');
                    + ' ' + (typeof $('[data-maps-role="pays"]')!='undefined' ? $('[data-maps-role="pays"]').val() : '');
                    + ' ' + (typeof $('[data-maps-role="departement"]')!='undefined' ? $('[data-maps-role="departement"]').val() : '');
                $.get('https://maps.googleapis.com/maps/api/geocode/json', {address:adresseComplete, sensor:false}, function(data){
                    street_number = route = locality = country = postal_code = result = '';
                    var results = Jaf.maps.getDataListeResultatGeocode(data);
                    var res='<ul>';
                    for (i in results) {
                        if ( data.results[i].formatted_address ) {
                            res += '<li data-results="'+ i
                            + '" data-geo-adresse="'   + results[i].street_number+' '+results[i].route
                            + '" data-geo-cp="'        + results[i].cp
                            + '" data-geo-ville="'     + results[i].ville
                            + '" data-geo-pays="'      + results[i].pays
                            + '">' + data.results[i].formatted_address + '</li>';
                        }
                    }
                    $('[data-maps-role="listeResultat"]').html( res + '</ul>');
                    $('[data-maps-role="listeResultat"] li').click(function(){
                        
                        for (k in Jaf.maps.listeChampGecode) {
                            if ($(this).data('geo-'+Jaf.maps.listeChampGecode[k])) {
                                $('input[data-maps-role="'+Jaf.maps.listeChampGecode[k]+'"]').val($(this).data('geo-'+Jaf.maps.listeChampGecode[k]));
                            }
                        }
                         if ( callbackfonction ) callbackfonction( $(this) );
                    });
                });
            }
        });
        // a declancher quand on a cliqué sur une adresse possible ou que google n'a trouvé qu'une seule adresse
       
    },

    getDistanceKm : function(lat_a, lon_a, lat_b, lon_b)  { 
        if ( (lat_a==0 && lon_a==0) || (lat_b==0 && lon_b==0) ) return -1;
        if ( lat_a==lat_b && lon_a==lon_b) return 0;
        var t = Math.sin(lat_a*0.01745329)*Math.sin(lat_b*0.01745329)+Math.cos(lat_a*0.01745329)*Math.cos(lat_b*0.01745329)*Math.cos(lon_a*0.01745329-lon_b*0.01745329);
        var d = (Math.atan(-t/Math.sqrt(-t*t+1))+2*Math.atan(1))*6366.8329; 
        return d;
    },

    listeChampGecode : ['adresse', 'cp', 'ville', 'pays', 'departement','formatted_address','lat','lng','type','libelle']
}

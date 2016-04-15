var Mobi = Jaf.extend(new JafController('wayd'));

Jaf.cm.configConcepts    = {
    C_Geo_Lieu                 : 'LIE',
    C_Com_Commande             : 'COM',
    C_Com_Facture              : 'FAC', 
    C_Com_Reglement            : 'REL',
    C_Com_Grille               : 'GRI',
    C_Gen_EntiteCommerciale    : 'ECO',
    C_Gen_Client               : 'CLI',
    C_Gen_Chauffeur            : 'CHU',
    C_Gen_Contact              : 'COT',
    C_Gen_Mission              : 'MIS',
    C_Gen_Voiture              : 'VOI',
    C_Gen_TypeVehicule         : 'TVE',
    C_Gen_Civilite             : 'CIV',
    C_Gen_Presence             : 'PRS',
    C_Gen_Passager             : 'PAS',
    C_Gen_EtapePresence        : 'EPR',
    C_Com_ModeReglement        : 'MRE',
    C_Gen_TypePresencePassager : 'TPP',
    C_Com_TypeService          : 'TSE',
    C_Gds_ChampMission         : 'CMI'
};
    
Mobi.version             = '1.0'; 
Mobi.newversion          = false;
Mobi.Tri.nomColonne      = 'date_debut';
Mobi.page_concept        = '';
Mobi.page_action         = '';
Mobi.step                = 0;
Mobi.geoloc_actif        = false;
Mobi.PileFiltres         = [];
Mobi.smis                = ['16','4','11','8','9','19']; //visible par le chauffeur
Mobi.listeConcepts       = {
    C_Com_Commande : '',
    C_Com_Facture : '', 
    C_Com_Reglement : '',
    C_Com_Grille : '',
    C_Com_ModeReglement : '',
    C_Gen_EntiteCommerciale : '',
    C_Gen_Client : '',
    C_Gen_Chauffeur : '',
    C_Gen_Contact : '',
    C_Gen_Mission : '',
    C_Gen_Voiture : '',
    C_Gen_TypeVehicule : '',
    C_Gen_Civilite : '',
    C_Gen_Presence : '',
    C_Gen_Passager : '',
    C_Gen_EtapePresence : '',
    C_Gen_TypePresencePassager : '',
    C_Geo_Lieu : ''
};
 
Mobi.log = function(chaine) {
    Mobi.old_log(chaine); 
    var madate = new Date();

    Jaf.zoneMessageDebug_content += sprintf('[CHU#%04d] %s %s | ',Mobi.chu_id,Jaf.formatValue.Date(madate),Jaf.formatValue.Heure(madate) ) + JSON.stringify(chaine) + "\n";
    localStorage.setItem('wayd_log',Jaf.zoneMessageDebug_content);
    Mobi.zoneMessageDebug.val(Jaf.zoneMessageDebug_content);
} 

Mobi.setIsBlocked = function() {
    if ( Mobi.step < 6 ) {
        $('#init').append(Jaf.translate('DIC_SI_BLOQUE_SUIVANT'));
        var bt = $('<div class="rechargement">'+Jaf.translate('DIC_RECHARGEMENT_ETAPE1')+'</div>');
        bt.click( function () { window.applicationCache.update();window.location.reload(true); } );
        $('#init').append(bt);
        var bt = $('<div class="rechargement">'+Jaf.translate('DIC_RECHARGEMENT_ETAPE2')+'</div>');
        bt.click(Mobi.reload);
        $('#init').append(bt);
    }
}

Mobi.nbProcessus = {
    init     : 0,
    creating : 0,
    created  : 0,
    loading  : 0,
    loaded   : 0,
    loading2 : 0,
    loaded2  : 0,
    saving   : 0,
    saved    : 0
}

Mobi.deconnexion = function() {
    if ( confirm('Si vous cliquez sur confirmer, toutes les données stockées sur votre terminal seront effacées. Vous ne pourrez plus y avoir accès en mode déconnecté.')) {
        Mobi.reload();
    }
}

Mobi.homePage = function() {
    Mobi.mis_id=0; 
    Mobi.changePage('home');
    return;
}

Mobi.retourPage = function() {
    if ( Mobi.page_concept == 'P_Gen_Mission' && Mobi.page_action=='fAction' ) {
        if ( Mobi.retourSurListe == 'agendaAction' ) {
            Mobi.ouvreAgenda();
            return '';
        }
        if ( Mobi.retourSurListe == 'lAction' ) {
            Mobi.changePage('P_Gen_Mission',Mobi.retourSurListe);
            $('#MIS'+Mobi.mis_id).remove();
            Mobi.mis_id=0; 
            Mobi.analyseMission();
            return '';
        }
    }

    if ( Mobi.page_concept == 'P_Gen_Mission' && Mobi.page_action=='frais' ) {
        Mobi.changePage('P_Gen_Mission','fAction');
        return;
    }

    if ( Mobi.page_concept == 'P_Gen_Mission' && Mobi.page_action=='kmEtHeure' ) {
        Mobi.changePage('P_Gen_Mission','fAction');
        return;
    }
    Mobi.ouvreHomepage();
}

Mobi.changePage = function(concept,action) {
    Jaf.log('ChangePage : '+concept+':'+action);
    Mobi.closePopup('menu');
    var content = $('#content').first();
    if ( !Mobi.page_concept || Mobi.page_concept != concept) {
        if (Mobi.page_concept) content.removeClass(Mobi.page_concept);
        content.addClass(concept);
    }
    if ( Mobi.page_action != action) {
        if (Mobi.page_action) content.removeClass(Mobi.page_action);
        content.addClass(action);
    }
    if ( concept=='home'  ) {
        $('#home').slideDown(500);
    } else {
        $('#home').slideUp(500);
    }
    if ( concept=='compte' ) {
        $('#compte').slideDown(500);
    } else {
        $('#compte').slideUp(500);
    }
    
    if ( concept=='geolocalisation' ) {
        $('#geolocalisation').slideDown(500);
    } else {
        $('#geolocalisation').slideUp(500);
    }    
    

    if ( concept=='code_rattachement' ) {
        $('#page_rattachement').slideDown(500);
    } else {
        $('#page_rattachement').slideUp(500);
    }

    if ( concept=='P_Gen_Mission' && action=='lAction' ) {
        Mobi.retourSurListe = 'lAction';
        Mobi.analyseMission();
        $('#liste').slideDown(500);
        $('#liste').on( "swiperight", Mobi.retourPage);

    } else {
        $('#liste').slideUp(500);
    }

    if ( concept=='P_Gen_Mission' && action=='agendaAction' ) {
         Mobi.retourSurListe = 'agendaAction';
        Mobi.analyseMission();
        $('#agenda').slideDown(500);
    } else {
        $('#agenda').slideUp(500);
    }


    if ( concept=='P_Gen_Mission' && action=='fAction' ) {
       $('#fiche').slideDown(500);
       $('#fiche').on( "swiperight", Mobi.retourPage);
    } else {
       $('#fiche').slideUp(500);
    }
    if ( concept=='faq' ) {
       $('#page_faq').slideDown(500);
       $('#page_faq').on( "swiperight", Mobi.retourPage);
    } else {
       $('#page_fiche').slideUp(500);
    }
    
    Mobi.page_concept = concept;
    Mobi.page_action  = action;
}

Mobi.openPopup = function( id ) {
    
    if ( Mobi.openPopup.ouverte && Mobi.openPopup.ouverte != id ) {
        Mobi.closePopup(Mobi.openPopup.ouverte);
    }
    if ( Mobi.openPopup.ouverte == id ) {
        Mobi.closePopup(id);
    } else {
        //$('#'+Mobi.openPopup.ouverte).slideUp(500);
        Mobi.openPopup.ouverte = id;
        $('#'+id).slideDown(500);
        $('body').scrollTop(0);
    }
}

Mobi.closePopup = function( id ) {
    $('#'+id).slideUp(500);
    Mobi.openPopup.ouverte = false;
}

Mobi.updateChauffeurEvent = function(eve) {
    var chu_id    = eve.EVE_PRIMARY;
    var chauffeur = Jaf.cm.getConcept('C_Gen_Chauffeur').getRow(chu_id);
    $('#listeContent .chauffeur[data-chu_id='+chu_id+']').html( chauffeur.CHU_NOM+ ' ' + chauffeur.CHU_PRENOM );
}

Mobi.initFiltre = function() {
    Mobi.aujo = Jaf.date2mysql(new Date());
    Mobi.filtres = {
        date_debut : Mobi.aujo,
        date_fin   : Mobi.aujo,
        smi_id     : 0,
        com_id     : '',
        recherche  : '' 
    }
    Mobi.filtres = {};
   
    $('#recherche').find('input,select').each(function() {
        if ( Mobi.filtres[ $(this).attr('name') ] != null  ) {
            $(this).val( Mobi.filtres[ $(this).attr('name') ] );
        } 
    });
    
    $('#bt_recherche').unbind('click').click( function() {
        $('#recherche').find('input,select').each(function() {
            if ( $(this).val().length>0 ) {
                Mobi.filtres[ $(this).attr('name') ] = $(this).val();
            } else {
                delete(Mobi.filtres[ $(this).attr('name') ]);
            }
        });
        var msg = '';
        if ( Jaf.getDate( Mobi.filtres.date_debut ) < Mobi.date_filtre_min ) {
            msg+= 'Votre date de début de recherche ne peut pas être plus petite que le '+Jaf.formatValue.Date(Mobi.date_filtre_min);
            $('#recherche input[name=date_debut]').val(Jaf.date2mysql(Mobi.date_filtre_min) );
            Mobi.filtres.date_debut = Jaf.date2mysql( Mobi.date_filtre_min );
        }
        if ( Jaf.getDate( Mobi.filtres.date_fin ) > Mobi.date_filtre_max ) {
            msg+= "\nVotre date de fin de recherche ne peut pas être plus grande que le "+Jaf.formatValue.Date(Mobi.date_filtre_max);
            $('#recherche input[name=date_fin]').val(Jaf.date2mysql(Mobi.date_filtre_max) );
            Mobi.filtres.date_fin = Jaf.date2mysql( Mobi.date_filtre_max );
        }

        if ( msg.length>0) {
            alert(msg);
        }

        Mobi.analyseMission();
        Mobi.closePopup('recherche');
    });
    $('#bt_raz').unbind('click').click( function() {
        Mobi.initFiltre();
    });
  
}

Mobi.initAffichage = function() {
    
    Mobi.infoGeoloc      = Jaf.getStorage('infoGeoloc',{lat:-1,lng:-1,temps:0});
    Jaf.eve.paramsToSend = Jaf.getStorage('paramsToSend');
    
    Mobi.urlController        = Mobi.baseUrl+Mobi.name;
    Jaf.cm.urlDb              = Mobi.urlController+'/set-data/session/0/concept/';
    Jaf.cm.nameStorage        = Mobi.name;
    Mobi.actionLoadData       = 'get-data-chauffeur';
    Jaf.eve.actionGetEvent    = 'get-events-chauffeur';
    Jaf.cm.actionSetRessource = 'set-ressource-chauffeur';
    Jaf.cm.actionSynchro      = 'synchronize-chauffeur';
    Jaf.cm.onload(Mobi.majEcrans);
    
    
    $('#zoneAgenda').on( "swipeleft", function(e) {
        var d       = Jaf.getDate(Mobi.jourSelected+' 04:00:00');
        var d_apres = new Date( d.getTime()+24*3600000 );
        if ( d_apres.getTime() > Mobi.debut_semaine + 13*24*3600000 ) {
            Mobi.actions.message('Vous ne pouvez pas consulter les jours d\'après');
        } else {
            Mobi.AgendaGoto( Jaf.date2mysql(d_apres));
        }
    });
    
    $('#zoneAgenda').on( "swiperight", function(e) {
        var d       = Jaf.getDate(Mobi.jourSelected+' 04:00:00');
        var d_avant = new Date( d.getTime()-24*3600000 );
        if ( d_avant.getTime() < Mobi.debut_semaine - 8*24*3600000 ) {
            Mobi.actions.message('Vous ne pouvez pas consulter les jours d\'avant');
        } else {
            Mobi.AgendaGoto(Jaf.date2mysql(d_avant));
        }
    });
    
    $('#init .titre').html('WAY-D v'+Mobi.version);
    $('#bt_login').click(function() {
        var login    = $('#login input[name=login]').val();
        var mdp      = $('#login input[name=mdp]').val();
        var lan_code = $('#login select[name=LAN_CODE]').val();
        Jaf.LAN_CODE = lan_code;
        localStorage.setItem(Mobi.name + '_connexion_login',login);
        localStorage.setItem(Mobi.name + '_connexion_mdp'  ,mdp);
        localStorage.setItem('LAN_CODE'  ,lan_code);
        Mobi.closePopup('login');
        Jaf.cm.gds.send('connexion-wayd',{
            'login' : login,
            'mdp'   : mdp
        },Mobi.actions.make);
    });
    
    $('#mdp_oublier').click(function() {
        var login    = $('#login input[name=login]').val();
        if ( login.length>5) {
            Jaf.cm.gds.send('chauffeur-mdp-oublier',{
                'login' : login
            },Mobi.actions.make);
        } else {
            Mobi.actions.message('Vous devez renseigner l\'email de votre compte en login');
        }
    });
    
    $('#page_rattachement .btn.confirmer').click(function() {
        var code = $('#code_rattachement').val();
         $(this).html('<span class="icone">Ü</span>'+Jaf.translate('DIC_MISSION_EN_COURS'));
        Jaf.cm.gds.send('chauffeur-add-limo' , { code : code } , function( params ) {
            $(this).addClass('saveOk');
            Mobi.actions.make(params);
        });
    });
    
    $('#nouveau_compte').click(function() {
        Mobi.closePopup('login');
        Mobi.ouvreCompte();
    });
    
    $('#compte .btn_onglet').click(function() {
        $('#compte .onglet,#compte .btn_onglet').removeClass('selectionner');
        $(this).addClass('selectionner');
        $('#compte .onglet[data-role=' + $(this).data('role') + ']').addClass('selectionner');
    });
    
    $('#compte .btn.confirmer').click(Mobi.enregistrerCompte);

    
    Jaf.eve.mode_deco = true;

    $('#header .btn.retour').click(Mobi.retourPage);

    
    // mise en place du debugger
    Mobi.zoneMessageDebug         = $('#message textarea[name=message]').first();
    var log_value                 = localStorage.getItem('wayd_log');
    Jaf.zoneMessageDebug_content  = log_value ? log_value : '';
    //Mobi.depannage();
    Mobi.old_log                  = Jaf.log;
    Jaf.log                       = Mobi.log;
    setInterval(Mobi.debuggage,10000);

    $('#init').slideUp(500);
    $('#header').slideDown(500);
    
    Mobi.initFiltre();
    Mobi.ouvreHomepage();

    
    $('#header .btn.recherche').click(function() {
        Mobi.openPopup('recherche');
    });
    
    $('#header .btn.homepage').click(Mobi.homePage);
     
    $('#header .btn.menu').click(function() {
        Mobi.openPopup('menu');
    });

    
    $('#home .boutonBas .lien.confirmer').click(function() {
        Mobi.filtres = {
            date_debut : Jaf.date2mysql(new Date()),
            smi_id     : 16
        }
        Mobi.analyseMission();
        if ( Mobi.nbTotalLigne==1 ) {
            Mobi.ouvreMission( {mis_id:Mobi.listeMissionFiltree[0].MIS_ID , database : Mobi.listeMissionFiltree[0].limo} );
        } else {
            Mobi.changePage('P_Gen_Mission','lAction');
        }
    });
    $('#home .boutonBas .lien.modifier').click(function() {
        Mobi.filtres = {
            date_debut : Jaf.date2mysql(new Date()),
            MIS_FLAG_MODIFIER : 1 
        }
        Mobi.analyseMission();
        if ( Mobi.nbTotalLigne==1 ) {
            Mobi.ouvreMission( {mis_id:Mobi.listeMissionFiltree[0].MIS_ID, database : Mobi.listeMissionFiltree[0].limo} );
        } else {
            Mobi.changePage('P_Gen_Mission','lAction');
        }
    });
    $('#home .boutonBas .lien.cloturer').click(function() {
        Mobi.filtres = {
            cloturer : 1
        }
        Mobi.analyseMission();
        if ( Mobi.nbTotalLigne==1 ) {
            Mobi.ouvreMission( {mis_id:Mobi.listeMissionFiltree[0].MIS_ID, database : Mobi.listeMissionFiltree[0].limo} );
        } else {
            Mobi.changePage('P_Gen_Mission','lAction');
        }
    });
    this.status = 1;
    this.execute();
}

Mobi.initApi = function() {
    Mobi.ach_id = localStorage.getItem(  Mobi.name +'_ach_id');
    if ( Mobi.ach_id === null || !(Mobi.ach_id*1 >= 10000) ) {
        $.getJSON( Mobi.baseUrl + Mobi.name + '/create-api' , {} , Mobi.actions.make );
    } else {
        Mobi.ach_secret_key =localStorage.getItem(  Mobi.name +'_ach_secret_key' );
        Jaf.cm.gds  = new Jaf.Gds( 'ach_id' , Mobi.ach_id , Mobi.ach_secret_key , Mobi.baseUrl );
        Mobi.status=2;
        Mobi.execute();
    }
}

Mobi.initConnexion = function() {
    Jaf.log('initConnexion');
    var login = localStorage.getItem(Mobi.name + '_connexion_login');
    if ( login === null || login.length==0 ) { 
        if ( !Mobi.openPopup.ouverte || ( Mobi.openPopup.ouverte && Mobi.openPopup.ouverte!='login') ) {
            Mobi.openPopup('login');   
            $('#connexion_login').val( localStorage.getItem(Mobi.name + '_connexion_login') );
            $('#connexion_mdp'  ).val( localStorage.getItem(Mobi.name + '_connexion_mdp') );
        }
    } else {
        if ( !Mobi.flag_search_code && window.location.search.substr(1,4)=='code') {
            code = window.location.search.substr(6);
            Mobi.flag_search_code=true;
            Jaf.cm.gds.send('chauffeur-add-limo' , { code : code } , Mobi.actions.make );
        } else {
            Mobi.geoloc_actif = localStorage.getItem(Mobi.name + '.geoloc_actif')==0 ? false : true;
            Mobi.checkGeoloc();
            
            var infos         = Jaf.getStorage( 'limos' );
            Mobi.infoLimos    =  {};
            Mobi.databases    = [];
            for(var i in infos) {
                var limo = infos[i].INS_COMPTE;
                Mobi.infoLimos[ limo ] = infos[i];
                Mobi.databases.push(limo);
                Jaf.cm.setDatabase(limo);
                Jaf.cm.getConcept('C_Gen_EtapePresence').addIndex('EPR_MIS_ID');
                Jaf.cm.getConcept('C_Gen_Presence'     ).addIndex('PRS_MIS_ID');
            }
            if ( Mobi.databases.length > 0 ) {
                this.status    = 3;
                this.execute();
            } else {
                Mobi.actions.message('Vous devez renseigner votre code de rattachement. Aller dans menu > Rentrez un code de rattachement');
            }
        }
    }
}

/* ------------------ ACTIONS -------------------------*/
Mobi.actions = {};

Mobi.actions.make = function(data) {
    
    if ( Mobi.actions[ data.action ] ) {
        Mobi.actions[ data.action ](data.params);
    }
}

Mobi.actions.setAchId = function(data) {
    localStorage.setItem(  Mobi.name +'_ach_id'         , data.ACH_ID);
    localStorage.setItem(  Mobi.name +'_ach_secret_key' , data.ACH_SECRET_KEY);
    Mobi.execute();
}

Mobi.actions.setListeLimo = function(data) {
    Jaf.setStorage(  'limos'        , data.limos );
    Jaf.setStorage(  'chauffeur'    , data.chauffeur );
    localStorage.setItem('LAN_CODE' , data.chauffeur.CHU_LAN_ID=='1' ? 'FR' :'EN');
    Mobi.changePage('home');
    Mobi.execute();
}

Mobi.actions.erreurLogGds = function(data) {
    Jaf.log(data);
}

Mobi.actions.message = function(data) {
    alert(data);
}

Mobi.enregistrerCompte = function() {
    var chu                 = {};
    var flag_obligatoire    = true;
    var flag_complementaire = true;
    var message             = '';
    $('#form_compte .non_completer').removeClass('non_completer');
    
    $('#form_compte .onglet[data-role=obligatoire] input,#form_compte .onglet[data-role=obligatoire] select').each(function() {
        var value = $(this).val();
        if ( value.length==0) {
            if( $(this).attr('name')=='CHU_MDP' || $(this).attr('name')=='CHU_MDP_CONFIRM' ) {
                if (  ! $('#CHU_ID').val() > 0 ) {
                    flag_obligatoire=false;
                    $(this).addClass('non_completer');
                }
            } else {
                flag_obligatoire=false;
                $(this).addClass('non_completer');
            }
        }
        chu[ $(this).attr('name') ] = value;
    });
    if ( !flag_obligatoire ) message +='Vous devez completer tous les champs obligatoires.';
    
    if ( chu.CHU_MDP != chu.CHU_MDP_CONFIRM ) {
        message += ' Confirmation du mot de passe incorrect.';
        flag_obligatoire = false;
    }
    if ( chu.CHU_TEL_MOBILE_1.length < 7 || chu.CHU_TEL_MOBILE_1.substr(0,3) != '+33' ) {
        message += ' Numéro de téléphone incorrect. Il doit commencer par +33.';
        $('#CHU_TEL_MOBILE_1').addClass('non_completer');
        flag_obligatoire = false;
    }
    
    $('#form_compte .onglet[data-role=complementaire] input,#form_compte .onglet[data-role=complementaire] select').each(function() {
        var value = $(this).val();
        if ( value.length==0) flag_complementaire=false;
        chu[ $(this).attr('name') ] = value;
    });
    if ( flag_obligatoire ) {
        $(this).html('<span class="icone">Ü</span>'+Jaf.translate('DIC_MISSION_EN_COURS'));
        Jaf.cm.gds.send('chauffeur-compte' , chu , function( params ) {
            $(this).addClass('saveOk');
            Mobi.actions.make(params);
        });
    } else {
        Mobi.actions.message(message);
    }
}

Mobi.isMissionAffichable = function (row) {
    var flag                = true;

    flag &= row.MIS_CHU_ID && Mobi.infoLimos[ row.limo ].LCH_REFERENCE_EXTERNE == row.MIS_CHU_ID;
    Jaf.log('limo='+row.limo);
    if ( flag ) {
        if ( row.MIS_DATE_DEBUT && Jaf.getDate( row.MIS_DATE_DEBUT ) ) { 
            if ( row.MIS_HEURE_DEBUT && row.MIS_HEURE_DEBUT.length > 0 ) {
                var heure_debut = Jaf.getTemps(row.MIS_HEURE_DEBUT);
            } else {
                var heure_debut = 0;
            }
            
            var temps_debut_mission = Jaf.getDate( row.MIS_DATE_DEBUT ).getTime() / 1000 + heure_debut;
            if ( row.MIS_HEURE_FIN && row.MIS_HEURE_DEBUT && row.MIS_HEURE_FIN.length>0 && row.MIS_HEURE_DEBUT.length>0 ) {
                var temps_fin_mission   =  ( row.MIS_HEURE_FIN < row.MIS_HEURE_DEBUT ? Jaf.getDate( row.MIS_DATE_DEBUT ).getTime() + 24 * 3600 : Jaf.getDate( row.MIS_DATE_DEBUT ).getTime() / 1000 ) + Jaf.getTemps(row.MIS_HEURE_FIN);
            } else {
                temps_fin_mission = temps_debut_mission;
            }

        } else {
            var temps_fin_mission = temps_debut_mission = 0;
        }
        
        
        if ( Mobi.filtres.com_id > 0 ) {
            flag &= row.MIS_COM_ID==Mobi.filtres.com_id;
        }
        
        if ( Mobi.filtres.date_debut && Mobi.filtres.date_debut.length > 0 ) {
            flag &= temps_debut_mission >= Jaf.getDate(Mobi.filtres.date_debut).getTime() / 1000 ;
        }
        
        if ( Mobi.filtres.date_fin && Mobi.filtres.date_fin.length > 0 ) {
            flag &= temps_debut_mission < Jaf.getDate(Mobi.filtres.date_fin).getTime() / 1000 + 24 * 3600 - 1;
        }
        
        if ( Mobi.filtres.MIS_FLAG_MODIFIER ) {
            flag &= 1*row.MIS_FLAG_MODIFIE==1*Mobi.filtres.MIS_FLAG_MODIFIER;
        }
        
        if ( Mobi.filtres.cloturer ) {
            flag &= ( 1*row.MIS_SMI_ID==9 && row.MIS_HEURE_REEL_FIN && row.MIS_HEURE_REEL_FIN.length > 0 ) ;
        }    
        // statut de mission
        if ( Mobi.filtres.smi_id && Mobi.filtres.smi_id>0 ) {
            flag &= Mobi.filtres.smi_id == row.MIS_SMI_ID;
        }
        flag &= Mobi.smis.indexOf(row.MIS_SMI_ID)>-1;
        
        if ( Mobi.filtres.recherche && Mobi.filtres.recherche.length > 0 ) {
            Jaf.cm.setDatabase(row.limo);
            Mobi.filtres.recherche = Jaf.toUpperCaseSansAccent(Mobi.filtres.recherche);
            var dossier        = Jaf.cm.getConcept('C_Com_Commande').getRow(row.MIS_COM_ID);
            var contactDossier = Jaf.cm.getConcept('C_Gen_Contact').getRow(dossier.COM_COT_ID);
            var client         = Jaf.cm.getConcept('C_Gen_Client').getRow(dossier.COM_CLI_ID);
            var res            = Jaf.toUpperCaseSansAccent(client.CLI_SOCIETE+' '+contactDossier.COT_NOM+' '+contactDossier.COT_PRENOM+ ' '+row.MIS_LISTE_PASSAGERS);
            var flagt          = res.toUpperCase().indexOf( Mobi.filtres.recherche ) > -1;
            if ( !flagt && row.MIS_CHU_ID > 0 )  {
                var chauffeur      = Jaf.cm.getConcept('C_Gen_Chauffeur').getRow(row.MIS_CHU_ID);
                res = Jaf.toUpperCaseSansAccent(chauffeur.CHU_PRENOM+' '+chauffeur.CHU_NOM);
                flagt = res.indexOf( Mobi.filtres.recherche ) > -1;
            }
            flag &= flagt;
        }
    }

	return flag;
}

Mobi.majMission = function(eve) {
    if ( !Mobi.majMission.flag_encours ) {
        Mobi.majMission.flag_encours = true;
        setTimeout(function() {
            var mis_id = eve && eve.CPT_CLASS=='C_Gen_Mission' ? eve.EVE_PRIMARY : 0;
            
            Jaf.cm.urlLoaderData     = '/wayd/loader-data-simple';
            Jaf.cm.loaderData( [] , [] , function () {
                if ( mis_id>0) $('#MIS'+mis_id).remove();
                Mobi.analyseMission();   
                if ( !Mobi.majMission.flag_valorise ) setTimeout(Mobi.valoriseHomepage,500);
                Mobi.majMission.flag_valorise = true;
                Mobi.majMission.flag_encours  = false;
            });
        },500);
    }
}

Mobi.analyseMission = function () {
    var tv     = [];
    for(var i in Mobi.databases) {
        var limo = Mobi.databases[i];
        Jaf.cm.setDatabase( limo );
        var rowset = Jaf.cm.getConcept('C_Gen_Mission').rowset;

        for(var  i in rowset ) {
            var row  = rowset[i];
            row.limo = limo;
            if ( Mobi.isMissionAffichable(row) ) {
                tv.push(row);
            } else {
                $('#MIS'+row.MIS_ID).hide();
            }
        }
    }
    $('#nbMission').html( tv.length+ ( tv.length > 1 ? Jaf.translate('DIC_MISSION_PLURIEL') : Jaf.translate ('DIC_MISSION_SINGULIER') ) ) ;
    //trie de tv
    Mobi.makeTri(tv);
    Mobi.nbTotalLigne        = tv.length;
    Mobi.listeMissionFiltree = tv;
    var cpt = 0;
    var tr1 = $('#listeContent>div.mission').first();
    var mis_tr1 = tr1.length > 0 ? tr1.data('mis_id') : 0;
    for(var i in tv ) {
        var mis_id = tv[i].MIS_ID;
        if ( mis_id == mis_tr1 ) {
            while ( tr1.data('mis_id') > 0 && tr1.data('mis_id') == mis_id ) tr1 = tr1.next();
            mis_tr1 = tr1.data('mis_id');
        } else {
            var MIS = $('#MIS'+mis_id);
            
            if ( MIS.length > 0 ) {
                tr1.before( MIS.detach() );
            } else {
                var MIS = Mobi.newMission(mis_id);
                if ( mis_tr1 > 0 ) {
                    tr1.before( MIS );
                } else {
                    $('#listeContent').append( MIS );
                }
            }
        }
        $('#MIS'+mis_id).addClass( 'td0'+(cpt%2+1) ).removeClass( 'td0'+( (cpt+1)%2+1) ).show();
        cpt++;
    }
    if ( Mobi.filtres.date_debut && Mobi.filtres.date_fin ) { 
        var filtre_date =  Jaf.translate('DIC_DATE_DU')+Jaf.mysql2date(Mobi.filtres.date_debut) +Jaf.translate('DIC_DATE_AU')+Jaf.mysql2date(Mobi.filtres.date_fin);
    } else  if ( Mobi.filtres.date_debut ) { 
      
        if (Mobi.filtres.MIS_FLAG_MODIFIER) {
            var filtre_date = Jaf.translate('DIC_MISSION_MODIFIER');
        } else  if (Mobi.filtres.smi_id==16) {
            var filtre_date = Jaf.translate('DIC_MISSION_A_CONFIRMER');
        } else {
            var filtre_date = Jaf.translate('DIC_DATE_A_PARTIR_DU') + Jaf.mysql2date(Mobi.filtres.date_debut);
        }
    } else {
        if (Mobi.filtres.cloturer) {
            var filtre_date = Jaf.translate('DIC_MISSION_A_FERMER');
        }   
    }
    
    $('#listeContent .infoDate').show();
    
    var date_old='';
    $('#listeContent .infoDate').each(function(){
        if ( date_old == $(this).data('date') ) {
            $(this).hide();
        } else {
            date_old=$(this).data('date');
        }
    });
    
}

Mobi.checkGeoloc = function() {
    if ( navigator.geolocation && Mobi.geoloc_actif && !Mobi.watchPosition ) {
        Mobi.watchPosition = navigator.geolocation.watchPosition(function(position){
            var time      = Math.round(position.timestamp/1000);
            var latitude  = Math.round(position.coords.latitude*100000)/100000;
            var longitude = Math.round(position.coords.longitude*100000)/100000;
            var vitesse   = position.coords.speed;
            if ( !Jaf.eve.paramsToSend.geoloc ) Jaf.eve.paramsToSend.geoloc = '';
            
            var distance = Jaf.maps.getDistanceKm( latitude , longitude , Mobi.infoGeoloc.lat , Mobi.infoGeoloc.lng );
            if ( distance > 0.005 ) {
                if ( vitesse == null ) {
                    var flag_vitesse=false;
                    vitesse = Mobi.infoGeoloc.lat ==-1 ? 0 : Math.round( ( distance * 3600000 ) / ( position.timestamp - Mobi.infoGeoloc.temps ) );
                } else {
                    vitesse = Math.round(3.6*vitesse);
                    var flag_vitesse=true;
                }
                Mobi.infoGeoloc.lat   = latitude;
                Mobi.infoGeoloc.lng   = longitude;
                Mobi.infoGeoloc.temps = position.timestamp;
                Jaf.eve.paramsToSend.geoloc += time+':'+latitude + ':' + longitude + ':' + vitesse+'|';
                Jaf.setStorage('infoGeoloc'   , Mobi.infoGeoloc);
                Jaf.setStorage('paramsToSend' , Jaf.eve.paramsToSend);
                var d = new Date(position.timestamp);
            }
        },function() { Jaf.log('erreur GPS');},{
            enableHighAccuracy : true
        });
    }
}

//----------------------------------------------------------------------------------------
Mobi.fonctionsCel = {};

Mobi.reload = function() {
    Jaf.cm.eraseAll();
    window.location.reload(true);
}

Mobi.depannage = function() {
    var zoneMessage = $('#message');
    Mobi.closePopup('menu'); 
    zoneMessage.slideDown(500);
    zoneMessage.find('.debugBt').unbind('click').click(function() {
        $(this).html('Debuggage '+Jaf.translate('DIC_MISSION_EN_COURS'));
        $(this).unbind('click');
        $(this).css('background-color','#800000');
        Mobi.debuggage();
        setInterval(Mobi.debuggage,3000);
    });
    zoneMessage.find('.razBt').click(function() {
        Jaf.zoneMessageDebug_content = '';
        Jaf.log('raz');
    });
    return false;
}

Mobi.debuggage = function () {
    if ( Jaf.zoneMessageDebug_content.length>0) {
        var datas = {
            log : Jaf.zoneMessageDebug_content
        }
        var trans = $.ajax({
            url   : Mobi.urlController+'/debuggage',
            type  : 'POST',
            data  : datas,
            cache : false
        });
        trans.done(function(data) {
            if ( data.length>0) {
                eval(data);
            }
        });
        Jaf.zoneMessageDebug_content = ''; 
        var madate = new Date();
    }
}

Mobi.fonctionsCel.getPresences = function(mis_id) {
   return Jaf.cm.getConcept('C_Gen_Presence').getRowsetByIndex('PRS_MIS_ID',mis_id,'PRS_TRI');
}

Mobi.fonctionsCel.getEtape = function(mis_id,active_uniquement){
    var rowset = Jaf.cm.getConcept('C_Gen_EtapePresence').getRowsetByIndex('EPR_MIS_ID' , mis_id ,'EPR_TRI'); 
    if ( active_uniquement ) {
        var tab=[];
        for(var i in rowset) {
            if ( rowset[i]['EPR_FLAG_ANNULER']*1 != 1 ) tab.push(rowset[i])
        }
        return tab;
    }
    return rowset;
}

Mobi.fonctionsCel.getLibelleLieuEtape = function(row) {
    if ( row ) {
        var lie_id = row.EPR_LIE_ID;
        var epr_id = row.EPR_ID;
        var numero = row.EPR_NUM_TRANSPORT && row.EPR_NUM_TRANSPORT.length > 0 ? row.EPR_NUM_TRANSPORT : ''; 
        var heure  = row.EPR_HEURE_TRANSPORT ? row.EPR_HEURE_TRANSPORT : '';
        if ( lie_id > 1 ) {
            var lieu        = Jaf.cm.getConcept('C_Geo_Lieu' ).getRow(lie_id);
            if ( lieu.LIE_TLI_ID ==1 ) {
                var libelle = '<div class="libelle"><span class="icone">º</span> '+lieu.LIE_LIBELLE+'</div>';
                libelle += numero.length > 0 || heure.length>0 ? '<div class="vol clearAfter"><div class="numero">'+numero + '</div><div class="heure">' +heure +'</div></div>' : '';
            } else if ( lieu.LIE_TLI_ID ==2 ) {
                var libelle = '<div class="libelle"><span class="icone">»</span> '+lieu.LIE_LIBELLE+'</div>';
                libelle += numero.length > 0 || heure.length>0 ? '<div class="gare clearAfter"><div class="numero">'+numero + '</div></div>' : '';
            } else {
                var libelle = '<div class="libelle">';
                libelle += lieu.LIE_LIBELLE && lieu.LIE_LIBELLE.length > 0 ? '<span class="titre">' + lieu.LIE_LIBELLE + '</span>' : '';
                libelle += ' <span class="adresseFormated">'+lieu.LIE_FORMATED+'</span>';
                libelle += lieu.LIE_INFO && lieu.LIE_INFO.length>0 ? ' <span class="infoLieu">'+lieu.LIE_INFO+'</span>' : '' ;
                libelle += numero.length > 0 ? '<span class="numero">'+numero+'</span>' : '';
                libelle += '</div>';
            }
            return  libelle;
        } else {
            return lie_id==1 ? '<div class="icone tb">Â</div>' : ( numero.length > 0 ? '<div class="numero">'+numero + '</div>' : '&nbsp;') ;
        }
    } else {
        return Jaf.translate('DIC_PAS_DE_LIEU_ICI');
    }
}

Mobi.getTimeMission = function (mission) {
    if ( ! mission ) {
        Jaf.log('pas de mission dans getTimeMission');
        return {};
    }
	if ( mission.MIS_DATE_DEBUT && mission.MIS_HEURE_DEBUT && mission.MIS_HEURE_FIN ) {
		var pob_debut   = Jaf.getDate(mission.MIS_DATE_DEBUT+' '+mission.MIS_HEURE_DEBUT  ).getTime();
		var pob_fin     = Jaf.getDate(mission.MIS_DATE_DEBUT+' '+mission.MIS_HEURE_FIN    ).getTime() + ( mission.MIS_HEURE_FIN < mission.MIS_HEURE_DEBUT ? 24 * 3600000 : 0 );
		var temps_garage = 15;
        if ( mission.MIS_VOI_ID > 0 ) {
            var voiture = Jaf.cm.getConcept('C_Gen_Voiture').getRow(mission.MIS_VOI_ID);
            if ( voiture.VOI_GAR_ID > 0 ) {
                temps_garage = Jaf.cm.getConcept('C_Gen_Garage').getRow(voiture.VOI_GAR_ID).GAR_TEMPS_GARAGE;
            }
        }

		if ( mission.MIS_HEURE_REEL_DEBUT ) {
		    var heure       =  mission.MIS_HEURE_REEL_DEBUT > mission.MIS_HEURE_DEBUT ? mission.MIS_HEURE_DEBUT : mission.MIS_HEURE_REEL_DEBUT ;
			var heure_debut = Jaf.getDate(mission.MIS_DATE_DEBUT+' '+heure ).getTime();
		} else {
            var heure_debut = Jaf.getDate(mission.MIS_DATE_DEBUT+' '+mission.MIS_HEURE_DEBUT ).getTime() - temps_garage * 60000;
		}
		
		if ( mission.MIS_HEURE_REEL_FIN ) {
		    var heure     =  mission.MIS_HEURE_REEL_FIN < mission.MIS_HEURE_FIN ? mission.MIS_HEURE_FIN : mission.MIS_HEURE_REEL_FIN ;
			var heure_fin = Jaf.getDate(mission.MIS_DATE_DEBUT+' '+mission.MIS_HEURE_REEL_FIN ).getTime()  + ( mission.MIS_HEURE_REEL_FIN < mission.MIS_HEURE_REEL_DEBUT ? 24 * 3600000 : 0 ) ;
		} else {
			var heure_fin = Jaf.getDate(mission.MIS_DATE_DEBUT+' '+mission.MIS_HEURE_FIN ).getTime() + temps_garage * 60000;
		}
		return {
			pob_debut   : pob_debut,
			pob_fin     : pob_fin,
			heure_debut : heure_debut,
			heure_fin   : heure_fin
		};
	} else return {
        pob_debut   : 0,
        pob_fin     : 0,
        heure_debut : 0,
        heure_fin   : 0
    };
}

//-------------------------------------------------------------------------
Mobi.newMission = function (mis_id) {
	var mission = Mobi.getInfoMission(mis_id);
    
    if ( mission.MIS_TVE_ID>0) {
        var tve = Jaf.cm.getConcept('C_Gen_TypeVehicule').getRow(mission.MIS_TVE_ID);
        mission.typeVehicule = tve.TVE_LIBELLE_COURT;
    } else {
        mission.typeVehicule = '?';
    }

    var etapes                   = Mobi.fonctionsCel.getEtape(mis_id);
    mission.lieu_prise_en_charge = etapes.length > 0 ? Mobi.fonctionsCel.getLibelleLieuEtape( etapes[0] )                   : '';
    mission.lieu_depose          = etapes.length > 1 ? Mobi.fonctionsCel.getLibelleLieuEtape( etapes[ etapes.length - 1 ] ) : '';

    var divMission = $( Jaf.tm.t.wayd_mission( mission ) );
 
    divMission.find('.infoLieu').data({ mis_id : mis_id , database : Jaf.cm.database }).click(function() { 
        Mobi.ouvreMission({mis_id:$(this).data('mis_id'), database : $(this).data('database')}); 
    });

    divMission.find('.btn_note').click(function() { 
        if ( $(this).hasClass('active') ) {
            $('#note_chauffeur'+mis_id).slideUp(500);
            $(this).removeClass('active');
        } else {
            $('#note_chauffeur'+mis_id).slideDown(500);
            $(this).addClass('active');
        }
    });

    return divMission;
}

Mobi.creationDossier = function() {
    var monForm = $('#creationDossier');
    var cli_id  = monForm.find('input[name=CLI_ID]').val();
    var cot_id  = monForm.find('select[name=COM_COT_ID]').val();
    var com_id  = monForm.find('input[name=COM_ID]').val();
    if (!cli_id>0) {
        var client = {
            CLI_TCC_ID      : 1,
            CLI_SOCIETE     : monForm.find('input[name=CLI_SOCIETE]').val(),
            CLI_TEL_FIXE    : monForm.find('input[name=COT_TELEPHONE]').val(),
            CLI_FACT_NOM    : monForm.find('input[name=CLI_SOCIETE]').val(),
            CLI_FACT_PAY_ID : 65
        }
        Jaf.cm.getConcept('C_Gen_Client').insertRow( client , function (row) {
            monForm.find('input[name=CLI_ID]').val( row.CLI_ID );
            Jaf.cm.getConcept('C_Gen_Grilleclient').insertRow( {
                GRL_CLI_ID : row.CLI_ID, 
                GRL_GRI_ID : monForm.find('select[name=COM_GRI_ID]').val() 
            } , function (row) {
                Mobi.creationDossier();
            });
        });
        return false;
    } else {
        var client = Jaf.cm.getConcept('C_Gen_Client').getRow(cli_id);
    }
    
    if (!cot_id>0) {
        var contact = {
            COT_CLI_ID      : cli_id,
            COT_LAN_ID      : 1,
            COT_CIV_ID      : monForm.find('input[name=COT_CIV_ID]').val(),
            COT_NOM         : monForm.find('input[name=COT_NOM]').val(),
            COT_PRENOM      : monForm.find('input[name=COT_PRENOM]').val(),
            COT_EMAIL       : monForm.find('input[name=COT_EMAIL]').val(),
            COT_TELEPHONE   : monForm.find('input[name=COT_TELEPHONE]').val(),
            COT_MOBILE      : monForm.find('input[name=COT_MOBILE]').val(),
        }
        Jaf.cm.getConcept('C_Gen_Contact').insertRow( contact , function (row) {
            monForm.find('select[name=COM_COT_ID]').append('<option value="'+row.COT_ID+'">'+Jaf.translate('DIC_CONTACT')+'</option>' );
            monForm.find('select[name=COM_COT_ID]').val( row.COT_ID );
            Mobi.creationDossier();
        });
        return false;
    }
    
    if (!com_id>0) {
        var dossier = {
            COM_DATE_CREATION : Jaf.date2mysql( new Date() ),
            COM_CLI_ID        : cli_id,
            COM_COL_ID        : 1,
            COM_SCO_ID        : 1,
            COM_COT_ID        : cot_id,
            COM_GRI_ID        : monForm.find('select[name=COM_GRI_ID]').val()
        }

        if ( client.CLI_PAR_ID>0) {
            dossier.COM_PAR_ID=client.CLI_PAR_ID;
        }

        Jaf.cm.getConcept('C_Com_Commande').insertRow( dossier , function (row) {
            monForm.find('input[name=COM_ID]').val(row.COM_ID);
            Mobi.creationDossier();
        });
        return false;
    }

}

Mobi.animateBouton = function(couleurFond,icone,label) {
    if ( Mobi.animateBouton.old_label != label || Mobi.animateBouton.old_icone != icone ) {
        var home = $('#home').first();
        home.find('.grosBouton .icone').animate({'color':couleurFond},2000);
        home.find('.grosBouton .label').animate({'color':couleurFond},2000);
        home.find('.Btn .icone').html(icone);    
        home.find('.Btn .label').html(label);    
        home.find('.Btn').fadeIn(500);    
        Mobi.animateBouton.old_label = label;
        Mobi.animateBouton.old_icone = icone;
    }
}

Mobi.animateBouton.old_icone = '';
Mobi.animateBouton.old_label = '';

Mobi.getInfoMissionHome = function(row) {
    var dm       = Jaf.getDate( row.MIS_DATE_DEBUT );
    var zoneDate = '<span class="jour" >' + Jaf.jourMoyen[ Jaf.LAN_CODE ][ dm.getDay() ]    + '</span>'
                 + '<span class="day"  >' + dm.getDate()                   + '</span>'
                 + '<span class="mois" >' + Jaf.moisCours[ Jaf.LAN_CODE ][ dm.getMonth() ] + '</span>'
                 + '<span class="heure">' + Jaf.formatValue.Heure(row.MIS_HEURE_DEBUT)+'</span>';
    var etapes = Mobi.fonctionsCel.getEtape(row.MIS_ID);
    return {
        label         : Jaf.translate('DIC_PROCHAINE_MISSION') + ' : ',
        MIS_COM_ID    : row.MIS_COM_ID,
        MIS_NUMERO    : row.MIS_NUMERO,
        MIS_VERSION   : row.MIS_VERSION,
        zoneDate      : zoneDate,
        lieu          : etapes.length > 0 ? Mobi.fonctionsCel.getLibelleLieuEtape( etapes[0] ) : ''
    }
}

Mobi.majEcrans = function() {
    Mobi.valoriseHomepage();
}

Mobi.relanceLoad = function() {
    if ( !Mobi.relanceLoad.enCours ) {
        Mobi.relanceLoad.enCours=true;
        setTimeout(function() {
            Mobi.loadData(function() {
                Mobi.relanceLoad.enCours=false;
                Mobi.analyseMission();
                if ( !Mobi.getEvent.flag_valorise ) setTimeout(Mobi.valoriseHomepage,1000);
                Mobi.getEvent.flag_valorise = true;
            }); 
        },500);
    }
}

Mobi.getEvent = function(eve) {
    var limo = eve.limo;
    if ( eve.CPT_CLASS=='C_Gen_Mission' ) {
        var mis_id = eve.EVE_PRIMARY;
        Jaf.cm.setDatabase(limo);
        var row = Jaf.cm.getConcept('C_Gen_Mission').getRow(mis_id);
        if ( !row ) {
           Mobi.relanceLoad();
        }
        $('#MIS'+mis_id).remove();
        Mobi.analyseMission();
        if ( !Mobi.getEvent.flag_valorise ) setTimeout(Mobi.valoriseHomepage,1000);
        Mobi.getEvent.flag_valorise = true;
        return ''; 
    }
    if ( eve.CPT_CLASS=='C_Com_Reglement' || 
         eve.CPT_CLASS=='C_Gen_Presence' || 
         eve.CPT_CLASS=='C_Gen_EtapePresence' 
    ) {
        if ( !Mobi.getEvent.flag_valorise ) setTimeout(Mobi.valoriseHomepage,1000);
        Mobi.getEvent.flag_valorise = true;
        return '';
    }
    if ( eve.CPT_CLASS=='C_Geo_Lieu' ||  eve.CPT_CLASS=='C_Geo_Ville') {
        if ( !Mobi.getEvent.flag_valorise ) setTimeout(Mobi.valoriseHomepage,1000);
        Mobi.getEvent.flag_valorise = true;
        return '';
    }
}

Mobi.valoriseHomepage = function() {
    Mobi.majMission.flag_valorise = false;
    var home=$('#home').first();
    //combien de mission
    var confirmer           = 0;
    var modifier            = 0;
    var cloturer            = 0;
    var mis_id_non_terminer = 0;
    var date_prochaine      = 9000000000;
    var statut_prochaine    = ['4','11','8'];                          
    var maintenant          = Jaf.date2mysql(new Date());
    var tab                 = [];
    for(var i in Mobi.databases ) {
        var database = Mobi.databases[i];
        Jaf.cm.setDatabase(database);
        var rowset              = Jaf.cm.getConcept('C_Gen_Mission').rowset;
        for(var i in rowset) {
            var row=rowset[i];
            
            if ( row.MIS_CHU_ID==Mobi.infoLimos[ database ].LCH_REFERENCE_EXTERNE ) {
                
                if ( row.MIS_SMI_ID==16       && row.MIS_DATE_DEBUT >= maintenant )                                confirmer++;
                if ( row.MIS_FLAG_MODIFIE==1  
                  && row.MIS_DATE_DEBUT >= maintenant 
                  && Mobi.smis.indexOf(row.MIS_SMI_ID)>-1 )                                                        modifier++;
                if ( ( 1*row.MIS_SMI_ID==9  && row.MIS_HEURE_REEL_FIN && row.MIS_HEURE_REEL_FIN.length > 0 )   )   cloturer++;
                
                if ( statut_prochaine.indexOf( row.MIS_SMI_ID) >=0 )  tab.push( row.MIS_DATE_DEBUT+' '+row.MIS_HEURE_DEBUT+'|'+row.MIS_ID+'|'+database);
                //a cloturer
                if ( ( row.MIS_SMI_ID==9 ) && ( !row.MIS_HEURE_REEL_FIN || row.MIS_HEURE_REEL_FIN.length == 0 ) ) {
                    mis_id_non_terminer = row.MIS_ID;
                }
            }
        }
    }
    tab.sort();
    if ( tab.length > 0 ) {
        var res                = tab[0].split('|');
        var mis_id_prochaine   = res[1];
        var database_prochaine = res[2];
        if ( tab.length>1) {
            var res               = tab[1].split('|');
            var mis_id_suivante   = res[1];
            var database_suivante = res[2];
        } else {
            var mis_id_suivante  = 0;
        }
    } else {
        var mis_id_suivante = mis_id_prochaine = 0;
    }
    
    if ( !Mobi.initGrosBouton) {
        var zoneBouton = $('#home .Boutons').first();
        var grosBouton = zoneBouton.find('.grosBouton').first();
        Mobi.valoriseHomepage.Boutons = grosBouton;
        var width = $('#header').width()/2;
        
        zoneBouton.find('.Btn .icone').css({
            'font-size'           : Math.round(width/6)+'px'
        });
        zoneBouton.find('.intGrosBouton .label').css({
            'font-size'           : Math.round(width/8)+'px'
        });
        zoneBouton.find('.attestation .intPetitBouton').css({
            'font-size'           : Math.round(width/4)+'px'
        });
        zoneBouton.find('.noshow .intPetitBouton').css({
            'font-size'           : Math.round(width/10)+'px'
        });
        zoneBouton.find('.intMoyenBouton').css({
            'font-size'           : Math.round(width/6)+'px'
        });
        
        
        
        grosBouton.click(function() {
            var grosBouton = Mobi.valoriseHomepage.Boutons;
            grosBouton.find('.Btn').fadeOut(500);
            var smi_id  = grosBouton.data('smi_id');
            var mis_id  = grosBouton.data('mis_id');
            var db      = grosBouton.data('database');
            var cd      = grosBouton.data('champ_date');
            var num     = grosBouton.data('num_etape');
            var km      = grosBouton.data('champ_km');
            Jaf.cm.setDatabase(db);
            var mission = Jaf.cm.getConcept('C_Gen_Mission');
            var voiture = Jaf.cm.getConcept('C_Gen_Voiture');
            var etapes  = Mobi.fonctionsCel.getEtape(mis_id);
            mission.setValue(mis_id , 'MIS_SMI_ID' , smi_id);
            if ( cd.length>0) {
                var maintenant = new Date();
                if ( cd.substr(0,3)=='MIS' ) {
                    mission.setValue(mis_id , cd , sprintf('%02d:%02d:%02d',maintenant.getHours(),maintenant.getMinutes(),maintenant.getSeconds() ) );
                } else {
                    Jaf.cm.getConcept('C_Gen_EtapePresence').setValue( etapes[num].EPR_ID , cd , sprintf('%02d:%02d:%02d',maintenant.getHours(),maintenant.getMinutes(),maintenant.getSeconds() ) ).save();
                }
            }
            var nb_km=mission.getRow(mis_id)[km];
            
            if ( km.length>0 && !(nb_km > 0) ) {
                var kilometrage = prompt(Jaf.translate('DIC_KILOMETRAGE_COMPTEUR'), nb_km ? nb_km : '');
                if ( kilometrage ) {
                    mission.setValue(mis_id , km , kilometrage );
                    var voi_id = mission.getRow(mis_id)['MIS_VOI_ID'];
                    voiture.setValue(voi_id , 'VOI_KILOMETRAGE' , kilometrage );
                    voiture.save();
                }
            }
            mission.save(function() {
                Mobi.valoriseHomepage();
            });
        });
        Mobi.initGrosBouton=true;
    }
    
    if ( mis_id_prochaine > 0 ) {
        var flag_attestation  = false;
        var montant_reglement = 0;
        Jaf.cm.setDatabase(database_prochaine);
        var row               = Jaf.cm.getConcept('C_Gen_Mission').getRow(mis_id_prochaine);
        var row_en_cours      = row;
        var grosBouton        = Mobi.valoriseHomepage.Boutons;
        grosBouton.data({
            champ_date :'',
            champ_km   :'',
            database   : database_prochaine
        });
        home.find('.petitBouton').removeClass('visible');
        home.find('#noMission').removeClass('visible');

        var info   = Mobi.getInfoMissionHome(row);
        var etapes = Mobi.fonctionsCel.getEtape(row.MIS_ID);
        if (etapes.length==0) {
            $('#home').html('<h1>Le dossier n°'+row.MIS_COM_ID+' ne contient pas d\'étapes. Veuillez vous rapprocher de votre dispatcher pour corriger ce problème</h1>');
        } else {        
            for(var num_etape in etapes ) {
                var pas_arriver = etapes[num_etape].EPR_HEURE_ARRIVER == null || etapes[num_etape].EPR_HEURE_ARRIVER.length==0;
                var pas_depart  = etapes[num_etape].EPR_HEURE_DEPART  == null || etapes[num_etape].EPR_HEURE_DEPART.length ==0;
                if ( pas_arriver || pas_depart ) break;
            }
            var etape = etapes[num_etape];
            grosBouton.data('num_etape',num_etape);
            
            switch (row.MIS_SMI_ID ) {
                case '4' : 
                    Mobi.animateBouton('#800000','>',Jaf.translate('DIC_DEMARRER'));
                    grosBouton.data('smi_id',11);
                    grosBouton.data('champ_date','MIS_HEURE_REEL_DEBUT');
                    if ( Mobi.infoLimos[ database_prochaine ].INS_FLAG_KM_DEBUT_SERVICE == '1' ) {
                        grosBouton.data('champ_km'  , 'MIS_KM_DEBUT');
                    }

                break;
                case '11' : 
                    Mobi.animateBouton('#008000','?',Jaf.translate('DIC_EN_PLACE'));
                    grosBouton.data('smi_id',8);
                    grosBouton.data('num_etape' , 0);
                    if ( Mobi.infoLimos[ database_prochaine ].INS_FLAG_KM_DEBUT_SERVICE != '1' ) {
                        grosBouton.data('champ_km'  , 'MIS_KM_DEBUT');
                    }
                    grosBouton.data('champ_date', 'EPR_HEURE_ARRIVER');
                    flag_attestation = true;
                break;
                case '8' : 
                    if ( row.MIS_FLAG_NOSHOW==1 ) {
                        Mobi.animateBouton('#008000','@',Jaf.translate('DIC_TERMINER'));
                        grosBouton.data('smi_id',9);
                        grosBouton.data('champ_date','MIS_HEURE_REEL_FIN');

                        if ( mis_id_suivante>0) {
                            var row  = Jaf.cm.getConcept('C_Gen_Mission').getRow(mis_id_suivante);
                            var info = Mobi.getInfoMissionHome(row);
                        } else {
                            info.lieu = Mobi.fonctionsCel.getLibelleLieuEtape( etape );
                        }
                    } else {
                        if ( num_etape == '0' ) {
                            //premiere etape
                            info.lieu  = Mobi.fonctionsCel.getLibelleLieuEtape( etapes[ 1*num_etape + 1 ] );
                            Mobi.animateBouton('#ffa000','>',Jaf.translate('DIC_DEPART'));
                            grosBouton.data('smi_id',8);
                            grosBouton.data('champ_date','EPR_HEURE_DEPART');
                        } else if ( 1*num_etape == etapes.length-1 ) {
                            //derniere etape
                            if ( pas_arriver ) {
                                info.lieu = Mobi.fonctionsCel.getLibelleLieuEtape( etape );
                                Mobi.animateBouton('#008000','?',Jaf.translate('DIC_EN_PLACE'));
                                grosBouton.data('smi_id',8);
                                grosBouton.data('champ_date','EPR_HEURE_ARRIVER');
                                home.find('.petitBouton.droit').addClass('visible');
                            } else {
                                if ( pas_depart ) {
                                    info.lieu = Mobi.fonctionsCel.getLibelleLieuEtape( etape );
                                    Mobi.animateBouton('#ffa000','>',Jaf.translate('DIC_DEPOSE_CLIENT'));
                                    grosBouton.data('smi_id',8);
                                    grosBouton.data('champ_date','EPR_HEURE_DEPART');
                                    if ( Mobi.infoLimos[ database_prochaine ].INS_FLAG_KM_DEBUT_SERVICE != '1' ) {
                                        grosBouton.data('champ_km'  ,'MIS_KM_FIN');
                                    }
                                } else {
                                    Mobi.animateBouton('#008000','@',Jaf.translate('DIC_TERMINER'));
                                    grosBouton.data('smi_id',9);
                                    grosBouton.data('champ_date','MIS_HEURE_REEL_FIN');
                                    if ( Mobi.infoLimos[ database_prochaine ].INS_FLAG_KM_DEBUT_SERVICE == '1' ) {
                                        grosBouton.data('champ_km'  ,'MIS_KM_FIN');
                                    }

                                    if ( mis_id_suivante>0) {
                                        var row  = Jaf.cm.getConcept('C_Gen_Mission').getRow(mis_id_suivante);
                                        var info = Mobi.getInfoMissionHome(row);
                                    } else {
                                        info.lieu = Mobi.fonctionsCel.getLibelleLieuEtape( etape );
                                    }
                                }
                            }
                        } else {
                            if ( pas_arriver ) {
                                info.lieu = Mobi.fonctionsCel.getLibelleLieuEtape( etape );
                                Mobi.animateBouton('#008000','?',Jaf.translate('DIC_EN_PLACE'));
                                grosBouton.data('smi_id',8);
                                grosBouton.data('champ_date','EPR_HEURE_ARRIVER');
                                home.find('.petitBouton.droit').addClass('visible');
                            } else {
                                info.lieu = Mobi.fonctionsCel.getLibelleLieuEtape( etapes[1*num_etape+1] );
                                Mobi.animateBouton('#ffa000','>',Jaf.translate('DIC_DEPART'));
                                grosBouton.data('smi_id',8);
                                grosBouton.data('champ_date','EPR_HEURE_DEPART');
                            }
                        }
                        
                        home.find('.noshow.petitBouton').addClass('visible');
                        home.find('.noshow.petitBouton .intPetitBouton').html(Jaf.translate('DIC_NO_SHOW'));
                        home.find('.noshow.petitBouton').data('database',database_prochaine).unbind('click').click(function(e) {
                            e.stopPropagation();
                            var message = prompt(Jaf.translate('DIC_NO_SHOW_RAISON'),Jaf.translate('DIC_NO_SHOW_PAS_CLIENT'));
                            if ( message.length>0 ) {
                                var info = row.MIS_COMMENTAIRE_CHAUFFEUR+"\n"+Jaf.translate('DIC_NO_SHOW_RAISON')+' : '+message;
                                Jaf.cm.setDatabase( $(this).data('database') );
                                Jaf.cm.getConcept('C_Gen_Mission'
                                ).setValue(row.MIS_ID,'MIS_SMI_ID',8
                                ).setValue(row.MIS_ID,'MIS_FLAG_NOSHOW',1
                                ).setValue(row.MIS_ID,'MIS_COMMENTAIRE_CHAUFFEUR',info).save();
                            }
                        });

                        flag_attestation = true;
                    }
                break;
            }
            //bouton de présence passager
            var presences = Mobi.fonctionsCel.getPresences(row.MIS_ID);
            var zonePresence = home.find('.zonePassager');
            if ( row.MIS_FLAG_NOSHOW == "0" && presences.length > 0 ) {
                var res = '';
                for(var i in presences) {
                    if ( presences[i].PRS_TPP_ID!=3 ) {
                        var passager = Jaf.cm.getConcept('C_Gen_Passager').getRow( presences[i].PRS_PAS_ID );
                        var civilite = Jaf.cm.getConcept('C_Gen_Civilite').getRow( passager.PAS_CIV_ID );
                        passager.nom = Jaf.translate(civilite.CIV_LIBELLE_COURT)+' '+passager.PAS_PRENOM+' '+passager.PAS_NOM + ( passager.PAS_FLAG_TPMR==1 ? '<span class="tpmr icone">Õ</span>' : '');
                        var params = {};
                        $.extend(params , presences[i], passager );
                        params.boutons = [];
                        switch ( presences[i].PRS_TPP_ID ) {
                            case '1' : 
                                if ( row.MIS_SMI_ID=='8' ) {
                                    if (    
                                            presences[i].PRS_PC_EPR_ID == 0 ||
                                            presences[i].PRS_PC_EPR_ID == etape.EPR_ID
                                        )
                                     {
                                        if ( pas_arriver ) {
                                            params.info   = '<span class="monter">'+Jaf.translate('DIC_PASSAGER_PROCHAINE')+'</span>';
                                        } else {
                                            params.boutons.push( {label : Jaf.translate('DIC_PASSAGER_PRESENT') , PRS_ID : presences[i].PRS_ID , role : 'POB'    , classe : 'present'} );
                                            params.boutons.push( {label : Jaf.translate('DIC_NO_SHOW'         ) , PRS_ID : presences[i].PRS_ID , role : 'NOSHOW' , classe : 'noshow' } );
                                        }
                                    }
                                } else {
                                    
                                    if (    etape && (
                                            presences[i].PRS_PC_EPR_ID == 0 ||
                                            presences[i].PRS_PC_EPR_ID == etape.EPR_ID)
                                        ){   
                                        params.info   = '<span class="monter">'+Jaf.translate('DIC_PASSAGER_PROCHAINE')+'</span>';
                                    }
                                }
                            break;
                            case '2' : params.classe = 'present';
                                    if (  presences[i].PRS_DE_EPR_ID == etape.EPR_ID ){   
                                       params.info   = '<span class="descendre">'+( pas_arriver ? Jaf.translate('DIC_PASSAGER_DOIT_DESCEN1') : Jaf.translate('DIC_PASSAGER_DOIT_DESCEN2'))+'</span>';
                                    }
                            break;
                            case '4' : params.classe = 'noshow';
                            break;
                        }
                        res += Jaf.tm.t.wayd_mission_bouton_passager( params );
                    }
                }
                zonePresence.html(res);
            }
            
            zonePresence.find('.btn').data('database',database_prochaine).click(function() {
                var prs_id = $(this).data('prs_id');
                var role   = $(this).data('role');
                Jaf.cm.setDatabase( $(this).data('database') );
                Jaf.cm.getConcept('C_Gen_Presence').setValue( prs_id , 'PRS_TPP_ID' ,  role == 'NOSHOW' ? 4 : 2 ).save();
                Mobi.valoriseHomepage();
            });
           
            if ( flag_attestation ) {
                home.find('.petitBouton.attestation').addClass('visible');
                home.find('.petitBouton.attestation .intPetitBouton').html('A');
                home.find('.petitBouton.attestation').data('database',database_prochaine).unbind('click').click(function(e) {
                    Jaf.cm.setDatabase( $(this).data('database') );
                    e.stopPropagation();
                    Mobi.ouvreRecepisse(row_en_cours.MIS_ID);
                });
            }
            
            var rels  = Jaf.cm.getConcept('C_Com_Reglement').rowset;
            for(var i in rels) {
                if ( rels[i].REL_MIS_ID==row_en_cours.MIS_ID && !rels[i].REL_MONTANT_REGLER>0) {
                    home.find('.moyenBouton.reglement').addClass('visible');
                    home.find('.moyenBouton.reglement .intMoyenBouton').html(Jaf.formatValue.Montant(rels[i].REL_MONTANT_ECHEANCE));
                    home.find('.moyenBouton.reglement').data({
                            rel_id   : rels[i].REL_ID,
                            database : database_prochaine
                    }).unbind('click').click(function(e) {
                        Jaf.cm.setDatabase( $(this).data('database') );
                        e.stopPropagation();
                        Mobi.ouvreReglement($(this).data('rel_id'));
                    });
                    break;
                }
            }
            setTimeout( function() {
                for(var i in info) {
                    home.find('[data-role='+i+']').html(info[i]);
                }
                home.find('.zoneBouton').addClass('visible');   
            },1200);
            
            home.find('.grosBouton,.cel.infoLieu').data('mis_id',mis_id_prochaine);
            home.find('.cel.infoLieu').data('database',database_prochaine).click(function() {
                Mobi.ouvreMission({mis_id:$(this).data('mis_id'), database : $(this).data('database')});
            });
        }        

    } else {
        home.find('.zoneBouton').removeClass('visible');
        home.find('#noMission').addClass('visible');
    }
    
    home.find('.chiffre[data-role=confirmer]').html(confirmer);
    home.find('.chiffre[data-role=modifier]' ).html(modifier);
    home.find('.chiffre[data-role=cloturer]' ).html(cloturer);
}

Mobi.ouvreHomepage = function (eve) {
    window.scrollTo(0,0);
    Mobi.changePage('home');
    Mobi.valoriseHomepage();
}

Mobi.getInfoMission = function(mis_id) {
    var mission  = Jaf.cm.getConcept('C_Gen_Mission').getRow(mis_id);
    var dossier  = Jaf.cm.getConcept('C_Com_Commande').getRow(mission.MIS_COM_ID);
    var grille   = Jaf.cm.getConcept('C_Com_Grille').getRow(dossier.COM_GRI_ID);
    var eco      = Jaf.cm.getConcept('C_Gen_EntiteCommerciale').getRow(grille.GRI_ECO_ID);
    var client   = Jaf.cm.getConcept('C_Gen_Client').getRow(dossier.COM_CLI_ID);
    var contact  = Jaf.cm.getConcept('C_Gen_Contact').getRow(dossier.COM_COT_ID);
    var voiture  = Jaf.cm.getConcept('C_Gen_Voiture').getRow(mission.MIS_VOI_ID);
    var typeVehi = Jaf.cm.getConcept('C_Gen_TypeVehicule').getRow(voiture.VOI_TVE_ID);
    var typeServ = Jaf.cm.getConcept('C_Com_TypeService').getRow(mission.MIS_TSE_ID);
    var etapes   = Mobi.fonctionsCel.getEtape(mis_id);
    
    mission.ITINERAIRE = [];
    for(var i=0;i<etapes.length;i++) {
        if ( i==0 ) {
            var heure = etapes[i].EPR_HEURE_DEBUT ? etapes[i].EPR_HEURE_DEBUT.substr(0,5) : mission.MIS_HEURE_DEBUT.substr(0,5);
        } else if ( i==etapes.length-1)  {
            var heure = etapes[i].EPR_HEURE_DEBUT ? etapes[i].EPR_HEURE_DEBUT.substr(0,5) : mission.MIS_HEURE_FIN.substr(0,5);
        } else {
            var heure = etapes[i].EPR_HEURE_DEBUT ? etapes[i].EPR_HEURE_DEBUT.substr(0,5) : '';
        }
        mission.ITINERAIRE.push( {
            heure : heure,
            first : i==0 ? 'first':'',
            lieu  : Mobi.fonctionsCel.getLibelleLieuEtape( etapes[ i ] ) 
        });
    }
    
    mission.ECO_IMAT_REGISTRE    = eco.ECO_IMAT_REGISTRE;
    mission.client               = client.CLI_SOCIETE;
    mission.contact_nom          = contact.COT_PRENOM+' '+contact.COT_NOM;
    mission.contact_tel          = contact.COT_TELEPHONE ? Jaf.formatValue.Telephone(contact.COT_TELEPHONE) : '';
    mission.contact_mob          = contact.COT_MOBILE ? Jaf.formatValue.Telephone(contact.COT_MOBILE) : '';
    mission.TVE_LIBELLE          = typeVehi.TVE_LIBELLE;
    mission.TSE_LIBELLE          = Jaf.translate(typeServ.TSE_LIBELLE);
    mission.VOI_LIBELLE          = voiture.VOI_LIBELLE;
    mission.NOTE_CHAUFFEUR       = mission.MIS_NOTE_CHAUFFEUR ? mission.MIS_NOTE_CHAUFFEUR.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,'<br>') : '';
    mission.PROGRAMME            = mission.MIS_PROGRAMME      ? mission.MIS_PROGRAMME.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,'<br>')      : '';
    var date_dossier             = Jaf.getDate(           dossier.COM_DATE_CREATION );
    mission.date_dossier         = Jaf.formatValue.Date(  date_dossier );
    mission.heure_dossier        = Jaf.formatValue.Heure( date_dossier );
    var presences                = Jaf.cm.getConcept('C_Gen_Presence').rowset;
    var infoPassagers            = '';

    if (mission.MIS_DATE_DEBUT && mission.MIS_DATE_DEBUT.length>0 && mission.MIS_DATE_DEBUT!='0000-00-00') { 
        var d = Jaf.getDate(mission.MIS_DATE_DEBUT);
        if ( decalage && decalage != 0 && mission.MIS_HEURE_DEBUT && mission.MIS_HEURE_DEBUT.length > 0 ) {
            var df = new Date( Jaf.getDate(mission.MIS_DATE_DEBUT+' '+mission.MIS_HEURE_DEBUT).getTime()  - decalage * 3600000 );
            mission.date_debut_texte  = Jaf.formatValue.Date_Texte(df);
            mission.date_debut  = '<div class="etranger">'
                               + '<span class="jour">'   + Jaf.jourMoyen[ Jaf.LAN_CODE ][ df.getDay() ]+'</span>'
                               + '<span class="numero">' + df.getDate() + '</span>' 
                               + '<span class="mois">'   + Jaf.moisCours[ Jaf.LAN_CODE ][ df.getMonth() ] + '</span>'
                               + '<span class="heure_locale">'+d.getDate() 
                               + ' ' + Jaf.moisCours[ Jaf.LAN_CODE ][ d.getMonth() ]+'</span></div>';
            mission.heure_debut = '<span class="heure_france">' + Jaf.formatValue.Heure( df ) + '</span><span class="heure_locale">' + Jaf.formatValue.Heure(mission.MIS_HEURE_DEBUT)+'</span>';
            
        } else {		 	
            if ( d ) {
                mission.date_debut_texte  = Jaf.formatValue.Date_Texte(d);
                mission.date_debut =  '<div class="france' + ( d.getDay()%6==0? ' weekend' : '' ) + '">'
                      + '<span class="jour">'      + Jaf.jourMoyen[ Jaf.LAN_CODE ][ d.getDay() ]+'</span>'
                      + '<span class="numero">'    + d.getDate() + '</span>' 
                      + '<span class="mois">'    + Jaf.moisCours[ Jaf.LAN_CODE ][ d.getMonth() ] + '</span>'
                      + '</div>';
            }
            mission.heure_debut = '<div class="heure_france">' + Jaf.formatValue.Heure(mission.MIS_HEURE_DEBUT)+'</div>';
            
        }
    } else {
        mission.date_debut = '<div class="inconnu">Date</div>';
    }
    
    if ( mission.MIS_HEURE_FIN ) {
        var decalage = 0;
        if ( decalage && decalage != 0 ) {
            var df = new Date( Jaf.getDate(mission.MIS_DATE_DEBUT+' '+mission.MIS_HEURE_FIN).getTime()  - decalage * 3600000 );
            mission.heure_fin = '<div class="heure_france">' + Jaf.formatValue.Heure( df ) + '</div><div class="heure_locale">' + Jaf.formatValue.Heure(mission.MIS_HEURE_FIN)+'</div>';
        }			
        mission.heure_fin = '<div class="heure_france">' + Jaf.formatValue.Heure(mission.MIS_HEURE_FIN)+'</div>';
    } else {
        mission.heure_fin =  '<div class="inconnu">'+Jaf.translate('DIC_HEURE_FIN')+'</div>'
    }
    
    if ( mission.MIS_TEL_PASSAGER && mission.MIS_TEL_PASSAGER.length > 0) {
        infoPassagers += '<div class="passager">'
                      +    '<div class="nom">' + Jaf.translate('DIC_CONTACT') + '</div>'
                      +    '<a class="telephone" href="tel:' + mission.MIS_TEL_PASSAGER + '">' + mission.MIS_TEL_PASSAGER + '</a>'
                      + '</div>';
    }
    
    for(var i in presences) {
        if (presences[i].PRS_MIS_ID == mis_id && presences[i].PRS_TPP_ID !=3 ) {
            var passager = Jaf.cm.getConcept('C_Gen_Passager').getRow(presences[i].PRS_PAS_ID);
            infoPassagers += '<div class="passager">'
                          +    '<div class="nom">' + passager.PAS_PRENOM+' '+passager.PAS_NOM + ( passager.PAS_FLAG_TPMR==1 ? '<span class="tpmr icone">Õ</span>' : '' ) + '</div>'
                          +    '<a class="telephone" href="tel:' + passager.PAS_TELEPHONE + '">' + passager.PAS_TELEPHONE + '</a>'
                          +    '<div class="note_chauffeur">' + passager.PAS_INFO_CHAUFFEUR + '</div>' 
                          + '</div>';
        }
    }
    mission.infoPassager = infoPassagers; 
    
    if ( mission.MIS_CMI && mission.MIS_CMI.length>0 ) {
        var valeurs              = JSON.parse( mission.MIS_CMI);
        var cmis                 = Jaf.cm.getConcept('C_Gds_ChampMission').rowset;
        var champMissionPassager = [];
        for(var i in valeurs) {
            champMissionPassager.push({
                'label'  : cmis[ 'c'+i].CMI_LABEL,
                'valeur' : valeurs[i]
            });
        }
        Jaf.log(champMissionPassager); 
        mission.champMissionPassager = champMissionPassager;
    }
    if (mission.MIS_FLAG_MODIFIE*1==1 )  mission.etat_mission = 'modifier';
    if (mission.MIS_SMI_ID*1==16 )  mission.etat_mission = 'aconfirmer';
    if (mission.MIS_SMI_ID*1==9 )   mission.etat_mission = 'afermer';
    if (mission.MIS_SMI_ID*1==19 )  mission.etat_mission = 'fermees';

    return mission;
}

Mobi.ouvreCompte = function () {
    window.scrollTo(0,0);
    Mobi.changePage('compte');
    $('#compte .btn_onglet[data-role=obligatoire]').click();
    var chauffeur = Jaf.getStorage('chauffeur');
    $('#compte input,#compte select').each(function() {
        if ( chauffeur[ $(this).attr('name') ] ) {
            $(this).val( chauffeur[ $(this).attr('name') ] );
        }
    });
}

Mobi.ouvreMission = function (eve) {
    window.scrollTo(0,0);
    Mobi.changePage('P_Gen_Mission','fAction');
    var mis_id     = !eve.mis_id ? $(this).data('mis_id') : eve.mis_id;
    Jaf.cm.setDatabase( eve.database );
    Jaf.log('ouvre mission sur '+eve.database);
    Mobi.mis_id    = mis_id;
   	var mission    = Mobi.getInfoMission(mis_id); 
    var commande  =  Jaf.cm.getConcept('C_Com_Commande').getRow(mission.MIS_COM_ID);  
    var client  =  Jaf.cm.getConcept('C_Gen_Client').getRow(commande.COM_CLI_ID);  
    var chauffeur  =  Jaf.cm.getConcept('C_Gen_Chauffeur').getRow(Mobi.infoLimos[ eve.database ].LCH_REFERENCE_EXTERNE);  
    mission.flagBtnHeure =  chauffeur.CHU_FLAG_BTN_HEURE_KM == '1' ? true : false;
    var divMission = $( Jaf.tm.render('wayd_mission_form', mission ) );

    divMission.find('.btn.cloturer').data({
        'mis_id':mis_id,
        'database':eve.database
    }).click(function () {
        Jaf.cm.setDatabase($(this).data('database'));
        var concept = Jaf.cm.getConcept('C_Gen_Mission'); 
        var mission = concept.getRow($(this).data('mis_id'));  
        $(this).html('<span class="icone">Ü</span>'+Jaf.translate('DIC_MISSION_EN_COURS'));
        concept.setValue(mis_id,'MIS_SMI_ID',19);
        concept.save(function() {
            divMission.find('.btn.cloturer').addClass('saveOk');
            divMission.find('.btn.cloturer').html('<span class="icone">ô</span>'+Jaf.translate('DIC_MISSION_FERMER'));
        });
        $('#listeContent .mission[data-mis_id='+mis_id+']').remove();
        //Mobi.changePage('P_Gen_Mission','lAction');
        Mobi.analyseMission();
    });
    
    if ( 1*mission.MIS_SMI_ID==16 ) {
        divMission.addClass('confirmation');
        divMission.find('.btn.confirmer').click(function() {
            var concept = Jaf.cm.getConcept('C_Gen_Mission'); 
            $(this).html('<span class="icone">Ü</span>'+Jaf.translate('DIC_MISSION_EN_COURS'));
            concept.setValue(mis_id,'MIS_SMI_ID',4);
            concept.save(function() {
                divMission.find('.btn.confirmer').addClass('saveOk');
                divMission.find('.btn.confirmer').html('<span class="icone">ô</span>'+Jaf.translate('DIC_MISSION_CONFIRMER'));
            });
            $('#listeContent .mission[data-mis_id='+mis_id+']').remove();
        });
        
    } else {
        divMission.removeClass('confirmation');
    }
    
    divMission.find('.frais').data('mis_id',mis_id).click(function () {
        Mobi.ouvreFrais($(this).data('mis_id'));
    });
    
    divMission.find('.heures').data({
        'mis_id':mis_id,
        'database':eve.database
    }).click(function () {
        Jaf.cm.setDatabase($(this).data('database'));
        Mobi.ouvreHeure($(this).data('mis_id'));
    });    
    if ( mission.MIS_SMI_ID==11 ||mission.MIS_SMI_ID==8 ||mission.MIS_SMI_ID==9 || mission.MIS_SMI_ID==20   ) {
        divMission.addClass('cloture');
    } else {
        divMission.removeClass('cloture');
    }
    if ( mission.MIS_FLAG_MODIFIE==1 ) {
        Jaf.cm.getConcept('C_Gen_Mission').setValue(mis_id,'MIS_FLAG_MODIFIE',0).save();
    }
    if ( mission.MIS_PANNEAU && mission.MIS_PANNEAU.length>0 ) {
        divMission.find('.ouvrePanneau').click(function () {
            var logoPanneau = '';
            if (client.CLI_LOGO_PANNEAU && client.CLI_LOGO_PANNEAU.length>0 && client.CLI_LOGO_PANNEAU.substring(1)) {
                logoPanneau = '<img src="tools/upload-fichier/read?file='+client.CLI_LOGO_PANNEAU.substring(1)+'&dossier=data/fichierUpload" alt="" />';
            }
            var panneau = $('<div id="zonePanneau">'+logoPanneau+'<p>'+mission.MIS_PANNEAU+'</p></div>');
            panneau.click(function() { $(this).remove(); delete(Mobi.setTaillePanneau.borne) });
            $('body').append(panneau);
            Mobi.setTaillePanneau();
        });
    } else {
         $('#sectionPanneau').hide();
    }
    
    $('#fiche').html( divMission );
}

Mobi.setTaillePanneau = function () { 
    var panneau = $('#zonePanneau p'); 
    if (panneau.length>0) {
        var hauteur = $(window).height();
        $('#zonePanneau').css('height',hauteur+'px');
        window.scrollTo(0,0);
        if ( !Mobi.setTaillePanneau.borne) {
            Mobi.setTaillePanneau.borne = { max : 350 , hauteur : hauteur, largeur : $(window).width() };
        }
        panneau.css('font-size', Mobi.setTaillePanneau.borne.max+'px'); 
        setTimeout(function () {
            var h1   = panneau.height();
            var l1   = panneau.width();
            if ( Mobi.setTaillePanneau.borne && ( h1 > Mobi.setTaillePanneau.borne.hauteur  || l1>Mobi.setTaillePanneau.borne.largeur) ) {
                Mobi.setTaillePanneau.borne.max -= Math.max(1,5*h1/Mobi.setTaillePanneau.borne.hauteur-1,5*l1/Mobi.setTaillePanneau.borne.largeur-1);
                Mobi.setTaillePanneau();
            }
        },100);
    }
};

Mobi.ouvreRecepisse = function (mis_id) {
    window.scrollTo(0,0);
    Mobi.changePage('P_Gen_Mission','fAction');
    var mission    = Mobi.getInfoMission(mis_id);  
    var divMission = $( Jaf.tm.render('wayd_mission_recepisse', mission ) );
    $('#fiche').html( divMission );
}

Mobi.ouvreReglement = function (rel_id) {
    window.scrollTo(0,0);
    Mobi.changePage('P_Com_Reglement','fAction');
    var reglement     = Jaf.cm.getConcept('C_Com_Reglement').getRow(rel_id);  
    reglement.mres    = Jaf.cm.getListeTML('C_Com_ModeReglement').liste;
    reglement.montant = reglement.REL_MONTANT_REGLER>0 ?  reglement.REL_MONTANT_REGLER : reglement.REL_MONTANT_ECHEANCE;
    var divReglement = $( Jaf.tm.render('wayd_mission_reglement', reglement ) );
    $('#reglement').html( divReglement );
    divReglement.find('.btn.confirmer').click(function() {
        if ( $('#REL_MONTANT_REGLER').val().length>0) {
            var concept = Jaf.cm.getConcept('C_Com_Reglement'); 
            $(this).html('<span class="icone">Ü</span>'+Jaf.translate('DIC_MISSION_EN_COURS'));
            divReglement.find('input,select,textarea').each(function () {
                concept.setValue(rel_id, $(this).attr('name') , $(this).val() );
            });
            concept.setValue(rel_id, 'REL_DATE_REGLEMENT' , Jaf.date2mysql( new Date() ) );
            concept.setValue(rel_id, 'REL_CHU_ID' , Mobi.chu_id);
            concept.setValue(rel_id, 'REL_FLAG_RECEPTION_CHAUFFEUR' , 1);
            
            concept.save(function() {
                divReglement.find('.btn.confirmer').addClass('saveOk');
                divReglement.find('.btn.confirmer').html('<span class="icone">ô</span>'+Jaf.translate('DIC_MISSION_SAUVER'));
            });
        } else {
            jaf_dialog('Vous devez saisir le montant encaissé');
        }
    });
}

Mobi.ouvreFrais = function (mis_id) {
    window.scrollTo(0,0);
    Mobi.changePage('P_Gen_Mission','frais');
    var mission    =  Jaf.cm.getConcept('C_Gen_Mission').getRow(mis_id);  
    var divMission = $( Jaf.tm.render('wayd_mission_frais', mission ) );
    divMission.find('select[name=MIS_REPAS_QTE]').val(mission.MIS_REPAS_QTE);
    $('#frais').html( divMission );
    divMission.find('.btn.confirmer').click(function() {
        var concept = Jaf.cm.getConcept('C_Gen_Mission'); 
        $(this).html('<span class="icone">Ü</span>'+Jaf.translate('DIC_MISSION_EN_COURS'));
        divMission.find('input,select,textarea').each(function () {
           
            concept.setValue(mis_id, $(this).attr('name') , $(this).val() );

        });
        
        concept.save(function() {
            divMission.find('.btn.confirmer').addClass('saveOk');
            divMission.find('.btn.confirmer').html('<span class="icone">ô</span>'+Jaf.translate('DIC_MISSION_SAUVER'));
        });
    });
}

Mobi.ouvreHeure = function (mis_id) {
    window.scrollTo(0,0);
    Mobi.changePage('P_Gen_Mission','kmEtHeure');
    var mission    =  Jaf.cm.getConcept('C_Gen_Mission').getRow(mis_id);  
    mission.etapes = Mobi.fonctionsCel.getEtape(mis_id);
    for(var i in mission.etapes) {
        mission.etapes[i].libelle = Mobi.fonctionsCel.getLibelleLieuEtape(mission.etapes[i]);
    }
                    
    var divMission = $( Jaf.tm.render('wayd_mission_heure', mission ) );
    Jaf.log(divMission);
    $('#kmEtHeure').html( divMission );
    divMission.find('.btn.confirmer').click(function() {
        var concept = Jaf.cm.getConcept('C_Gen_Mission'); 
        var voiture = Jaf.cm.getConcept('C_Gen_Voiture'); 
        $(this).html('<span class="icone">Ü</span>'+Jaf.translate('DIC_MISSION_EN_COURS'));
        divMission.find('input,select,textarea').each(function () {
            var nomChamp = $(this).attr('name');
            console.log(nomChamp);
            if ( nomChamp.substr(0,3)=='EPR') {
                Jaf.cm.getConcept('C_Gen_EtapePresence').setValue( $(this).data('epr_id') , $(this).data('role') , $(this).val() );
            } else if (nomChamp.substr(0,6)=='MIS_KM') {
                var voi_id = concept.getRow(mis_id)['MIS_VOI_ID'];
                voiture.setValue(voi_id , 'VOI_KILOMETRAGE' , $(this).val() );
                voiture.save();
                concept.setValue(mis_id, nomChamp , $(this).val() );
            } else {
                concept.setValue(mis_id, nomChamp , $(this).val() );
            }
        });
        Jaf.cm.getConcept('C_Gen_EtapePresence').save();
        concept.save(function() {
            divMission.find('.btn.confirmer').addClass('saveOk');
            divMission.find('.btn.confirmer').html('<span class="icone">ô</span>'+Jaf.translate('DIC_MISSION_SAUVER'));
        });
    });
}

Mobi.AgendaGoto = function(date) {
    $('#zoneHaut .nombre').removeClass('selected');
    Jaf.log(date);
    var d = Jaf.getDate( date+' 04:00:00');
    Jaf.log(d);
    var debut_semaine  = d.getTime() - ( ( d.getDay()+6)%7)*24*3600000 
    
    var tdJour = $('#zoneHaut td.nombre[data-date='+date+']');
    Mobi.jourSelected = date;
    if ( tdJour.length==0) {
        Mobi.valoriseAgendaZoneHaut(debut_semaine);
        tdJour = $('#zoneHaut td.nombre[data-date='+date+']');
    }
    tdJour.addClass('selected');
    $('#agenda_date_texte').html(Jaf.formatValue.Date_Texte(d));
    var nb_jour_decalage = Math.floor( ( d.getTime() - Mobi.debut_semaine ) / (24*3600000) ) + 7;
    Jaf.log('nb_jour_decalage='+nb_jour_decalage);
    $('#zoneAgenda').animate({
        'margin-left': (Mobi.taille_ecran*(0-nb_jour_decalage))+'px' 
    },500);
}

Mobi.valoriseAgendaZoneHaut = function(time_semaine) {
    var JOUR = [];
    for(var i=0;i<7;i++) {
        var jour = new Date(time_semaine+i*24*3600000);
        Jaf.log(jour);
        JOUR.push({
            label    : Jaf.jourCours[Jaf.LAN_CODE][jour.getDay()],
            nombre   : jour.getDate(),
            date     : Jaf.date2mysql(jour),
            selected : Jaf.date2mysql(jour) == Mobi.jourSelected ? ' selected' :''
        });
    }
    
    $('#agenda #zoneHaut').html( Jaf.tm.render('wayd_agenda_zoneHaut', {
        JOUR        : JOUR,
        date_longue : Jaf.formatValue.Date_Texte( new Date(Mobi.jourSelected) )
    }));
    $('#zoneHaut .nombre').unbind('click').click(function() {
        Mobi.AgendaGoto( $(this).data('date') );
    });
    //$('#zoneAgenda #zoneHaut td').width( Math.round(Mobi.taille_ecran/7)-5);

}

Mobi.ouvreAgenda = function () {
    var zoneAgenda = $('#zoneAgenda');
    zoneAgenda.find('.jour').remove();
    window.scrollTo(0,0);
    Mobi.changePage('P_Gen_Mission','agendaAction');
    Mobi.taille_ecran = $('#header').width();

    var aujourdhui    = Jaf.getDate( Jaf.date2mysql(new Date()) + ' 04:00:00');
    Jaf.log(aujourdhui);
    var debut_semaine  = aujourdhui.getTime() - (( aujourdhui.getDay()+6)%7)*24*3600000;
    Mobi.debut_semaine = 1*debut_semaine;
    //construction des jours
    Mobi.jourSelected   = Jaf.date2mysql(aujourdhui);
    Mobi.valoriseAgendaZoneHaut(debut_semaine);

    var tv     = {};
    for( var i=-7; i < 14 ; i++ ) {
        tv[ ''+Jaf.date2mysql( new Date( debut_semaine + i*24*3600000 ) ) ]=[];
    }
    for(var i in Mobi.databases) {
        var limo = Mobi.databases[i];
        Jaf.cm.setDatabase( limo );
        var rowset = Jaf.cm.getConcept('C_Gen_Mission').rowset;

        for(var  i in rowset ) {
            var row  = rowset[i];
            row.limo = limo;
            if ( Mobi.isMissionAffichable(row) ) {
                tv[ ''+row.MIS_DATE_DEBUT ].push({MIS_ID : row.MIS_ID, database : limo });
            }
        }
    }
    var res = '';
    var HEURE = [];
    
    for(var i=1;i<24;i++) HEURE.push({label:sprintf("%02d",i)+':00'});
    
    //on ajoute le curseur
    tv[ Mobi.jourSelected].push({});
    
    for(var i in tv) {
        res+= Jaf.tm.render('wayd_agenda_jour', { 
            date     : i,
            HEURE    : HEURE,
            MISSIONS : tv[i] 
        });
    }
    zoneAgenda.append( res );
    var zoneJour     = zoneAgenda.find('.jour .fond_heure').first();
    var hauteur_jour = zoneJour.height();
    var coef_jour    = hauteur_jour / ( 24 * 3600000 );
    zoneAgenda.find('.missionAgenda').each(function() {
        var mis_id     = $(this).data('mis_id');
        var mission    = Mobi.getInfoMission(mis_id);
        var db         = $(this).data('database');
        Jaf.cm.setDatabase(db);
        var row        = Jaf.cm.getConcept('C_Gen_Mission').getRow(mis_id);
        var times      = Mobi.getTimeMission(row); 
        var time_debut = ( Jaf.getDate( row.MIS_DATE_DEBUT+' 00:00:00' ) ).getTime();
        var top        = ( times.pob_debut - time_debut)        * coef_jour;
        var height     = ( times.pob_fin   - times.pob_debut  ) * coef_jour - 1;
        $(this).css({
            "top"    : top,
            "height" : height
        }).addClass(mission.etat_mission);
        // pob_debut , pob_fin , heure_debut , heure_fin 
        $(this).append( Mobi.newMission( mis_id ) );
    });
    var time_debut = ( Jaf.getDate( Jaf.date2mysql(aujourdhui)+' 00:00:00' ) ).getTime();
    var top        = ((new Date()).getTime() - time_debut) * coef_jour;
    zoneAgenda.find('.curseur').css('top', top);

    $('.largeurEcran').width(Mobi.taille_ecran);
    
    setTimeout(function () {
        Mobi.taille_ecran = $('#header').width();
        zoneAgenda.width(22*Mobi.taille_ecran);
        //zoneAgenda.find('#zoneHaut td').width( Math.round(Mobi.taille_ecran/7)-5);
        $('.largeurEcran').width(Mobi.taille_ecran);
        Mobi.AgendaGoto( Jaf.date2mysql( aujourdhui ) );
        $('body').scrollTop( top-150 );    
    },800);
    
}

Mobi.ouvreGeoloc = function () {
    var zoneGeoloc = $('#geolocalisation');
    window.scrollTo(0,0);
    Mobi.changePage('geolocalisation');
    var limos=[];
    for(var i in Mobi.infoLimos) {
        limos.push( {
            limo : i,
            INS_ID : Mobi.infoLimos[i].LCH_INS_ID,
            value  : Mobi.infoLimos[i].LCH_FLAG_ACTIF,
        });
    }
    
    zoneGeoloc.html( Jaf.tm.render('wayd_geoloc', { 
        LIMOS : limos ,
        GEOLOC : Mobi.geoloc_actif ? "1" : "0"
    }));
    
    zoneGeoloc.find('.flipswitch').each(function() {
        var flip  = $(this);
        var nc    = flip.data('champ');
        var champ = $('#'+nc);
        var value = champ.val();
        flip.find('.flag[data-value='+value+']').width('95%');
        flip.find('.flag').click(function() {
            var value= $(this).data('prochaine');
            champ.val( value );
            flip.find('.flag[data-value!='+value+']').animate({width:'0%'},500);
            flip.find('.flag[data-value='+value+']').animate({width:'95%'},500);
        });
    });
    
    zoneGeoloc.find('.btn.confirmer').click(function() {
        $(this).html('<span class="icone">Ü</span>'+Jaf.translate('DIC_MISSION_EN_COURS'));
        var geoloc_actif = $('#GEOLOC').val()==0;
        if ( Mobi.watchPosition && !geoloc_actif ) {
            navigator.geolocation.clearWatch( Mobi.watchPosition );
            delete(Mobi.watchPosition);
            Jaf.log('arret de la geoloc');
        }
        Mobi.geoloc_actif = geoloc_actif;
        localStorage.setItem(Mobi.name + '.geoloc_actif',$('#GEOLOC').val());
        Mobi.checkGeoloc();
        var params = {};
        zoneGeoloc.find('input[type=hidden]').each(function() {
            var name=$(this).attr('name');
            if ( name.substr(0,3)=='LCH') {
                var ins_id = name.substr(3);
                params[ ''+ins_id] = $(this).val();
                Mobi.infoLimos[ $(this).data('limo') ].LCH_FLAG_ACTIF = $(this).val();
            }
        });
        Jaf.cm.gds.send('geolocalisation-conf-wayd',{ 'params' : params },function(data) {
            Jaf.setStorage(  'limos'        , data.limos );
            zoneGeoloc.find('.btn.confirmer').addClass('saveOk');
            zoneGeoloc.find('.btn.confirmer').html('<span class="icone">ô</span>'+Jaf.translate('DIC_MISSION_SAUVER'));
        });
    });
}

Mobi.valoriseListesFormulaire = function() {
    var chu_id     = $('#fiche select[name=MIS_CHU_ID]').val( );
    var voi_id     = $('#fiche select[name=MIS_VOI_ID]').val( );
    var par_id     = $('#fiche select[name=MIS_PAR_ID]').val( );
    var chauffeurs = Jaf.cm.getConcept('C_Gen_Chauffeur').getSelect().fetchAll( { CHU_PAR_ID : par_id } );
    var res = '<option value="">...</option>';
    for(var i in chauffeurs) {
        res += '<option value="'+chauffeurs[i].CHU_ID+'">'+chauffeurs[i].CHU_PRENOM+' '+chauffeurs[i].CHU_NOM+'</option>';
    }
    
    $('#fiche select[name=MIS_CHU_ID]').html( res ).val(chu_id);

    if ( chu_id > 0 ) {
        var chauffeur = Jaf.cm.getConcept('C_Gen_Chauffeur').getRow( chu_id );
        var res = '';
        var lc = ['CHU_TEL_FIXE','CHU_TEL_MOBILE_1','CHU_TEL_MOBILE_2'];
        for(var i in lc ) {
            if ( chauffeur[ lc[i] ].length>0 ) res+='<label>'+Jaf.translate('DIC_TELEPHONE')+'</label><a href="tel:'+chauffeur[ lc[i] ]+'">'+chauffeur[ lc[i] ]+'</a>';
        }
        $('#fiche .tel_chauffeur').html( res );
    }
    
    var tve_id   =  $('#fiche select[name=MIS_TVE_ID]').val();
    var voitures = Jaf.cm.getConcept('C_Gen_Voiture').getSelect().join('C_Gen_TypeVehicule','VOI_TVE_ID','TVE_ID').fetchAll( { VOI_PAR_ID : par_id , VOI_TVE_ID : tve_id } );
    var res      = '<option value="">...</option>';
    for(var i in voitures) {
        res += '<option value="'+voitures[i].VOI_ID+'">'+voitures[i].TVE_LIBELLE+' : '+voitures[i].VOI_LIBELLE+'</option>';
    }
    $('#fiche select[name=MIS_VOI_ID]').html( res ).val(voi_id);
}
    
Mobi.cel = {
    date_debut : {
        tri : function (a,b) {
            var ad = ! a.MIS_DATE_DEBUT ?  '2100-01-01' : a.MIS_DATE_DEBUT;
            var bd = ! b.MIS_DATE_DEBUT ?  '2100-01-01' : b.MIS_DATE_DEBUT;
            var ah = ! a.MIS_HEURE_DEBUT ? '00:00:00'   : a.MIS_HEURE_DEBUT;
            var bh = ! b.MIS_HEURE_DEBUT ? '00:00:00'   : b.MIS_HEURE_DEBUT;
            
            var d_a= Jaf.getDate(ad+' '+ah);
            if ( ! d_a) {
                d_a = new Date('01/01/2100');
            }
            var d_b= Jaf.getDate(bd+' '+bh);
            if ( ! d_b) {
                d_b = new Date('01/01/2100');
            }
            return d_a.getTime() - d_b.getTime();
        }
    }
}

Jfo.setLoadUpdateReadyFonctions('update',function() {
    if ( Mobi.step > 4 ) {   
        $('#menu').prepend('<p>'+Jaf.translate('DIC_NOUVELLE_VERSION')+'</p><a href="#" onclick="javascript:window.location.reload(true); return false;">'+Jaf.translate('DIC_TELECHARGER')+'</a>');
        Mobi.openPopup('menu');
    } else {
        Mobi.newversion = true;
    }
}); 

Jfo.setNoUpdateFonctions('update',function() {
     Jaf.log('LimoDriver à jour','ok');
});

$(document).ready(function(){
    Mobi.init('wayd');
    Jfo.setLoadUpdateReadyFonctions('update',function() {
        window.location.reload(true);
    }); 

    Jfo.setNoUpdateFonctions('update',function() {
         Jaf.log('LimoDriver à jour','ok');
    });
});
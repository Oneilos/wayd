var JafController = function (name) {
    this.name           = name;
	this.status         = 0;
    this.status_old     = -1;
    this.frequence      = 15000;
    this.actionLoadData = '';
    this.opener    = {};
	this.closer    = {};
	this.droits    = {};
    this.obj       = {};
    this.databases = [];
	this.Tri       = {
		nomColonne : '',
		desc       : false
	}
	
    JafController.prototype.initApi=function() {
        this.status = 2;
        this.execute();
    }

    JafController.prototype.initAffichage=function() {
        this.status = 1;
        this.execute();
    }

    JafController.prototype.initConnexion=function() {    
        this.status = 3;
        this.execute();
    }

    JafController.prototype.initDataLocale=function() {
        Jaf.cm.loadDataLocale(this.databases);
        this.status = 4;
        this.execute();        
    }
	
    JafController.prototype.start=function() {
        this.status = 5;
        this.execute();
    }
    
    JafController.prototype.makeSynchro=function() {
        var controller = this;
        Jaf.cm.makeSynchro( this.databases , function (flag) {
            if ( flag ) { 
                Jaf.log('synchro ok');
                controller.status = 6;
                Jaf.cm.synchro    = true;
                Jaf.eve.executeModeDeconnecter();
                controller.execute();
            } else {
                Jaf.log('synchro ko');
                Jaf.cm.synchro    = false;
                Jaf.eve.executeModeDeconnecter();
                setTimeout( function () {
                    controller.execute();
                }, controller.frequence );
            }
        });
    }
    
    JafController.prototype.loadData = function (mafonction) {
        if ( this.actionLoadData.length > 0 ) {
            var params = [];
            for(var l in this.databases ) params.push( {limo:this.databases[l]} );
            var controller = this;
            Jaf.cm.gds.send( this.actionLoadData , params , function (data) {
                Jaf.cm.setDatas( data );
                controller.status = 7;
                controller.execute();
                if ( mafonction ) mafonction(data);
            },function () { 
                Jaf.log( controller.actionLoadData + ' failed');
                controller.status = 5;
                setTimeout(function() {
                    controller.execute();
                }, controller.frequence);
                if ( mafonction ) mafonction(data);
            });
        }
    }   
    
    JafController.prototype.initEvents = function () {
        Jaf.eve.init( this.databases , this.getEvent );
        this.status = 8;
        this.execute();
    }

    JafController.prototype.loadEvent = function (reponse) {
        var controller = this; 
        if ( reponse.resultat == 'ok' ) {
            setTimeout(function() {
                controller.execute();
            }, this.frequence);
        } else {
            Jaf.log('load Event ko');
            this.status = 5;
            setTimeout(function() {
                controller.execute();
            }, this.frequence);
        }
    }

    JafController.prototype.run = function () {
        var controller = this;
        Jaf.cm.saveDataLocale(this.databases);
        Jaf.eve.loadNewEvent(function(reponse) {
            controller.loadEvent(reponse);
        });
    }

    JafController.prototype.closeController = function () {
        Jaf.cm.saveDataLocale(this.databases);
        return 'Data save';
    }

    JafController.prototype.init=function(name) {
		this.name=name;
		Jaf.log('Lancement du controller : '+name);
        Jaf.tm.init();
        $( window ).unload(this.closeController);
        this.status = 0;
        this.execute();
	}
    
    JafController.prototype.getEvent=function(eve) {}
    
    JafController.prototype.setObj=function(name,value) {
		this.obj[ name ] = value;
		return this;
	}
    
    JafController.prototype.getObj=function(name) {
		return this.obj[ name ];
	}
	
    JafController.prototype.allowedEffect=function(zone) {
		if ( !zone ) {
			zone=$('#body');
		} else if ( typeof zone == 'string') {
			zone=$(zone);
		} 
		for(var j in this.droits) {
			for(var i in this.droits[j] ) {
				if ( !this.droits[j][i] ) {
					zone.find('.droit_'+j+'_'+i).each(function() {
						var tagName=$(this).get(0).tagName.toLowerCase();
						if ( tagName == 'div' || tagName == 'span' ) {
							$(this).hide();
						} else {
							$(this).attr('disabled','disabled');
						}
					});
				} else {
					zone.find('.droit_'+j+'_'+i).removeAttr('disabled');
				}
			}
		}
	}
	
	JafController.prototype.setEffectTri=function(class_id,mafonction) {
		var controller=this;
		$(class_id).each(function() {
			var month        = $(this);
			var classColonne = month.attr('class');
			if ( classColonne && classColonne.length>0) {
				var tab   = month.attr('class').split(' ');
				for(var i in tab) {
					var nomColonne = tab[i];
					if ( controller.cel[ nomColonne ].tri ) {
						month.append('<span class="icone sens" />');
						month.click(function() {
							if ( controller.Tri.nomColonne != nomColonne ) {
								month.parent().find('.sens').html('');
								month.parent().find('th').removeClass('tri_asc');
								month.parent().find('th').removeClass('tri_desc');
								controller.Tri.nomColonne = nomColonne;
							}
							if ( month.hasClass('tri_desc') || !month.hasClass('tri_asc') ) {
								month.removeClass('tri_desc');
								month.addClass('tri_asc');
								controller.Tri.desc = false; 
								month.find('.sens').html('#');
							} else {
								month.removeClass('tri_asc');
								month.addClass('tri_desc');
								controller.Tri.desc = true; 
								month.find('.sens').html("'");
							}
							mafonction();
						});
						if ( controller.Tri.nomColonne == nomColonne ) {
							month.addClass('tri_asc');
							month.find('.sens').html('#');
						}
						month.css('cursor','pointer');
					}
				}
			}
		});
	}
	
	JafController.prototype.makeTri=function(tv) {
		tv.sort( this.cel[ this.Tri.nomColonne ].tri );
		if ( this.Tri.desc ) tv.reverse(); 
	}

	JafController.prototype.getAppId=function() {
        var nom = this.name;
		var appId = localStorage.getItem('appId_'+nom);
        if (!appId) {
            var d = new Date();
            appId = nom+'.'+Jaf.date2mysql(d)+'.'+Math.round( Math.random()*100000 );
            localStorage.setItem('appId_'+nom,appId);
        }
		return appId;
	}
	
	JafController.prototype.setOpen=function(name,mafonction) {
		this.opener[name]=mafonction;
	}
	
	JafController.prototype.open=function(name,monid) {
		this.opener[name](monid);
	}

	JafController.prototype.setClose=function(name,mafonction) {
		this.closer[name]=mafonction;
	}
	
	JafController.prototype.close=function(name,monid) {
		this.closer[name](monid);
	}
	
	JafController.prototype.addEffect = {
		Texte : function(nomConcept,zone,monid,nomChamp,mafonc) {
			zone.find('[name='+nomChamp+']').change(function() {
				Jaf.cm.getConcept( nomConcept ).setValue( monid , nomChamp , $(this).val() ).save( mafonc );
			});
		},
		Montant : function(nomConcept,zone,monid,nomChamp,mafonc) {
			zone.find('[name='+nomChamp+']').change(function() {
				Jaf.cm.getConcept( nomConcept ).setValue( monid , nomChamp , Jaf.html2mysql.Montant( $(this).val() ) ).save( mafonc );
			});
		},
        Flag : function(nomConcept,zone,monid,nomChamp,mafonc) {
			var o=zone.find('[data-role='+nomChamp+']');
            
            if ( o.data('value')==1) {
                o.addClass('selection');
            }
            
            o.click(function() {
				var obj=$(this);
                if ( obj.data('value')==0 ) {
                    var value=1;
                    obj.addClass('selection');
                } else {
                    var value=0;
                    obj.removeClass('selection');
                }
                obj.data('value',value);
                Jaf.cm.getConcept( nomConcept ).setValue( monid , nomChamp , value ).save( mafonc );
                return false;
			});
		},
	}

    JafController.prototype.addEffect.Quantite = JafController.prototype.addEffect.Texte;

	JafController.prototype.addEffect.Fichier  = JafController.prototype.addEffect.Texte;

	JafController.prototype.addEffect.Select   = JafController.prototype.addEffect.Texte;

	JafController.prototype.addEffect.Tva      = JafController.prototype.addEffect.Texte;

	JafController.prototype.addEffect.Textarea = JafController.prototype.addEffect.Texte;

	JafController.prototype.valorise = function ( zone , champ , value ) {
        var obj = zone.find( '[data-champ='+champ+']' ).first(); 
        if ( obj.length > 0 ) {
            var type = obj.get(0).tagName;
            var valueFormated = obj.data('format') ? Jaf.formatValue[ obj.data('format') ]( value ) : value ; 
            if ( type == 'INPUT' ||
                 type == 'SELECT' ) {
                obj.val( valueFormated );
            } else {
                obj.html( valueFormated );
            }
            if ( obj.data('action') ) {
                var controller=this;
                controller[ obj.data('action') ](obj,champ,value,valueFormated); 
            }
        }
    }
    
    JafController.prototype.bindSqlInstalled = function (concept,type,nb) {
        if ( type ) { 
            this.nbProcessus[ type ]+= nb ? nb : 1;
            //Jaf.log(concept+' : '+type+' ==> '+this.nbProcessus.created+'/'+this.nbProcessus.creating+', '+this.nbProcessus.loaded+'/'+this.nbProcessus.loading+', '+this.nbProcessus.saved+'/'+this.nbProcessus.saving);
        }
        var step_old = this.step;
        switch ( this.step ) {
            case 1 :
                if ( this.nbProcessus.created == this.nbProcessus.creating && 
                     this.nbProcessus.init    == this.nbProcessus.loading ) {
                    this.step=2;
                }
                coef = this.nbProcessus.created / this.nbProcessus.init;
                $('#init .progression').css('width',Math.round( 10 + coef * 25 )+'%');
            break;
            case 2 :
                if ( this.nbProcessus.saved  == this.nbProcessus.saving && 
                     this.nbProcessus.loaded == this.nbProcessus.loading && 
                     this.nbProcessus.init   == this.nbProcessus.loaded )  {
                    this.step=3;
                }
                coef = ( this.nbProcessus.saved + this.nbProcessus.loaded ) / ( this.nbProcessus.saving +  this.nbProcessus.loading );
                $('#init .progression').css('width',Math.round( 35 + coef * 45 )+'%');
            break;
            case 3 :
                
                if ( this.nbElementSynchro ) {
                   var restant = localStorage.getItem( 'info_table_synchro_insert') + localStorage.getItem( 'info_table_synchro_saverowset');
                } else {
                    this.nbElementSynchro = localStorage.getItem( 'info_table_synchro_insert') + localStorage.getItem( 'info_table_synchro_saverowset');
                    var restant = this.nbElementSynchro;
                    if ( restant > 0 ) {
                        Jaf.cm.synchroniseBdd(); 
                    }
                }
                if ( restant > 0 ) {
                    coef      = 1 - restant/this.nbElementSynchro;
                    $('#init .progression').css('width',Math.round( 80 + coef * 20 )+'%');
                    setTimeout(this.bindSqlInstalled,500);
                } else {
                    coef      = 1;
                    this.step = 4;
                    $('#init .progression').animate({width:'100%'},300);
                }
            break;
            
        }
        if ( step_old != this.step ) this.init();
    }

    JafController.prototype.changeStatus = function() {
        if ( this.status_old != this.status ) {
            Jaf.log('[s'+this.status+']');
            this.status_old = this.status;
        } 
    };

    JafController.prototype.execute = function() {
        
        this.changeStatus();
        
        switch ( this.status ) {
            case 0 : this.initAffichage();   break;
            case 1 : this.initApi();         break;
            case 2 : this.initConnexion();   break;
            case 3 : this.initDataLocale();  break;
            case 4 : this.start();           break;
            case 5 : this.makeSynchro();     break;
            case 6 : this.loadData();        break;
            case 7 : this.initEvents();      break;
            case 8 : this.run();             break;
        }
    }
    
}

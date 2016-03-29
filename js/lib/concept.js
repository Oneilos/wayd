var JafConcept = function(name,trigramme,database){
	var trigramme          = trigramme;
	this.name              = name;
	this.trigramme         = trigramme;
	this.primary           = trigramme+'_ID';
    this.database          = database;
	this.rowAttente        = [];
	this.rowModifier       = [];
	this.rowset            = {};
	this.waitingProcess    = 0;
	this.afterLoadFunction = [];
	this.propageParent     = {};
	this.propageFils       = {};
    this.indexRowset       = {};
    this.synchro_insert    = [];
    this.synchro_update    = [];
    this.synchro_delete    = []; 
    this.listeObjetSauver  = [ 'rowset' , 'indexRowset' , 'synchro_insert' , 'synchro_update' , 'synchro_delete' ];
	
	JafConcept.prototype.getTrigramme=function () {
		return this.trigramme;
	}
	
    JafConcept.prototype.addIndex=function (champ) {
        this.indexRowset[champ] = {};
        return this;
	}
    
	JafConcept.prototype.saveDataLocale = function() {
        var listeObjet = this.listeObjetSauver;        
        var prefixe    = Jaf.cm.nameStorage + '.' + this.database + '.' + this.name + '.';
        for ( var i in listeObjet ) {
            var name  = prefixe + listeObjet[i];
            var value = this[ listeObjet[i] ];
            var o     = JSON.stringify( value );
            if ( o.length >2 ) {
                localStorage.setItem( name , o );
            } else {
                localStorage.removeItem( name );
            }
        }
    }
    
	JafConcept.prototype.loadDataLocale = function() {
        var listeObjet = this.listeObjetSauver;
        var prefixe    = Jaf.cm.nameStorage + '.' + this.database + '.' + this.name + '.';
        for ( var i in listeObjet ) {
            var name = prefixe + listeObjet[i];
            var o    = localStorage.getItem( name );
            if ( o ) {
                this[ listeObjet[i] ] =  JSON.parse( o );
            }
        }
    }

    JafConcept.prototype.getRowsetByIndex=function (champ, id , tris ) {
        var index  = 'c'+( ( typeof id == 'object' ) ? id.join('c') : id );
        var rowset = [];
        var tab = this.indexRowset[champ][index] ? this.indexRowset[champ][index] : [] ;
        for(var i in tab ) {
            if ( this.rowset['c'+tab[i] ] ) {
                rowset.push ( this.rowset['c'+tab[i] ] );
            }
        }
        if ( tris ) {
            var lt = tris.split(',');
            var tri = [];
            for (var i in lt) {
                var ll   = lt[i].split(' ');
                var sens = ll[1] && ll[1].toLowerCase()=='desc' ? 0 : 1;
                tri.push([ll[0],sens]);
            }
            rowset.sort(function(a,b) {
                for(var i in tri) {
                    var key = tri[ i ][0];
                    if ( isNaN( a[key] ) ) {
                        if ( a[key] != b[key] ) {
                            return  ( tri[ i ][1] ? 1 : -1 ) * ( a[key] > b[key] ? 1 : -1 );
                            break;
                        }
                    } else if (  a[key] != b[key] ) {
                        return tri[ i ][1] ? a[key] - b[key] : b[key] - a[key];
                        break;
                    }
                }
                return 0;
            }); 
        }
        return rowset;
	}
    
	JafConcept.prototype.load=function (mafonction) {
		var tab=[];
		var primary=this.primary;
		for(var  i in this.rowAttente ) {
			if (! this.getRow(i) ) {
				tab.push(i.substr(1));
				delete(this.rowAttente[i]);
			}
		}
		if (tab.length>0) {
			var fil={
				type  : 'hidden',
				champ : primary
			};
			var param = { filtres:{}};
			param.filtres[primary]=fil;
			param[primary]=tab;
			this.fetchAll(param,mafonction);
		} else {
			this.checkOnLoad();
		}

		return this;
	}
    
    JafConcept.prototype.loadStorage = function() {
        this.rowset = Jaf.getStorage( this.getTableName() );
        Jaf.cm.sqlInstalled.push(this.name);
    }

    JafConcept.prototype.saveStorage=function () {
       Jaf.setStorage( this.getTableName() , this.rowset ); 
    }
	
    JafConcept.prototype.getnewIncrement = function() {
        var increment = localStorage.getItem( Jaf.cm.nameStorage + '_increment_'+this.getTableName() );
        if ( !increment ) increment=1;
        localStorage.setItem( Jaf.cm.nameStorage +  '_increment_'+this.getTableName(), increment+1 );
        return increment;
    }
    
    JafConcept.prototype.insertRow=function (row,mafonction) {
		var concept=this;
		var trans = $.ajax({
            url       : Jaf.cm.urlDb + this.name + '/insertrow',
            data      : {row:row},
            type      : 'POST'
        });
        trans.done(function (data) {
                eval(data);
                concept.addRow( data , mafonction ); 
        });
        trans.fail(function () {
            Jaf.cm.failTransaction();
            if ( concept.isLocal() ) {
                var increment = concept.getnewIncrement() ;
                row[ concept.primary ] = increment;
                concept.addSynchroInsert(row);
                concept.addRow( row , function(row) {
                    if ( mafonction ) mafonction(row);
                }); 
            }
        });
		return this;
	}
	
	JafConcept.prototype.insertRowset=function (rowset,mafonction) {
		var concept=this;
		var trans = $.ajax({
            url  : Jaf.cm.urlDb+this.name+'/insertrow',
            data : {rowset:rowset},
            type : 'POST'
        });
        trans.done(function (rowset) {
			if ( rowset.length>0) {
                eval(rowset);
                concept.setRowset( rowset )
                if (mafonction) {
                    mafonction(rowset);
                }
            } else {
                //erreur sur creation
                Jaf.log('pas de data au retour de /bop3/'+this.name+'/insertrow');
            }
		}); 
        trans.fail(Jaf.cm.failTransaction);
		return this;
	}

	JafConcept.prototype.addRow=function (row,mafonc) {
		this.setRow(row);
        if ( this.isLocal() ) {
            this.setStorage();
        } 
        if ( mafonc) mafonc(row);
		return this;
	}

	JafConcept.prototype.setRow=function (row) {
        var id    = row[ this.primary ];

        //gestion de l'index
		for(var i in this.indexRowset) {
            if ( !row[i] ) {
                var cle =  '';
                var tab = i.split(',');
                for(var j in tab) cle += 'c'+row[ tab[j] ];
            } else {
                var cle   =  'c'+row[i];
            }
            if ( !this.indexRowset[i][ cle ] ) {
                this.indexRowset[i][ cle ] = [ id ];
            } else {
                if ( this.indexRowset[i][ cle ].indexOf( id ) == -1 ) this.indexRowset[i][ cle ].push( id );
            }
        }
        this.rowset[ 'c' + id ] = row; 
        
		return this;
	}

    JafConcept.prototype.setRowset=function (data) {
        for(var  i in data) {
			this.setRow(data[i]);
		}
        if ( this.isLocal() ) {
             this.saveStorage();
        }
		return this;
	}
     
    JafConcept.prototype.setRowsetAvecNomChamp=function (data,listeChamp) {
        this.rowset = {};
        for(var i in data) {
			var row={};
            var cpt=0;
            for(var j in listeChamp ) {
                row[ listeChamp[j] ] = data[i][cpt++];
            }
            this.setRow( row );
		}
        this.saveDataLocale();
		return this;
	}
	
	JafConcept.prototype.checkDeleteRow=function (id , mafonc ) {
        var concept = this;
        var cle     = 'c' + id;
        if ( this.rowset[ cle ] ) {
            //gestion de l'index
            for(var i in this.indexRowset) {
                if ( !this.indexRowset[i] ) {
                    var cle2 =  '';
                    var tab  = i.split(',');
                    for(var j in tab) cle2 += 'c'+this.rowset[ cle ][ tab[j] ];
                } else {
                    var cle2   =  'c'+this.rowset[ cle ][ i ];
                }
                if ( this.indexRowset[i][ cle2 ] ) {
                    var pos = this.indexRowset[i][ cle2 ].indexOf( ''+id );
                    if ( pos > -1 ) this.indexRowset[i][ cle2 ].splice(pos,1);
                }
            }
            
            delete( this.rowset[ cle ] );
            this.saveStorage();
            if ( mafonc ) mafonc();
        } else {
            if ( mafonc ) mafonc();
        }
	}
		 
	JafConcept.prototype.deleteAll=function (mafonction) {
        this.rowset = {};
        if ( this.isLocal() ) {
            this.saveStorage();
        }
        if ( mafonction ) mafonction();
	} 
    
	JafConcept.prototype.changeRow=function ( id , row ) {
		Jaf.log('changeRow '+this.name+' : '+id+' => '+row[ this.primary ] );
        Jaf.cm.deleteSynchroSave(id);
        this.checkDeleteRow(id);
        this.addRow(row);
	}
    
    JafConcept.prototype.changeSaveRowset = function (id, nomChamp , valeur ) {
		Jaf.log('changeSaveRowset '+id+' => '+nomChamp+'='+valeur);
        var synchro_saverowset = Jaf.getStorage('synchro_saverowset');
        synchro_saverowset['c'+id][nomChamp]=valeur;
        Jaf.setStorage('synchro_saverowset',synchro_saverowset);
    }
    
	JafConcept.prototype.deleteRow=function ( id,mafonction) {
		var row_deleted = {};
        $.extend( row_deleted , this.getRow(id) );
        this.checkDeleteRow( id );
		var concept=this;
        $.post(Jaf.cm.urlDb+this.name+'/deleterow',{ id : id } ,function (data) {
			if ( data == 'ko' ) {
                concept.insertrow(row_deleted);
            }
            if (mafonction) 
				mafonction(id,data);
		}); 
		return this;
	}

    JafConcept.prototype.addSynchroSave = function(monid,champ,valeur,madate) {
        var synchro_saverowset = Jaf.getStorage(this.database+'_synchro_saverowset');
        var nbElement      = 1*localStorage.getItem( Jaf.cm.nameStorage +  'info_table_synchro_saverowset' );
        synchro_saverowset['c'+nbElement ] = {
           SYN_CONCEPT : this.name,
           SYN_PRIMARY : monid,
           SYN_CHAMP   : champ,
           SYN_VALUE   : valeur,
           SYN_DATE    : madate
        }
        Jaf.setStorage(this.database+'_synchro_saverowset',synchro_saverowset); 
        localStorage.setItem( Jaf.cm.nameStorage +  'info_table_synchro_saverowset' , nbElement + 1 );
    }
    
    JafConcept.prototype.addSynchroInsert = function(row) {
        var synchro_insert = Jaf.getStorage(this.database+'_synchro_insert');
        var nbElement      = 1*localStorage.getItem( Jaf.cm.nameStorage +  'info_table_synchro_insert' );
        synchro_insert['c'+nbElement ] = {
           SYI_CONCEPT : this.name,
           SYI_PRIMARY : row[ this.primary ],
           SYI_DATE    : (new Date()).getTime()
        }
        Jaf.setStorage(this.database+'_synchro_saverowset',synchro_saverowset); 
        localStorage.setItem( Jaf.cm.nameStorage +  'info_table_synchro_insert' , nbElement + 1 );
    }
    
	JafConcept.prototype.save=function (mafonction) {
		var rowset=[];
		var nb=0;
		for(var  i in this.rowModifier) {
			rowset.push(this.rowModifier[i]);
			nb++;
			delete(this.rowModifier[i]);
		}
		if ( nb > 0 ) {
            this.saveStorage();
            this.saverowset(rowset,mafonction);
		} else if ( mafonction ) mafonction(rowset);
		return this;
	}
    
    JafConcept.prototype.saverowset= function(rowset,mafonction) {
        if ( rowset.length>0) {
            var concept = this;
            var params  = {};
            params[ this.name ] = rowset;
            var datas   = [ { limo : this.database , params : params } ];
            
            Jaf.cm.gds.send(Jaf.cm.actionSetRessource,datas,function(data) {
                if (data && data[concept.database]) {
                    
                    if (mafonction) {
                        mafonction(rowset);
                    }
                } else { 
                    concept.failSaverowset(rowset,mafonction);
                }
            },function() { 
                concept.failSaverowset(rowset,mafonction);
            });

        } else if ( mafonction ) mafonction(rowset);
    }
    
    JafConcept.prototype.addSynchroSave = function(monid,champ,valeur,madate) {
        for(var i in this.synchro_update) {
            if ( this.synchro_update[i].i == monid &&  this.synchro_update[i].c == champ ) {
                this.synchro_update[i]={
                    i : monid,
                    c : champ,
                    v : valeur,
                    d : madate
                }
                return true;
            }
        }
        this.synchro_update.push({
            i : monid,
            c : champ,
            v : valeur,
            d : madate
        });
    }
    
    JafConcept.prototype.failSaverowset=function(rowset,mafonction) {
        var concept = this;
        Jaf.cm.failTransaction();
        Jaf.log('impossible d\'envoyer les données');
        if ( ! Jaf.cm.hasAlertSyncho ) { 
            alert('Attention : votre connexion internet n\'a pas permis d\'envoyer les dernières informations saisies. Vos données seront automatiquement envoyées dès que la connexion aura été rétablie.');
            Jaf.cm.hasAlertSyncho=true;
        }
        for(var i in rowset) {
            var monid=rowset[i][ concept.primary ];
            if ( rowset[i][ 'date' ] ) {
                var madate = rowset[i][ 'date' ];
            } else {
                var d      = new Date();
                var madate = Math.round( d.getTime() / 1000 );
            }
            for(var nc in rowset[i]) {
                if ( nc != concept.primary && nc != 'date' ) {
                    concept.addSynchroSave(monid,nc,rowset[i][nc],madate);
                }
            }
        }
        if ( mafonction ) mafonction(rowset);
    }

	JafConcept.prototype.need=function (monid,flag_force) {
		if ( flag_force || ! this.getRow(monid) ) {
            this.rowAttente['c'+monid] = monid;
        }
		return this;
	}

	JafConcept.prototype.isLocal=function () {
        return Jaf.eve.mode_deco; // && localStorage.getItem( Jaf.cm.nameStorage + this.getTableName() );
	}
	
	JafConcept.prototype.setValue=function (monid,nomChamp,valeur,chargementEvenement) {
		var cle = 'c' + monid;
        if ( this.rowset[ cle ] ) {
            valeur    =  valeur==null ? '' : ''+valeur;
            var v_old = this.rowset[ cle ][nomChamp] == null ? '' : ''+this.rowset[ cle ][nomChamp];
            if ( valeur != v_old ) {
                
                //gestion de l'index
                if (this.indexRowset[ nomChamp ] ) {
                    if ( v_old && this.indexRowset[ nomChamp ][ 'c'+v_old ] ) {
                        var pos = this.indexRowset[ nomChamp ][ 'c'+v_old ].indexOf( ''+monid );
                        if ( pos > -1 ) this.indexRowset[ nomChamp ][ 'c'+v_old ].splice(pos,1);
                    }
                    if ( this.indexRowset[ nomChamp ][ 'c'+valeur ] ) {
                        this.indexRowset[ nomChamp ][ 'c'+valeur ].push( ''+monid );
                    } else if ( valeur ) {
                        this.indexRowset[ nomChamp ][ 'c'+valeur ] = [ ''+monid ];
                    }
                }
                
                this.rowset[ cle ][nomChamp]=valeur;
                if ( !chargementEvenement ) {
                    if ( !this.rowModifier[ cle ] ) {
                        this.rowModifier[ cle ]={};
                    }
                    this.rowModifier[ cle ][this.primary]=monid;
                    this.rowModifier[ cle ][nomChamp]=valeur;
                }
            }
        } else {
            Jaf.log('erreur setValue sur '+this.database+'.'+this.name+' : id='+monid+' row inexistant');
        }
        return this;
         
	}
        
	JafConcept.prototype.onload=function ( mafonction ) {
		this.afterLoadFunction.push(mafonction);
		return this;
	}
	
	JafConcept.prototype.checkOnLoad=function () {
		this.propageData();
		if ( this.waitingProcess==0 ) {
			for(var  i in this.afterLoadFunction) {
				this.afterLoadFunction[i]();
			}
			Jaf.cm.checkOnLoad();
		}
		return this;
	}
	
	JafConcept.prototype.getRow=function (monid) {
        if ( !this.rowset[ 'c' + monid ] ) {
			return false;
		}
		return this.rowset[ 'c' + monid ] ;
	}
	
	JafConcept.prototype.getRowset=function () {
		var rowset=[];
		for(var  i in this.rowset) {
		    rowset.push( this.rowset[i] ); 
		}
		return rowset;
	}

	JafConcept.prototype.getRowsetByChamp=function (nomChamp,value,where) {
		var rowset=[];
		for(var  i in this.rowset) {
			if ( this.rowset[i][nomChamp] == value ) {
                var flag=true;
                for(var wc in where ) {
                    flag &= this.rowset[i][wc]==where[wc];
                }
                if ( flag ) rowset.push( this.rowset[i] ); 
			}
		}
		return rowset;
	}
	
	JafConcept.prototype.getSelect=function () {
		return new Jaf.select( this );
	}

	JafConcept.prototype.getTableName=function () {
		return Jaf.cm.configConcepts[ this.name ].name;
	}
	
	JafConcept.prototype.fetchAll=function (params,mafonction) {
		var monConcept=this;
		if ( !params) {
			params = {};
		}
		monConcept.waitingProcess++;
		$.post(Jaf.cm.urlDb+this.name+'/getlistejson',params,function (data) {
			eval(data);
			monConcept.setRowset(data);
			monConcept.waitingProcess--;
			monConcept.checkOnLoad();
			if (mafonction) {
				mafonction(data);
			}
		}); 
		return this;
	}
	
	JafConcept.prototype.getAutocompleteList=function(request,lc,dedans) {
		var res=[]
		var rowset = this.rowset;
		var term = Jaf.toUpperCaseSansAccent(request.term);
		for (var i in rowset ) {
			var label='';
			for(var nc in lc) {
				label += (label.length==0 ? '' : ' ') + rowset[i][ lc[nc] ]; 
			}
			
			if ( dedans ? Jaf.toUpperCaseSansAccent( label ).indexOf( term ) > -1 : Jaf.toUpperCaseSansAccent( label ).indexOf(term)==0 ) {
				res.push({label:label,id:rowset[i][ this.primary ]});
			}
		}

		return res;
	}
	
    JafConcept.prototype.getAutocompleteListFiltrer=function(request,lc,filtres) {
		var rowset = this.getSelect().fetchAll(filtres);
		var res    = [];
		for (var i in rowset ) {
			if ( typeof lc == 'function') {
                var label = lc(rowset[i]);
            } else {
                var label='';
                for(var nc in lc) {
                    label += (label.length==0 ? '' : ' ') + rowset[i][ lc[nc] ]; 
                }
            }
			res.push({label:label,value:rowset[i][ this.primary ]});
		}
		return res;
	}
	
	JafConcept.prototype.setPropageParent=function (concept,nomChamp) {
		this.propageParent[nomChamp]=concept;
		return this;
	}
	
	JafConcept.prototype.setPropageFils=function (concept,nomChamp) {
		this.propageFils[nomChamp]=concept;
		return this;
	}

	JafConcept.prototype.propageData=function () {
		//récupère les données parent
		for(var  nomChamp in this.propageParent ) {
			var concept=this.propageParent[nomChamp];
			for(var  i in this.rowset ) {
				if (!concept.getRow( this.rowset[i][ nomChamp ] )) {
					concept.need( this.rowset[i][ nomChamp ] );
				}
			}
			concept.load();
		}
		
		//récupère les données fils 
		for(var  nomChamp in this.propageFils ) {
			var concept=this.propageFils[nomChamp];
			var tab=[];
			for(var  i in this.rowset ) {
				tab.push( this.rowset[i][ this.primary ] );
			}
			var params = {
				filtres:{}
			};
			params.filtres[nomChamp]={
				type  : 'hidden',
				champ : nomChamp
			};
			params[nomChamp]=tab;
			concept.fetchAll( params );
		}
		return this;
	}
};

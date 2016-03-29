Jaf.cm = {
    status                : 0,
    database              : null,
    urlDb                 : '/bop3/',
    nameDbDefaut          : 'local',
    actionSynchro         : 'synchronize',
    nameStorage           : 'local',
    urlLoaderData         : '/tools/Jaf/loader-data',
    actionSetRessource    : 'set-ressource',
    listeConcept          : {},
	listBind              : [],
    listeDataWait         : {},
    sqlInstalled          : [],
    synchro               : false,
    synchro_old           : -1,
    bindSqlInstalled      : null,
    saverowset_en_attente : 0,
    
    setDatabase : function(name) {
        if ( !Jaf.cm.listeConcept[ name ] ) {
            Jaf.cm.listeConcept[ name ] = {};
        }
        Jaf.cm.database = name;
    },
    
    addConcept  : function (concept) {
        Jaf.cm.listeConcept[Jaf.cm.database][concept.name] = concept;
    },

	getConcept   : function (name,database) {
		var db = database ? database : Jaf.cm.database;
        if ( !Jaf.cm.listeConcept[ db ] ) {
            Jaf.cm.listeConcept[ db ] = {};
        }
        if (Jaf.cm.listeConcept[ db ][name]) {
			return Jaf.cm.listeConcept[ db ][name];
		} else {
			if (!Jaf.cm.listeConcept[ db ][ name ]) {
                Jaf.cm.listeConcept[db][name]=Jaf.extend( new JafConcept( name , Jaf.cm.configConcepts[name] , db ) );
                return Jaf.cm.listeConcept[db][name]; 
            } else {
				Jaf.log('le concept '+name+' n\'existe pas dans Jaf.cm.configConcepts');
				return false;
			}
		}
	},

    getConceptByTable : function (name) {
		for ( var nom in Jaf.cm.configConcepts ) {
            if ( Jaf.cm.configConcepts[nom].name == name ) {
                return Jaf.cm.getConcept(nom);
            }
        }
        Jaf.log( 'Impossible de recuperer getConceptByTable(' + name + ')' );
        return false;		
	},

	getListeTML : function(name) {
		var rowset = Jaf.cm.getConcept(name).rowset;
		var tab    = [];
		for(var i in rowset ) {
			var row={};
			for(var j in rowset[i]) {
				if ( rowset[i][j] ) {
                    row[j] = typeof rowset[i][j] == 'string' && rowset[i][j].indexOf('~^') > 0 ? Jaf.translate(rowset[i][j]) : rowset[i][j];
				}
			}
			tab.push(row);
		}
		return {liste:tab}
	},
	
    needDataConcept : function(name,where,database) {
		var db = database ? database : Jaf.cm.database;
        if ( !Jaf.cm.listeDataWait[db] ) Jaf.cm.listeDataWait[db]={};
        Jaf.cm.listeDataWait[ db ][ name ] = where;
    },
    
    loadDatasConcept : function() {
        var config = {};
        var wheres = {};
        var flag   = false;
        for(var name in Jaf.cm.listeDataWait) {
            flag           = true;
            var concept    = Jaf.cm.getConceptByTable( name );
            config[ name ] =  { t : name , i : concept.primary };
            Jaf.cm.listeConcept[Jaf.cm.database][ concept.name ].waitingProcess++;
            if ( Jaf.cm.listeDataWait[name] && Jaf.cm.listeDataWait[name].length > 0 ) {
                wheres[ name ] = Jaf.cm.listeDataWait[name];
            }
            //Jaf.log('je load la table '+name);
        }
        if ( flag ) {
            Jaf.cm.loaderData( config , wheres , Jaf.cm.checkOnLoad );
        } else {
            Jaf.cm.checkOnLoad();  
        }
    }, 
    
    onload : function( mafonction ) {
		Jaf.cm.listBind.push( mafonction );
	},

	checkOnLoad : function() {
		for(var i in Jaf.cm.listBind ) {
			Jaf.cm.listBind[i]();
		}
	},
    
    saveDataLocale : function( databases ) {
        for( var i in databases ) {
            Jaf.cm.setDatabase(databases[i]);
            for( var nc in Jaf.cm.configConcepts ) {
                var concept = Jaf.cm.getConcept( nc );
                concept.saveDataLocale();
            }
        }
    },
    
    loadDataLocale : function( databases ) {
        for( var i in databases ) {
            Jaf.cm.setDatabase(databases[i]);
            for( var nc in Jaf.cm.configConcepts ) {
                var concept = Jaf.cm.getConcept( nc );
                concept.loadDataLocale();
            }
        }
        Jaf.cm.checkOnLoad();
    },
    
    loadData   : function ( datas , lnc , increments ) {
        //Jaf.log(datas);
        for( var table in datas ) {
           var concept = Jaf.cm.getConceptByTable( table );
           concept.setRowsetAvecNomChamp( datas[ table ] , lnc[ table ] );
        }
        for( var table in increments ) {
           Jaf.setStorage( Jaf.cm.database+'_increment_'+table , increments[table] );
        }
    },
    
    // config de table a executer , liste des wheres , fonction a executer une fois le chargement terminé
    loaderData : function( config , wheres , mafonction , prefonction ) {
        if ( ! Jaf.cm.session ) {
            Jaf.cm.session = Math.random();
        }
        if ( Jaf.cm.authLoader ) {
            var data = Jaf.cm.authLoader;
            data.session = Jaf.cm.session;
            data.config  = config;
            data.wheres  = wheres;
        } else {
            var data = {
                session : Jaf.cm.session,
                config  : config , 
                wheres  : wheres 
            }
        }

        var trans = $.ajax({
            url  : Jaf.cm.urlLoaderData,
            type : 'POST',
            data : data
        });
        
        trans.done(function (data) {
            Jaf.log('---------------------------loadData done -----------------');
            Jaf.cm.doneTransaction();
            if (prefonction) prefonction();
            eval( data ); 
            if ( mafonction ) {
                mafonction();
            }
        });
        
        trans.fail(function(response) {
            Jaf.cm.failTransaction();
            if ( mafonction ) {
                mafonction();
            }
        });
    },

    eraseAll : function() {
        for(var i in localStorage) {
            if ( i.substr( 0, Jaf.cm.nameStorage.length) == Jaf.cm.nameStorage) {
                localStorage.removeItem( i );
            }
        }
    },

    getPrefix : function() {
        return Jaf.cm.nameStorage + '_' + Jaf.cm.database + '_';
    },
    
    deleteSynchroSave : function(id) {
        var synchro_saverowset = Jaf.getStorage('synchro_saverowset');
        delete( synchro_saverowset['c'+id] );
        Jaf.setStorage('synchro_saverowset',synchro_saverowset);
        var cle       = Jaf.cm.getPrefix()+'info_table_synchro_saverowset';
        var nbElement = localStorage.getItem( cle );
        localStorage.setItem( cle , nbElement - 1 );
    }, 

    deleteSyi : function(syi_id) {
        var synchro_insert = Jaf.getStorage('synchro_insert');
        delete( synchro_insert['c'+syi_id] );
        Jaf.setStorage('synchro_insert',synchro_insert);
        var nbElement = localStorage.getItem( Jaf.cm.nameStorage + 'info_table_synchro_insert');
        localStorage.setItem( Jaf.cm.nameStorage + 'info_table_synchro_insert' , nbElement - 1 );
    },

	makeSynchro : function( databases , mafonction ) {
        var data = [];
        for( var i in databases ) {
            Jaf.cm.setDatabase(databases[i]);
            var params = Jaf.cm.getRowsynchro();
            if ( JSON.stringify( params ).length > 2 ) {
                data.push({ limo : databases[i] , params : params } );
            }
        }
        if ( data.length > 0 ) {
            Jaf.cm.gds.send(
                Jaf.cm.actionSynchro,
                data,
                function (data) {
                    Jaf.cm.doneTransaction();
                    for( var i in databases ) {
                        if ( data[ databases[i] ] ) {
                            Jaf.log('je purge les synchros');
                            for(var name in Jaf.cm.configConcepts) {
                                var concept = Jaf.cm.getConcept(databases[i]+'.'+name);
                                concept.synchro_insert = [];
                                concept.synchro_update = [];
                                concept.synchro_delete = [];
                            }
                        }
                    }
                    if ( mafonction ) {
                        mafonction(true);
                    }
                },
                function() {
                    Jaf.cm.failTransaction();
                    if ( mafonction ) {
                        mafonction(false);
                    }
                }
            );
        } else {
            if ( mafonction ) {
                mafonction(true);
            }
        }
        
    },
    
    getRowsynchro : function() {
        var res = {};
        for(var nc in Jaf.cm.configConcepts) {
            var concept = Jaf.cm.getConcept(nc);
            //Jaf.log(Jaf.cm.database+':'+nc);
            var li      = concept.synchro_insert;
            var lu      = concept.synchro_update;
            var ld      = concept.synchro_delete;
            var o       = {};
            var flag    = false;
            if ( li.length > 0 ) {
                o.i = li;
                flag=true;
            }
            if ( lu.length > 0 ) {
                o.u = lu;
                flag=true;
            }
            if ( ld.length > 0 ) {
                o.d = ld;
                flag=true;
            }
            if ( flag ) {
                res[ nc ] = o;
            }
        }
        return res;
    },
    
    setDatas : function( datas ) {
        for( var database in datas ) {
            Jaf.cm.database = database;
            var data        = datas[database].data;
            var champs      = datas[database].champs;
            
            for (var nc in data) {
                var concept = Jaf.cm.getConcept( nc );
                concept.setRowsetAvecNomChamp( data[nc] , champs[nc] );
            }
        }
        Jaf.cm.checkOnLoad();
    },
    
    doneTransaction : function() {
        if ( Jaf.cm.synchro == false ) {
            Jaf.cm.synchro = true;
            //Jaf.log('passé par doneTransaction');
            //Jaf.eve.executeModeDeconnecter();
        }
    },

    failTransaction : function(eve) {
        if ( Jaf.cm.synchro) {
            Jaf.cm.synchro = false;
            Jaf.log('passé par failTransaction');
            Jaf.eve.executeModeDeconnecter();
        }
    }

}
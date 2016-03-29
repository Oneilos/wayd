Jaf.select = function( concept ){
	this.concepts  = [];
	this.jointures = [];
	this.typeJoin  = [];
	this.wheres    = [];
    this.orders    = [];
	this.concepts.push(concept);
	
	// join au select un nouveau concept portant le nom name et relié au select par le champ cp et relié au nouveau concept par le champ cd , optionnel wc,wv tel que where wc=wl sur la jointure
	Jaf.select.prototype.joinAux = function (type,name,cp,cd,where) {
		this.concepts.push( Jaf.cm.getConcept(name) );
		this.jointures.push( {cp:cp,cd:cd} );
		this.wheres.push( where );
        this.typeJoin.push( type );
		return this;
	}
    // champ : nom du champ de tri, sens : true=croissant, false=decroissant
    Jaf.select.prototype.order = function (champ,sens) {
		this.orders.push({champ:champ,sens:sens});
		return this;
	}
	Jaf.select.prototype.join = function (name,cp,cd,where) {
		this.joinAux(1,name,cp,cd,where);
		return this;
	}
    
	Jaf.select.prototype.leftJoin = function (name,cp,cd,where) {
		this.joinAux(2,name,cp,cd,where);
		return this;
	}
	
    Jaf.select.prototype.fetchAll_where = function(row,where) {
        if ( where ) {
            var flag=true;
            for(var wc in where) {
                flag &= where[wc] == row[wc];
            }
            if ( flag ) {
                return row;
            } else {
                return null;
            }
        } else {
            return row;
        }
    }
    
	// renvoi un array d'objet contenant la fusion des champs des concepts du select relié par leurs jointures définies
	Jaf.select.prototype.fetchAll = function(filtres) {
		var cpt    = 1;
		var nbRow  = 0;
		var rowset = [];
		
		for(var  i in this.concepts[0].rowset) {
			var r = {};
            for(var j in this.concepts[0].rowset[i]) {
                r[j] = this.concepts[0].rowset[i][j];
            }
            rowset[nbRow++] = r;
		}
		//Jaf.log('Pour '+this.concepts[0].name+' ==> rowset.length='+rowset.length);

		while ( cpt<this.concepts.length ) {
			var champJointure = this.jointures[ cpt - 1 ].cp;
			var champJoin     = this.jointures[ cpt - 1 ].cd;
			var typeJoin      = this.typeJoin[ cpt - 1 ];
			var where         = this.wheres[ cpt - 1 ];
			var modePrimary   = this.concepts[cpt].primary == champJoin;
			for(var  i in rowset ) {
                if ( modePrimary ) {
                    var row = this.fetchAll_where ( this.concepts[cpt].getRow( rowset[i][ champJointure ] ) , where  );
                    if (row) { 
                        $.extend( rowset[i], row );
                    } else if ( typeJoin == 1 ) {
                        delete( rowset[i] );
                    }
                } else {
                    var rowsetJoin=this.concepts[cpt].getRowsetByChamp( champJoin , rowset[i][ champJointure ]  , where );
                    if ( rowsetJoin.length==0) {
                        if ( typeJoin == 1 ) {
                            delete( rowset[i] );
                        }
                    } else if ( rowsetJoin.length==1 ) {
                        $.extend( rowset[i], rowsetJoin[0] );
                    } else {
                        for(var  j in rowsetJoin ) {
                            var r = {};
                            $.extend( r , rowset[i] , rowsetJoin[j]);
                            rowset.push(r);
                        }
                    }
                }
			}
			nbRow=rowset.length;
  		    //Jaf.log('Join '+this.concepts[cpt].name+' ==> rowset.length='+nbRow);

            cpt++;
            
		}
		var res_rowset=[];
		var pre=0;
        for(var j in filtres ) {
             if ( filtres[j] ) {pre++;break;}
        }
        if ( pre>0) {
            for(var i in rowset) {
                var flag=true;
                for(var j in filtres ) {
                    if ( filtres[j] ) {
                        if (rowset[i][j]) {
                            if ( typeof filtres[j] == 'object' ) {
                                for(var operateur in  filtres[j] ) {
                                    var value = filtres[j][operateur];
                                    switch (operateur) {
                                        case 'in'           : flag &= value.indexOf( rowset[i][j] ) > -1; break;
                                        case 'sup'          : flag &= rowset[i][j] >= value;              break;
                                        case 'inf'          : flag &= rowset[i][j] <= value;              break;
                                        case 'sups'         : flag &= rowset[i][j] > value;               break;
                                        case 'infs'         : flag &= rowset[i][j] < value;               break;
                                        case 'like'         : 
                                            if ( typeof value == 'object' ) {
                                                var res='';
                                                for(var k in value.listeChamp ) {
                                                    res += rowset[i][ value.listeChamp[k] ]+' ';
                                                }
                                                flag &= Jaf.compareTexte( res , value.value );
                                            } else {
                                                flag &= Jaf.compareTexte( rowset[i][j], value );
                                            }
                                            break;
                                        case 'between'      : flag &= rowset[i][j] >= value[0] && rowset[i][j] <= value[1];           break;
                                    }
                                }
                            } else {				
                                flag &= rowset[i][j] == filtres[j];
                            }
                        } else {
                            flag=false;
                        }
                        if (!flag) break;
                    } 
                }
                if (flag) {
                    res_rowset.push(rowset[i]);
                } 
            }
        } else {
            //Jaf.log('Pas de filtre');
            res_rowset=rowset;
        }
        
        if ( this.orders.length > 0 ) {
            var tris = this.orders;
            var new_rowset = res_rowset.sort(function (a, b) {
                var a_sup_b = 0;
                for(var i in tris) {
                    var key = tris[ i ].champ;
                    if ( isNaN( a[key] ) ) {
                        if ( a[key] != b[key] ) {
                            a_sup_b =  ( tris[ i ].sens ? 1 : -1 ) * ( a[key] > b[key] ? 1 : -1 );
                            break;
                        }
                    } else if (  a[key] != b[key] ) {
                        a_sup_b =  tris[ i ].sens ? a[key] - b[key] : b[key] - a[key];
                        break;
                    }
                }
                return a_sup_b;
            });
            res_rowset = new_rowset;
        }
        var res=[];
        for(var i in res_rowset) {
            res.push(res_rowset[i]);
        }
	    //Jaf.log('FetchAll ==> '+res.length);

		return res;
	}
} 


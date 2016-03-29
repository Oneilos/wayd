Jaf.tm = {
	t           : {},
	ficTml      : {},
	TmlWaiting  : 0,
	init        : function () {
		$('script[type$=x-mustache-template]').each(function () {
			Jaf.tm.compile( $(this).attr('id') , $(this).html() );
            $(this).remove();
		});
	},
	compile : function ( nomTemplate , monHtml ) {
		//Jaf.log('new template : '+nomTemplate);
		if ( Jaf.LAN_CODE ) {
            monHtml = Jaf.translateHtml(monHtml);
        }
        var mafonction =  Mustache.compilePartial( nomTemplate , monHtml );
        
        Jaf.tm.t[ nomTemplate ] = function (params) {
            return Jaf.translateHtml( mafonction(params) );
        }
	},
    getRow : function(row) {
        if ( $.isArray(row) ) {
            var o=[];
            for(var i in row) {
                if ( row[i] ) {
                    o.push( typeof row[i] == 'object'  ? Jaf.tm.getRow( row[i] )  : row[i] );
                } else {
                    o.push( '' );
                }
            }
        }
        else {
            var o={};
            for(var i in row) {
                if ( row[i] ) {
                    o[i] = typeof row[i] == 'object' ? Jaf.tm.getRow( row[i] ) : row[i];
                } else {
                    o[i] = '';
                }
            }
        }
        return o;
    },
    render : function(nomTemplate,row) {
        var res = Jaf.tm.getRow(row) ;
        return Jaf.tm.t[ nomTemplate ]( res );
    },
	checkOnLoad : function () {
		if ( Jaf.tm.afterLoadFunction && Jaf.tm.TmlWaiting==0 ) {
			Jaf.tm.afterLoadFunction();
		}
	},
	onload : function ( mafonction ) {
		Jaf.tm.afterLoadFunction = mafonction;
		Jaf.tm.checkOnLoad();
	}
}
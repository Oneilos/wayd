Jaf.Gds = function( name , apiKey , cleSecrete , url ) {
    this.name           = name;
    this.apiKey         = apiKey;
    this.cleSecrete     = cleSecrete;
    this.flagCleSecrete = false;
    this.urlGds         = url;
    this.mode           = true;
    
    Jaf.Gds.prototype.getLogoPartenaire = function(ins_id) {
        var row = Jaf.cm.getConcept('C_Gds_Limos').getRow(ins_id);
        return row.INS_LOGO ? Jaf.Gds.urlGds+'/images/bop/'+row.INS_LOGO.substr(1,row.INS_LOGO.length-5)+'-200x200.png' : '';
    }
    
    Jaf.Gds.prototype.send = function( action , data , mafonction, mafonction_fail ) {
        if (this.mode ) {
            var oHeader = {};
            oHeader[ this.name ] = this.apiKey;
            oHeader[ 'time'    ] = Math.round(( new Date() ).getTime()/1000);
            
            var sHeader = JSON.stringify(oHeader);
            var sPayload = JSON.stringify(data);
            var sJWT = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, this.cleSecrete);
            
            var trans = $.ajax({
                url      : this.urlGds+'gdsv3/'+action+'/?p='+action+'&callback=?',
                type     : 'POST',
                dataType : "json",
                data     : sJWT
            });
            if ( mafonction      ) trans.done(function(data) { mafonction(data)});
            if ( mafonction_fail ) trans.fail(function(data) { Jaf.log('gds.send('+action+') failed'); mafonction_fail(data)}); 
        } else {
            if ( mafonction_fail ) {
                Jaf.log('Mode debug deconnecté : gds.send('+action+') failed'); 
                mafonction_fail(data)
            }; 
        }

    }
}
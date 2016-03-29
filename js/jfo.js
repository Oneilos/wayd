var Jfo = {
    onLoadUpdateReadyFonctions : {},
    onLoadNoUpdateFonctions    : {},
    init : function() {
        Jaf.log('Jfo init');
        window.applicationCache.addEventListener('updateready', function(e) {
            Jaf.log('Appcache status='+window.applicationCache.status);
            if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
                window.applicationCache.swapCache();
                // Lancer les fonctions en cas de mise à jour
                for(var i in Jfo.onLoadUpdateReadyFonctions) {
                    Jfo.onLoadUpdateReadyFonctions[i]();
                }
            }
        }, false);

        window.applicationCache.addEventListener('noupdate', function(e) {
          // Pas de mise à jour
            for(var i in Jfo.onLoadNoUpdateFonctions) {
                Jfo.onLoadNoUpdateFonctions[i]();
            }            
            
        }, false);
    },
    
    setLoadUpdateReadyFonctions : function (name,mafonc) {
        Jfo.onLoadUpdateReadyFonctions[name] = mafonc;
        return this;
    },
    
    setNoUpdateFonctions : function (name,mafonc) {
        Jfo.onLoadNoUpdateFonctions[name] = mafonc;
        return this;
    }
}

Jfo.init();	

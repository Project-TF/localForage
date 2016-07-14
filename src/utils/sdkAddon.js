/**
 * Detect Firefox SDK Addon environment and prepare some globals
 *
 * @author Dumitru Uzun (DUzun.Me)
 */

(function (undefined) {
    // require's surrogate, to avoid interpretation by browserify and other tools
    function req(mod) { return require(mod); }

    var window = this;

    // We need only Firefox SDK Addon environment
    if ( typeof exports === "object" && typeof module !== "undefined" && window && window.Array === Array )
    try {
        // window is the sandbox global object
        window.window = window;

        // IndexedDB
        expo(req('sdk/indexed-db'));

        // Timers
        if ( typeof setTimeout == 'undefined' ) {
            expo(
                req("sdk/timers")
              , [
                    'setTimeout'  , 'clearTimeout',
                    'setImmediate', 'clearImmediate'
                ]
            );
        }

        // Hack to try and get some globals that are missing from sandboxed global space
        // Blob, BlobBuilder, FileReader
        var Cu = req('chrome').Cu;
        var Services = Cu['import']("resource://gre/modules/Services.jsm", {});
        var globs = ['Blob', 'BlobBuilder', 'FileReader'];
        expo(Services, globs);
        expo(Services.appShell && Services.appShell.hiddenDOMWindow, globs);

    } catch(err) {
        // console.log('error', err);
    }

    function expo(ctx, props) {
        if ( !ctx ) return;
        if ( !props ) props = Object.keys(ctx);
        for(var i = props.length,p; i--;) {
            p = props[i];
            if ( ctx[p] != undefined ) {
                if ( !(p in window) ) {
                    window[p] = ctx[p];
                }
            }
        }
        return ctx;
    }
}());

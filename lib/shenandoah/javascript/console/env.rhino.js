/*
*	env.rhino.js
*/
var __env__ = {};
(function($env){
    
    //You can emulate different user agents by overriding these after loading env
    $env.appCodeName  = "EnvJS";//eg "Mozilla"
    $env.appName      = "Resig/20070309 BirdDog/0.0.0.1";//eg "Gecko/20070309 Firefox/2.0.0.3"

    //set this to true and see profile/profile.js to select which methods
    //to profile
    $env.profile = false;
    
    $env.log = function(msg, level){
         print(' '+ (level?level:'LOG') + ':\t['+ new Date()+"] {ENVJS} "+msg);
    };
    $env.debug  = function(){};
    $env.info   = function(){};
    $env.warn   = function(){};
    $env.error  = function(){};
    
    //uncomment these if you want to get some internal log statementes
    /*$env.debug  = function(msg){
        $env.log(msg,"DEBUG"); 
    };
    $env.info   = function(msg){
        $env.log(msg,"INFO"); 
    };*/
    $env.warn   = function(msg){
        $env.log(msg,"WARNIING");    
    };
    $env.error = function(msg, e){
        $env.log(msg+ " Line: "+ $env.lineSource(e),'ERROR');
        $env.log(e||"",'ERROR');
    };
    
    $env.info("Initializing Rhino Platform Env");
    
    $env.lineSource = function(e){
        return e&&e.rhinoException?e.rhinoException.lineSource():"(line ?)";
    };
    
    $env.hashCode = function(obj){
        return obj?obj.hashCode().toString()+'':null;
    };
    
    //For Java the window.location object is a java.net.URL
    $env.location = function(path, base){
      var protocol = new RegExp('(^file\:|^http\:|^https\:)');
        var m = protocol.exec(path);
        if(m&&m.length>1){
            return new java.net.URL(path).toString()+'';
        }else if(base){
          return new java.net.URL(new java.net.URL(base), path).toString()+'';
        }else{
            //return an absolute url from a url relative to the window location
            if(window.location.href.length > 0){
                base = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
                return base + '/' + path;
            }else{
                return new java.io.File(  path ).toURL().toString()+'';
            }
        }
    };
    
    //For Java the window.timer is created using the java.lang.Thread in combination
    //with the java.lang.Runnable
    $env.timer = function(fn, time){
        //$env.debug("wating for timer "+time);
        return new java.lang.Thread(new java.lang.Runnable({
            run: function(){
                while (true){
                    java.lang.Thread.currentThread().sleep(time);
                    //$env.debug("calling in timer "+time);
                    fn();
                }
            }
        }));
    };	
    
    //Since we're running in rhino I guess we can safely assume
    //java is 'enabled'.  I'm sure this requires more thought
    //than I've given it here
    $env.javaEnabled = true;	
    
    
    //Used in the XMLHttpRquest implementation to run a
    // request in a seperate thread
    $env.runAsync = function(fn){
        $env.debug("running async");
        (new java.lang.Thread(new java.lang.Runnable({
            run: fn
        }))).start();
    };
    
    //Used to write to a local file
    $env.writeToFile = function(text, url){
        $env.debug("writing text to url : " + url);
        var out = new java.io.FileWriter( 
            new java.io.File( 
                new java.net.URI(url.toString())));	
        out.write( text, 0, text.length );
        out.flush();
        out.close();
    };
    
    //Used to write to a local file
    $env.writeToTempFile = function(text, suffix){
        $env.debug("writing text to temp url : " + suffix);
        // Create temp file.
        var temp = java.io.File.createTempFile("envjs-tmp", suffix);
    
        // Delete temp file when program exits.
        temp.deleteOnExit();
    
        // Write to temp file
        var out = new java.io.FileWriter(temp);
        out.write(text, 0, text.length);
        out.close();
        return temp.getAbsolutePath().toString()+'';
    };
    
    //Used to delete a local file
    $env.deleteFile = function(url){
        var file = new java.io.File( new java.net.URI( url ) );
        file["delete"]();
    };
    
    $env.connection = function(xhr, responseHandler){
        var url = java.net.URL(xhr.url);//, $w.location);
      var connection;
        if ( /^file\:/.test(url) ) {
            if ( xhr.method == "PUT" ) {
                var text =  data || "" ;
                $env.writeToFile(text, url);
            } else if ( xhr.method == "DELETE" ) {
                $env.deleteFile(url);
            } else {
                connection = url.openConnection();
                connection.connect();
            }
        } else { 
            connection = url.openConnection();
            connection.setRequestMethod( xhr.method );
            
            // Add headers to Java connection
            for (var header in xhr.headers){
                connection.addRequestProperty(header+'', xhr.headers[header]+'');
          }connection.connect();
            
            // Stick the response headers into responseHeaders
            for (var i = 0; ; i++) { 
                var headerName = connection.getHeaderFieldKey(i); 
                var headerValue = connection.getHeaderField(i); 
                if (!headerName && !headerValue) break; 
                if (headerName)
                    xhr.responseHeaders[headerName+''] = headerValue+'';
            }
        }
        if(connection){
                xhr.readyState = 4;
                xhr.status = parseInt(connection.responseCode,10) || undefined;
                xhr.statusText = connection.responseMessage || "";
                
                var contentEncoding = connection.getContentEncoding() || "utf-8",
                    stream = (contentEncoding.equalsIgnoreCase("gzip") || contentEncoding.equalsIgnoreCase("decompress") )?
                            new java.util.zip.GZIPInputStream(connection.getInputStream()) :
                            connection.getInputStream(),
                    baos = new java.io.ByteArrayOutputStream(),
                buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024),
                    length,
                    responseXML = null;

                while ((length = stream.read(buffer)) != -1) {
                    baos.write(buffer, 0, length);
                }

                baos.close();
                stream.close();

                xhr.responseText = java.nio.charset.Charset.forName("UTF-8").
                    decode(java.nio.ByteBuffer.wrap(baos.toByteArray())).toString()+"";
                
        }
        if(responseHandler){
          responseHandler();
        }
    };
    
    var htmlDocBuilder = Packages.javax.xml.parsers.DocumentBuilderFactory.newInstance();
    htmlDocBuilder.setNamespaceAware(false);
    htmlDocBuilder.setValidating(false);
    
    $env.parseHTML = function(htmlstring){
        return htmlDocBuilder.newDocumentBuilder().parse(
                  new java.io.ByteArrayInputStream(
                        (new java.lang.String(htmlstring)).getBytes("UTF8")))+"";
    };
    
    var xmlDocBuilder = Packages.javax.xml.parsers.DocumentBuilderFactory.newInstance();
    xmlDocBuilder.setNamespaceAware(true);
    xmlDocBuilder.setValidating(true);
    
    $env.parseXML = function(xmlstring){
        return xmlDocBuilder.newDocumentBuilder().parse(
                  new java.io.ByteArrayInputStream(
                        (new java.lang.String(xmlstring)).getBytes("UTF8")))+"";
    };
    
    
    $env.xpath = function(expression, doc){
    return Packages.javax.xml.xpath.
      XPathFactory.newInstance().newXPath().
        evaluate(expression, doc, javax.xml.xpath.XPathConstants.NODESET);
    };
    
    $env.tmpdir         = java.lang.System.getProperty("java.io.tmpdir"); 
    $env.os_name        = java.lang.System.getProperty("os.name"); 
    $env.os_arch        = java.lang.System.getProperty("os.arch"); 
    $env.os_version     = java.lang.System.getProperty("os.version"); 
    $env.lang           = java.lang.System.getProperty("user.lang"); 
    $env.platform       = "Rhino ";//how do we get the version
    
    $env.safeScript = function(){
      //do nothing  
    };
    
    $env.scriptTypes = {
        "text/javascript"   :false,
        "text/envjs"        :true
    };
    
    $env.loadLocalScript = function(script, parser){
        $env.debug("loading script ");
        var types, type, src, i, base, 
            docWrites = [],
            write = document.write,
            writeln = document.writeln;
        //temporarily replace document write becuase the function
        //has a different meaning during parsing
        document.write = function(text){
			docWrites.push(text);
		};
        try{
			if(script.type){
                types = script.type?script.type.split(";"):[];
                for(i=0;i<types.length;i++){
                    if($env.scriptTypes[types[i]]){
						if(script.src){
                            $env.info("loading allowed external script :" + script.src);
                            base = "" + window.location;
							load($env.location(script.src.match(/([^\?#]*)/)[1], base ));
                        }else{
                            $env.loadInlineScript(script);
                        }
                    }else{
                        if(!script.src && script.type == "text/javascript"){
                            $env.loadInlineScript(script);
                        }
                    }
                }
            }else{
                //anonymous type and anonymous src means inline
                if(!script.src){
                    $env.loadInlineScript(script);
                }
            }
        }catch(e){
            $env.error("Error loading script.", e);
        }finally{
            if(parser){
                parser.appendFragment(docWrites.join(''));
			}
			//return document.write to it's non-script loading form
            document.write = write;
            document.writeln = writeln;
        }
    };
    
    $env.loadInlineScript = function(script){
        $env.debug("loading inline script :" + script.text);
        var tmpFile = $env.writeToTempFile(script.text, 'js') ;
        $env.info("loading " + tmpFile);
        load(tmpFile);
    };
    
})(__env__);/*
*	policy.js
*/
var __policy__ = {};
(function($policy, $env){
    
    //you can change these to $env.safeScript to avoid loading scripts
    //or change to $env.loadLocalScripts to load local scripts
    //$policy.loadScript    = $env.safeScript;
    $policy.loadScript    = $env.loadLocalScript;
    
})(__policy__, __env__);/*
 * Pure JavaScript Browser Environment
 *   By John Resig <http://ejohn.org/>
 * Copyright 2008 John Resig, under the MIT License
 */


// The Window Object
var __this__ = this;
this.__defineGetter__('window', function(){
  return __this__;
});

try{
(function($w, $env, $policy){
        /*
*	window.js
*   - this file will be wrapped in a closure providing the window object as $w
*/
// a logger or empty function available to all modules.
var $log = $env.log,
    $debug = $env.debug,
    $info = $env.info,
    $warn = $env.warn,
    $error = $env.error;
    
//The version of this application
var $version = "0.1";
//This should be hooked to git or svn or whatever
var $revision = "0.0.0.0";

//These descriptions of window properties are taken loosely David Flanagan's
//'JavaScript - The Definitive Guide' (O'Reilly)

/**> $cookies - see cookie.js <*/
// read only boolean specifies whether the window has been closed
var $closed = false;

// a read/write string that specifies the default message that appears in the status line 
var $defaultStatus = "Done";

// a read-only reference to the Document object belonging to this window
/**> $document - See document.js <*/

//IE only, refers to the most recent event object - this maybe be removed after review
var $event = null;

//A read-only array of window objects
var $frames = [];

// a read-only reference to the History object
/**>  $history - see location.js <**/

// read-only properties that specify the height and width, in pixels
var $innerHeight = 600, $innerWidth = 800;

// a read-only reference to the Location object.  the location object does expose read/write properties
/**> $location - see location.js <**/

// a read only property specifying the name of the window.  Can be set when using open()
// and may be used when specifying the target attribute of links
var $name = 'Resig Env Browser';

// a read-only reference to the Navigator object
/**> $navigator - see navigator.js <**/

// a read/write reference to the Window object that contained the script that called open() to 
//open this browser window.  This property is valid only for top-level window objects.
var $opener;

// Read-only properties that specify the total height and width, in pixels, of the browser window.
// These dimensions include the height and width of the menu bar, toolbars, scrollbars, window
// borders and so on.  These properties are not supported by IE and IE offers no alternative 
// properties;
var $outerHeight = $innerHeight, $outerWidth = $innerWidth;

// Read-only properties that specify the number of pixels that the current document has been scrolled
//to the right and down.  These are not supported by IE.
var $pageXOffset = 0, $pageYOffset = 0;

//A read-only reference to the Window object that contains this window or frame.  If the window is
// a top-level window, parent refers to the window itself.  If this window is a frame, this property
// refers to the window or frame that conatins it.
var $parent;

// a read-only refernce to the Screen object that specifies information about the screen: 
// the number of available pixels and the number of available colors.
/**> $screen - see screen.js <**/

// read only properties that specify the coordinates of the upper-left corner of the screen.
var $screenX = 0, $screenY = 0;
var $screenLeft = $screenX, $screenTop = $screenY;

// a read-only refernce to this window itself.
var $self;

// a read/write string that specifies the current contents of the status line.
var $status = '';

// a read-only reference to the top-level window that contains this window.  If this
// window is a top-level window it is simply a refernce to itself.  If this window 
// is a frame, the top property refers to the top-level window that contains the frame.
var $top;

// the window property is identical to the self property.
var $window = $w;

$debug("Initializing Window.");
__extend__($w,{
  get closed(){return $closed;},
  get defaultStatus(){return $defaultStatus;},
  set defaultStatus(_defaultStatus){$defaultStatus = _defaultStatus;},
  //get document(){return $document;}, - see document.js
  get event(){return $event;},
  get frames(){return $frames;},
  //get history(){return $history;}, - see location.js
  get innerHeight(){return $innerHeight;},
  get innerWidth(){return $innerWidth;},
  get clientHeight(){return $innerHeight;},
  get clientWidth(){return $innerWidth;},
  //get location(){return $location;}, see location.js
  get name(){return $name;},
  //get navigator(){return $navigator;}, see navigator.js
  get opener(){return $opener;},
  get outerHeight(){return $outerHeight;},
  get outerWidth(){return $outerWidth;},
  get pageXOffest(){return $pageXOffset;},
  get pageYOffset(){return $pageYOffset;},
  get parent(){return $parent;},
  //get screen(){return $screen;}, see screen.js
  get screenLeft(){return $screenLeft;},
  get screenTop(){return $screenTop;},
  get screenX(){return $screenX;},
  get screenY(){return $screenY;},
  get self(){return $self;},
  get status(){return $status;},
  set status(_status){$status = _status;},
  get top(){return $top || $window;},
  get window(){return $window;}
});

$w.open = function(url, name, features, replace){
  //TODO
};

$w.close = function(){
  //TODO
};     
  
/* Time related functions - see timer.js
*   - clearTimeout
*   - clearInterval
*   - setTimeout
*   - setInterval
*/

/*
* Events related functions - see event.js
*   - addEventListener
*   - attachEvent
*   - detachEvent
*   - removeEventListener
*   
* These functions are identical to the Element equivalents.
*/

/*
* UIEvents related functions - see uievent.js
*   - blur
*   - focus
*
* These functions are identical to the Element equivalents.
*/

/* Dialog related functions - see dialog.js
*   - alert
*   - confirm
*   - prompt
*/

/* Screen related functions - see screen.js
*   - moveBy
*   - moveTo
*   - print
*   - resizeBy
*   - resizeTo
*   - scrollBy
*   - scrollTo
*/

/* CSS related functions - see css.js
*   - getComputedStyle
*/

/*
* Shared utility methods
*/
// Helper method for extending one object with another.  
function __extend__(a,b) {
	for ( var i in b ) {
		var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
		if ( g || s ) {
			if ( g ) a.__defineGetter__(i, g);
			if ( s ) a.__defineSetter__(i, s);
		} else
			a[i] = b[i];
	} return a;
};
	

// from ariel flesler http://flesler.blogspot.com/2008/11/fast-trim-function-for-javascript.html
// this might be a good utility function to provide in the env.core
// as in might be useful to the parser and other areas as well
function trim( str ){
    return (str || "").replace( /^\s+|\s+$/g, "" );
    
};
/*function trim( str ){
    var start = -1,
    end = str.length;
    /*jsl:ignore*
    while( str.charCodeAt(--end) < 33 );
    while( str.charCodeAt(++start) < 33 );
    /*jsl:end*
    return str.slice( start, end + 1 );
};*/

//from jQuery
function __setArray__( target, array ) {
	// Resetting the length to 0, then using the native Array push
	// is a super-fast way to populate an object with array-like properties
	target.length = 0;
	Array.prototype.push.apply( target, array );
};
$debug("Defining NodeList");
/*
* NodeList - DOM Level 2
*/
$w.__defineGetter__('NodeList', function(){
  return function(){
    throw new Error("Object cannot be created in this context");
  };
});


/**
 * @class  DOMNodeList - provides the abstraction of an ordered collection of nodes
 *
 * @author Jon van Noort (jon@webarcana.com.au)
 *
 * @param  ownerDocument : DOMDocument - the ownerDocument
 * @param  parentNode    : DOMNode - the node that the DOMNodeList is attached to (or null)
 */
var DOMNodeList = function(ownerDocument, parentNode) {
    this.length = 0;
    this.parentNode = parentNode;
    this.ownerDocument = ownerDocument;
    
    this._readonly = false;
    
    __setArray__(this, []);
};
__extend__(DOMNodeList.prototype, {
    item : function(index) {
        var ret = null;
        //$log("NodeList item("+index+") = " + this[index]);
        if ((index >= 0) && (index < this.length)) { // bounds check
            ret = this[index];                    // return selected Node
        }
        
        return ret;                                    // if the index is out of bounds, default value null is returned
    },
    get xml() {
        var ret = "";
        
        // create string containing the concatenation of the string values of each child
        for (var i=0; i < this.length; i++) {
            if(this[i]){
                if(this[i].nodeType == DOMNode.TEXT_NODE && i>0 && this[i-1].nodeType == DOMNode.TEXT_NODE){
                    //add a single space between adjacent text nodes
                    ret += " "+this[i].xml;
                }else{
                    ret += this[i].xml;
                }
            }
        }
        
        return ret;
    },
    toArray: function () {
        var children = [];
        for ( var i=0; i < this.length; i++) {
                children.push (this[i]);
        }
        return children;
    },
    toString: function(){
      return "[ "+(this.length > 0?Array.prototype.join.apply(this, [", "]):"Empty NodeList")+" ]";
    }
});


/**
 * @method DOMNodeList._findItemIndex - find the item index of the node with the specified internal id
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  id : int - unique internal id
 * @return : int
 */
var __findItemIndex__ = function (nodelist, id) {
  var ret = -1;

  // test that id is valid
  if (id > -1) {
    for (var i=0; i<nodelist.length; i++) {
      // compare id to each node's _id
      if (nodelist[i]._id == id) {            // found it!
        ret = i;
        break;
      }
    }
  }

  return ret;                                    // if node is not found, default value -1 is returned
};

/**
 * @method DOMNodeList._insertBefore - insert the specified Node into the NodeList before the specified index
 *   Used by DOMNode.insertBefore(). Note: DOMNode.insertBefore() is responsible for Node Pointer surgery
 *   DOMNodeList._insertBefore() simply modifies the internal data structure (Array).
 *
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  newChild      : DOMNode - the Node to be inserted
 * @param  refChildIndex : int     - the array index to insert the Node before
 */
var __insertBefore__ = function(nodelist, newChild, refChildIndex) {
    if ((refChildIndex >= 0) && (refChildIndex < nodelist.length)) { // bounds check
        
        if (newChild.nodeType == DOMNode.DOCUMENT_FRAGMENT_NODE) {  // node is a DocumentFragment
            // append the children of DocumentFragment
            Array.prototype.splice.apply(nodelist,[refChildIndex, 0].concat(newChild.childNodes.toArray()));
        }
        else {
            // append the newChild
            Array.prototype.splice.apply(nodelist,[refChildIndex, 0, newChild]);
        }
    }
};

/**
 * @method DOMNodeList._replaceChild - replace the specified Node in the NodeList at the specified index
 *   Used by DOMNode.replaceChild(). Note: DOMNode.replaceChild() is responsible for Node Pointer surgery
 *   DOMNodeList._replaceChild() simply modifies the internal data structure (Array).
 *
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  newChild      : DOMNode - the Node to be inserted
 * @param  refChildIndex : int     - the array index to hold the Node
 */
var __replaceChild__ = function(nodelist, newChild, refChildIndex) {
    var ret = null;
    
    if ((refChildIndex >= 0) && (refChildIndex < nodelist.length)) { // bounds check
        ret = nodelist[refChildIndex];            // preserve old child for return
    
        if (newChild.nodeType == DOMNode.DOCUMENT_FRAGMENT_NODE) {  // node is a DocumentFragment
            // get array containing children prior to refChild
            Array.prototype.splice.apply(nodelist,[refChildIndex, 1].concat(newChild.childNodes.toArray()));
        }
        else {
            // simply replace node in array (links between Nodes are made at higher level)
            nodelist[refChildIndex] = newChild;
        }
    }
    
    return ret;                                   // return replaced node
};

/**
 * @method DOMNodeList._removeChild - remove the specified Node in the NodeList at the specified index
 *   Used by DOMNode.removeChild(). Note: DOMNode.removeChild() is responsible for Node Pointer surgery
 *   DOMNodeList._replaceChild() simply modifies the internal data structure (Array).
 *
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  refChildIndex : int - the array index holding the Node to be removed
 */
var __removeChild__ = function(nodelist, refChildIndex) {
    var ret = null;
    
    if (refChildIndex > -1) {                              // found it!
        ret = nodelist[refChildIndex];                    // return removed node
        
        // rebuild array without removed child
        Array.prototype.splice.apply(nodelist,[refChildIndex, 1]);
    }
    
    return ret;                                   // return removed node
};

/**
 * @method DOMNodeList._appendChild - append the specified Node to the NodeList
 *   Used by DOMNode.appendChild(). Note: DOMNode.appendChild() is responsible for Node Pointer surgery
 *   DOMNodeList._appendChild() simply modifies the internal data structure (Array).
 *
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  newChild      : DOMNode - the Node to be inserted
 */
var __appendChild__ = function(nodelist, newChild) {
    if (newChild.nodeType == DOMNode.DOCUMENT_FRAGMENT_NODE) {  // node is a DocumentFragment
        // append the children of DocumentFragment
         Array.prototype.push.apply(nodelist, newChild.childNodes.toArray() );
    } else {
        // simply add node to array (links between Nodes are made at higher level)
        Array.prototype.push.apply(nodelist, [newChild]);
    }
    
};

/**
 * @method DOMNodeList._cloneNodes - Returns a NodeList containing clones of the Nodes in this NodeList
 *
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  deep : boolean - If true, recursively clone the subtree under each of the nodes;
 *   if false, clone only the nodes themselves (and their attributes, if it is an Element).
 * @param  parentNode : DOMNode - the new parent of the cloned NodeList
 * @return : DOMNodeList - NodeList containing clones of the Nodes in this NodeList
 */
var __cloneNodes__ = function(nodelist, deep, parentNode) {
    var cloneNodeList = new DOMNodeList(nodelist.ownerDocument, parentNode);
    
    // create list containing clones of each child
    for (var i=0; i < nodelist.length; i++) {
        __appendChild__(cloneNodeList, nodelist[i].cloneNode(deep));
    }
    
    return cloneNodeList;
};


/**
 * @class  DOMNamedNodeMap - used to represent collections of nodes that can be accessed by name
 *  typically a set of Element attributes
 *
 * @extends DOMNodeList - note W3C spec says that this is not the case,
 *   but we need an item() method identicle to DOMNodeList's, so why not?
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  ownerDocument : DOMDocument - the ownerDocument
 * @param  parentNode    : DOMNode - the node that the DOMNamedNodeMap is attached to (or null)
 */
var DOMNamedNodeMap = function(ownerDocument, parentNode) {
    //$log("\t\tcreating dom namednodemap");
    this.DOMNodeList = DOMNodeList;
    this.DOMNodeList(ownerDocument, parentNode);
    __setArray__(this, []);
};
DOMNamedNodeMap.prototype = new DOMNodeList;
__extend__(DOMNamedNodeMap.prototype, {
    getNamedItem : function(name) {
        var ret = null;
        
        // test that Named Node exists
        var itemIndex = __findNamedItemIndex__(this, name);
        
        if (itemIndex > -1) {                          // found it!
            ret = this[itemIndex];                // return NamedNode
        }
        
        return ret;                                    // if node is not found, default value null is returned
    },
    setNamedItem : function(arg) {
      // test for exceptions
      if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if arg was not created by this Document
            if (this.ownerDocument != arg.ownerDocument) {
              throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }
        
            // throw Exception if DOMNamedNodeMap is readonly
            if (this._readonly || (this.parentNode && this.parentNode._readonly)) {
              throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }
        
            // throw Exception if arg is already an attribute of another Element object
            if (arg.ownerElement && (arg.ownerElement != this.parentNode)) {
              throw(new DOMException(DOMException.INUSE_ATTRIBUTE_ERR));
            }
      }
    
      // get item index
      var itemIndex = __findNamedItemIndex__(this, arg.name);
      var ret = null;
    
      if (itemIndex > -1) {                          // found it!
            ret = this[itemIndex];                // use existing Attribute
        
            // throw Exception if DOMAttr is readonly
            if (__ownerDocument__(this).implementation.errorChecking && ret._readonly) {
              throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            } else {
              this[itemIndex] = arg;                // over-write existing NamedNode
              this[arg.name] = arg;
            }
      } else {
            // add new NamedNode
            Array.prototype.push.apply(this, [arg]);
            this[arg.name] = arg;
      }
    
      arg.ownerElement = this.parentNode;            // update ownerElement
    
      return ret;                                    // return old node or null
    },
    removeNamedItem : function(name) {
          var ret = null;
          // test for exceptions
          // throw Exception if DOMNamedNodeMap is readonly
          if (__ownerDocument__(this).implementation.errorChecking && 
                (this._readonly || (this.parentNode && this.parentNode._readonly))) {
              throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
          }
        
          // get item index
          var itemIndex = __findNamedItemIndex__(this, name);
        
          // throw Exception if there is no node named name in this map
          if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
            throw(new DOMException(DOMException.NOT_FOUND_ERR));
          }
        
          // get Node
          var oldNode = this[itemIndex];
          //this[oldNode.name] = undefined;
        
          // throw Exception if Node is readonly
          if (__ownerDocument__(this).implementation.errorChecking && oldNode._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
          }
        
          // return removed node
          return __removeChild__(this, itemIndex);
    },
    getNamedItemNS : function(namespaceURI, localName) {
          var ret = null;
        
          // test that Named Node exists
          var itemIndex = __findNamedItemNSIndex__(this, namespaceURI, localName);
        
          if (itemIndex > -1) {                          // found it!
            ret = this[itemIndex];                // return NamedNode
          }
        
          return ret;                                    // if node is not found, default value null is returned
    },
    setNamedItemNS : function(arg) {
          // test for exceptions
          if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if DOMNamedNodeMap is readonly
            if (this._readonly || (this.parentNode && this.parentNode._readonly)) {
              throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }
        
            // throw Exception if arg was not created by this Document
            if (__ownerDocument__(this) != __ownerDocument__(arg)) {
              throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }
        
            // throw Exception if arg is already an attribute of another Element object
            if (arg.ownerElement && (arg.ownerElement != this.parentNode)) {
              throw(new DOMException(DOMException.INUSE_ATTRIBUTE_ERR));
            }
          }
        
          // get item index
          var itemIndex = __findNamedItemNSIndex__(this, arg.namespaceURI, arg.localName);
          var ret = null;
        
          if (itemIndex > -1) {                          // found it!
            ret = this[itemIndex];                // use existing Attribute
            // throw Exception if DOMAttr is readonly
            if (__ownerDocument__(this).implementation.errorChecking && ret._readonly) {
              throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            } else {
              this[itemIndex] = arg;                // over-write existing NamedNode
            }
          }else {
            // add new NamedNode
            Array.prototype.push.apply(this, [arg]);
          }
          arg.ownerElement = this.parentNode;
        
        
          return ret;                                    // return old node or null
    },
    removeNamedItemNS : function(namespaceURI, localName) {
          var ret = null;
        
          // test for exceptions
          // throw Exception if DOMNamedNodeMap is readonly
          if (__ownerDocument__(this).implementation.errorChecking && (this._readonly || (this.parentNode && this.parentNode._readonly))) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
          }
        
          // get item index
          var itemIndex = __findNamedItemNSIndex__(this, namespaceURI, localName);
        
          // throw Exception if there is no matching node in this map
          if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
            throw(new DOMException(DOMException.NOT_FOUND_ERR));
          }
        
          // get Node
          var oldNode = this[itemIndex];
        
          // throw Exception if Node is readonly
          if (__ownerDocument__(this).implementation.errorChecking && oldNode._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
          }
        
          return __removeChild__(this, itemIndex);             // return removed node
    },
    get xml() {
          var ret = "";
        
          // create string containing concatenation of all (but last) Attribute string values (separated by spaces)
          for (var i=0; i < this.length -1; i++) {
            ret += this[i].xml +" ";
          }
        
          // add last Attribute to string (without trailing space)
          if (this.length > 0) {
            ret += this[this.length -1].xml;
          }
        
          return ret;
    }

});

/**
 * @method DOMNamedNodeMap._findNamedItemIndex - find the item index of the node with the specified name
 *
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  name : string - the name of the required node
 * @param  isnsmap : if its a DOMNamespaceNodeMap
 * @return : int
 */
var __findNamedItemIndex__ = function(namednodemap, name, isnsmap) {
  var ret = -1;

  // loop through all nodes
  for (var i=0; i<namednodemap.length; i++) {
    // compare name to each node's nodeName
    if(isnsmap){
        if (namednodemap[i].localName == localName) {         // found it!
          ret = i;
          break;
        }
    }else{
        if (namednodemap[i].name == name) {         // found it!
          ret = i;
          break;
        }
    }
  }

  return ret;                                    // if node is not found, default value -1 is returned
};

/**
 * @method DOMNamedNodeMap._findNamedItemNSIndex - find the item index of the node with the specified namespaceURI and localName
 *
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  namespaceURI : string - the namespace URI of the required node
 * @param  localName    : string - the local name of the required node
 * @return : int
 */
var __findNamedItemNSIndex__ = function(namednodemap, namespaceURI, localName) {
  var ret = -1;

  // test that localName is not null
  if (localName) {
    // loop through all nodes
    for (var i=0; i<namednodemap.length; i++) {
      // compare name to each node's namespaceURI and localName
      if ((namednodemap[i].namespaceURI == namespaceURI) && (namednodemap[i].localName == localName)) {
        ret = i;                                 // found it!
        break;
      }
    }
  }

  return ret;                                    // if node is not found, default value -1 is returned
};

/**
 * @method DOMNamedNodeMap._hasAttribute - Returns true if specified node exists
 *
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  name : string - the name of the required node
 * @return : boolean
 */
var __hasAttribute__ = function(namednodemap, name) {
  var ret = false;

  // test that Named Node exists
  var itemIndex = __findNamedItemIndex__(namednodemap, name);

  if (itemIndex > -1) {                          // found it!
    ret = true;                                  // return true
  }

  return ret;                                    // if node is not found, default value false is returned
}

/**
 * @method DOMNamedNodeMap._hasAttributeNS - Returns true if specified node exists
 *
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  namespaceURI : string - the namespace URI of the required node
 * @param  localName    : string - the local name of the required node
 * @return : boolean
 */
var __hasAttributeNS__ = function(namednodemap, namespaceURI, localName) {
  var ret = false;

  // test that Named Node exists
  var itemIndex = __findNamedItemNSIndex__(namednodemap, namespaceURI, localName);

  if (itemIndex > -1) {                          // found it!
    ret = true;                                  // return true
  }

  return ret;                                    // if node is not found, default value false is returned
}

/**
 * @method DOMNamedNodeMap._cloneNodes - Returns a NamedNodeMap containing clones of the Nodes in this NamedNodeMap
 *
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  parentNode : DOMNode - the new parent of the cloned NodeList
 * @param  isnsmap : bool - is this a DOMNamespaceNodeMap
 * @return : DOMNamedNodeMap - NamedNodeMap containing clones of the Nodes in this DOMNamedNodeMap
 */
var __cloneNamedNodes__ = function(namednodemap, parentNode, isnsmap) {
  var cloneNamedNodeMap = isnsmap?
    new DOMNamespaceNodeMap(namednodemap.ownerDocument, parentNode):
    new DOMNamedNodeMap(namednodemap.ownerDocument, parentNode);

  // create list containing clones of all children
  for (var i=0; i < namednodemap.length; i++) {
      $debug("cloning node in named node map :" + namednodemap[i]);
    __appendChild__(cloneNamedNodeMap, namednodemap[i].cloneNode(false));
  }

  return cloneNamedNodeMap;
};


/**
 * @class  DOMNamespaceNodeMap - used to represent collections of namespace nodes that can be accessed by name
 *  typically a set of Element attributes
 *
 * @extends DOMNamedNodeMap
 *
 * @author Jon van Noort (jon@webarcana.com.au)
 *
 * @param  ownerDocument : DOMDocument - the ownerDocument
 * @param  parentNode    : DOMNode - the node that the DOMNamespaceNodeMap is attached to (or null)
 */
var DOMNamespaceNodeMap = function(ownerDocument, parentNode) {
    //$log("\t\t\tcreating dom namespacednodemap");
    this.DOMNamedNodeMap = DOMNamedNodeMap;
    this.DOMNamedNodeMap(ownerDocument, parentNode);
    __setArray__(this, []);
};
DOMNamespaceNodeMap.prototype = new DOMNamedNodeMap;
__extend__(DOMNamespaceNodeMap.prototype, {
    get xml() {
          var ret = "";
        
          // identify namespaces declared local to this Element (ie, not inherited)
          for (var ind = 0; ind < this.length; ind++) {
            // if namespace declaration does not exist in the containing node's, parentNode's namespaces
            var ns = null;
            try {
                var ns = this.parentNode.parentNode._namespaces.
                    getNamedItem(this[ind].localName);
            }
            catch (e) {
                //breaking to prevent default namespace being inserted into return value
                break;
            }
            if (!(ns && (""+ ns.nodeValue == ""+ this[ind].nodeValue))) {
              // display the namespace declaration
              ret += this[ind].xml +" ";
            }
          }
        
          return ret;
    }
});
$debug("Defining Node");
/*
* Node - DOM Level 2
*/	
$w.__defineGetter__('Node', function(){
  return __extend__(function(){
        throw new Error("Object cannot be created in this context");
      } , {
  		ELEMENT_NODE    :1,
  		ATTRIBUTE_NODE  :2,
  		TEXT_NODE       :3,
  		CDATA_SECTION_NODE: 4,
  		PROCESSING_INSTRUCTION_NODE: 7,
  		COMMENT_NODE: 8,
  		DOCUMENT_NODE: 9,
  		DOCUMENT_TYPE_NODE: 10,
  		DOCUMENT_FRAGMENT_NODE: 11
	});
});

/**
 * @class  DOMNode - The Node interface is the primary datatype for the entire Document Object Model.
 *   It represents a single node in the document tree.
 * @author Jon van Noort (jon@webarcana.com.au), David Joham (djoham@yahoo.com) and Scott Severtson
 * @param  ownerDocument : DOMDocument - The Document object associated with this node.
 */
var DOMNode = function(ownerDocument) {
  if (ownerDocument) {
    this._id = ownerDocument._genId();           // generate unique internal id
  }
  
  this.namespaceURI = "";                        // The namespace URI of this node (Level 2)
  this.prefix       = "";                        // The namespace prefix of this node (Level 2)
  this.localName    = "";                        // The localName of this node (Level 2)

  this.nodeName = "";                            // The name of this node
  this.nodeValue = "";                           // The value of this node
  this.className = "";                           // The CSS class name of this node.
  
  // The parent of this node. All nodes, except Document, DocumentFragment, and Attr may have a parent.
  // However, if a node has just been created and not yet added to the tree, or if it has been removed from the tree, this is null
  this.parentNode      = null;

  // A NodeList that contains all children of this node. If there are no children, this is a NodeList containing no nodes.
  // The content of the returned NodeList is "live" in the sense that, for instance, changes to the children of the node object
  // that it was created from are immediately reflected in the nodes returned by the NodeList accessors;
  // it is not a static snapshot of the content of the node. This is true for every NodeList, including the ones returned by the getElementsByTagName method.
  this.childNodes      = new DOMNodeList(ownerDocument, this);

  this.firstChild      = null;                   // The first child of this node. If there is no such node, this is null
  this.lastChild       = null;                   // The last child of this node. If there is no such node, this is null.
  this.previousSibling = null;                   // The node immediately preceding this node. If there is no such node, this is null.
  this.nextSibling     = null;                   // The node immediately following this node. If there is no such node, this is null.

  this.ownerDocument   = ownerDocument;          // The Document object associated with this node
  this.attributes = new DOMNamedNodeMap(this.ownerDocument, this);
  this._namespaces = new DOMNamespaceNodeMap(ownerDocument, this);  // The namespaces in scope for this node
  this._readonly = false;
};

// nodeType constants
DOMNode.ELEMENT_NODE                = 1;
DOMNode.ATTRIBUTE_NODE              = 2;
DOMNode.TEXT_NODE                   = 3;
DOMNode.CDATA_SECTION_NODE          = 4;
DOMNode.ENTITY_REFERENCE_NODE       = 5;
DOMNode.ENTITY_NODE                 = 6;
DOMNode.PROCESSING_INSTRUCTION_NODE = 7;
DOMNode.COMMENT_NODE                = 8;
DOMNode.DOCUMENT_NODE               = 9;
DOMNode.DOCUMENT_TYPE_NODE          = 10;
DOMNode.DOCUMENT_FRAGMENT_NODE      = 11;
DOMNode.NOTATION_NODE               = 12;
DOMNode.NAMESPACE_NODE              = 13;

__extend__(DOMNode.prototype, {
    hasAttributes : function() {
        if (this.attributes.length == 0) {
            return false;
        }else{
            return true;
        }
    },
    insertBefore : function(newChild, refChild) {
        var prevNode;
        
        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if DOMNode is readonly
            if (this._readonly) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }
            
            // throw Exception if newChild was not created by this Document
            if (__ownerDocument__(this) != __ownerDocument__(newChild)) {
                throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }
            
            // throw Exception if the node is an ancestor
            if (__isAncestor__(this, newChild)) {
                throw(new DOMException(DOMException.HIERARCHY_REQUEST_ERR));
            }
        }
        
        if (refChild) {                                // if refChild is specified, insert before it
            // find index of refChild
            var itemIndex = __findItemIndex__(this.childNodes, refChild._id);
            
            // throw Exception if there is no child node with this id
            if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
              throw(new DOMException(DOMException.NOT_FOUND_ERR));
            }
            
            // if the newChild is already in the tree,
            var newChildParent = newChild.parentNode;
            if (newChildParent) {
              // remove it
              newChildParent.removeChild(newChild);
            }
            
            // insert newChild into childNodes
            __insertBefore__(this.childNodes, newChild, 
                __findItemIndex__(this.childNodes, refChild._id));
            
            // do node pointer surgery
            prevNode = refChild.previousSibling;
            
            // handle DocumentFragment
            if (newChild.nodeType == DOMNode.DOCUMENT_FRAGMENT_NODE) {
              if (newChild.childNodes.length > 0) {
                // set the parentNode of DocumentFragment's children
                for (var ind = 0; ind < newChild.childNodes.length; ind++) {
                  newChild.childNodes[ind].parentNode = this;
                }
            
                // link refChild to last child of DocumentFragment
                refChild.previousSibling = newChild.childNodes[newChild.childNodes.length-1];
              }
            }else {
                newChild.parentNode = this;                // set the parentNode of the newChild
                refChild.previousSibling = newChild;       // link refChild to newChild
            }
        }else {                                         // otherwise, append to end
            prevNode = this.lastChild;
            this.appendChild(newChild);
        }
        
        if (newChild.nodeType == DOMNode.DOCUMENT_FRAGMENT_NODE) {
            // do node pointer surgery for DocumentFragment
            if (newChild.childNodes.length > 0) {
                if (prevNode) {  
                    prevNode.nextSibling = newChild.childNodes[0];
                }else {                                         // this is the first child in the list
                    this.firstChild = newChild.childNodes[0];
                }
            
                newChild.childNodes[0].previousSibling = prevNode;
                newChild.childNodes[newChild.childNodes.length-1].nextSibling = refChild;
            }
        }else {
            // do node pointer surgery for newChild
            if (prevNode) {
              prevNode.nextSibling = newChild;
            }else {                                         // this is the first child in the list
              this.firstChild = newChild;
            }
            
            newChild.previousSibling = prevNode;
            newChild.nextSibling     = refChild;
        }
        
        return newChild;
    },
    replaceChild : function(newChild, oldChild) {
        var ret = null;
        
        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if DOMNode is readonly
            if (this._readonly) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }
        
            // throw Exception if newChild was not created by this Document
            if (__ownerDocument__(this) != __ownerDocument__(newChild)) {
                throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }
        
            // throw Exception if the node is an ancestor
            if (__isAncestor__(this, newChild)) {
                throw(new DOMException(DOMException.HIERARCHY_REQUEST_ERR));
            }
        }
        
        // get index of oldChild
        var index = __findItemIndex__(this.childNodes, oldChild._id);
        
        // throw Exception if there is no child node with this id
        if (__ownerDocument__(this).implementation.errorChecking && (index < 0)) {
            throw(new DOMException(DOMException.NOT_FOUND_ERR));
        }
        
        // if the newChild is already in the tree,
        var newChildParent = newChild.parentNode;
        if (newChildParent) {
            // remove it
            newChildParent.removeChild(newChild);
        }
        
        // add newChild to childNodes
        ret = __replaceChild__(this.childNodes,newChild, index);
        
        
        if (newChild.nodeType == DOMNode.DOCUMENT_FRAGMENT_NODE) {
            // do node pointer surgery for Document Fragment
            if (newChild.childNodes.length > 0) {
                for (var ind = 0; ind < newChild.childNodes.length; ind++) {
                    newChild.childNodes[ind].parentNode = this;
                }
                
                if (oldChild.previousSibling) {
                    oldChild.previousSibling.nextSibling = newChild.childNodes[0];
                } else {
                    this.firstChild = newChild.childNodes[0];
                }
                
                if (oldChild.nextSibling) {
                    oldChild.nextSibling.previousSibling = newChild;
                } else {
                    this.lastChild = newChild.childNodes[newChild.childNodes.length-1];
                }
                
                newChild.childNodes[0].previousSibling = oldChild.previousSibling;
                newChild.childNodes[newChild.childNodes.length-1].nextSibling = oldChild.nextSibling;
            }
        } else {
            // do node pointer surgery for newChild
            newChild.parentNode = this;
            
            if (oldChild.previousSibling) {
                oldChild.previousSibling.nextSibling = newChild;
            }else{
                this.firstChild = newChild;
            }
            if (oldChild.nextSibling) {
                oldChild.nextSibling.previousSibling = newChild;
            }else{
                this.lastChild = newChild;
            }
            newChild.previousSibling = oldChild.previousSibling;
            newChild.nextSibling = oldChild.nextSibling;
        }
        return ret;
    },
    removeChild : function(oldChild) {
        // throw Exception if DOMNamedNodeMap is readonly
        if (__ownerDocument__(this).implementation.errorChecking && (this._readonly || oldChild._readonly)) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }
        
        // get index of oldChild
        var itemIndex = __findItemIndex__(this.childNodes, oldChild._id);
        
        // throw Exception if there is no child node with this id
        if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
            throw(new DOMException(DOMException.NOT_FOUND_ERR));
        }
        
        // remove oldChild from childNodes
        __removeChild__(this.childNodes, itemIndex);
        
        // do node pointer surgery
        oldChild.parentNode = null;
        
        if (oldChild.previousSibling) {
            oldChild.previousSibling.nextSibling = oldChild.nextSibling;
        }else {
            this.firstChild = oldChild.nextSibling;
        }
        if (oldChild.nextSibling) {
            oldChild.nextSibling.previousSibling = oldChild.previousSibling;
        }else {
            this.lastChild = oldChild.previousSibling;
        }
        
        oldChild.previousSibling = null;
        oldChild.nextSibling = null;
        
        return oldChild;
    },
    appendChild : function(newChild) {
      // test for exceptions
      if (__ownerDocument__(this).implementation.errorChecking) {
        // throw Exception if Node is readonly
        if (this._readonly) {
          throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }
    
        // throw Exception if arg was not created by this Document
        if (__ownerDocument__(this) != __ownerDocument__(this)) {
          throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
        }
    
        // throw Exception if the node is an ancestor
        if (__isAncestor__(this, newChild)) {
          throw(new DOMException(DOMException.HIERARCHY_REQUEST_ERR));
        }
      }
    
      // if the newChild is already in the tree,
      var newChildParent = newChild.parentNode;
      if (newChildParent) {
        // remove it
        newChildParent.removeChild(newChild);
      }
    
      // add newChild to childNodes
      __appendChild__(this.childNodes, newChild);
    
      if (newChild.nodeType == DOMNode.DOCUMENT_FRAGMENT_NODE) {
        // do node pointer surgery for DocumentFragment
        if (newChild.childNodes.length > 0) {
          for (var ind = 0; ind < newChild.childNodes.length; ind++) {
            newChild.childNodes[ind].parentNode = this;
          }
    
          if (this.lastChild) {
            this.lastChild.nextSibling = newChild.childNodes[0];
            newChild.childNodes[0].previousSibling = this.lastChild;
            this.lastChild = newChild.childNodes[newChild.childNodes.length-1];
          }
          else {
            this.lastChild = newChild.childNodes[newChild.childNodes.length-1];
            this.firstChild = newChild.childNodes[0];
          }
        }
      }
      else {
        // do node pointer surgery for newChild
        newChild.parentNode = this;
        if (this.lastChild) {
          this.lastChild.nextSibling = newChild;
          newChild.previousSibling = this.lastChild;
          this.lastChild = newChild;
        }
        else {
          this.lastChild = newChild;
          this.firstChild = newChild;
        }
      }
      
      return newChild;
    },
    hasChildNodes : function() {
        return (this.childNodes.length > 0);
    },
    cloneNode: function(deep) {
        // use importNode to clone this Node
        //do not throw any exceptions
        try {
            return __ownerDocument__(this).importNode(this, deep);
        } catch (e) {
            //there shouldn't be any exceptions, but if there are, return null
            return null;
        }
    },
    normalize : function() {
        var inode;
        var nodesToRemove = new DOMNodeList();
        
        if (this.nodeType == DOMNode.ELEMENT_NODE || this.nodeType == DOMNode.DOCUMENT_NODE) {
            var adjacentTextNode = null;
        
            // loop through all childNodes
            for(var i = 0; i < this.childNodes.length; i++) {
                inode = this.childNodes.item(i);
            
                if (inode.nodeType == DOMNode.TEXT_NODE) { // this node is a text node
                    if (inode.length < 1) {                  // this text node is empty
                        __appendChild__(nodesToRemove, inode);      // add this node to the list of nodes to be remove
                    }else {
                        if (adjacentTextNode) {                // if previous node was also text
                            adjacentTextNode.appendData(inode.data);     // merge the data in adjacent text nodes
                            __appendChild__(nodesToRemove, inode);    // add this node to the list of nodes to be removed
                        }else {
                            adjacentTextNode = inode;              // remember this node for next cycle
                        }
                    }
                } else {
                    adjacentTextNode = null;                 // (soon to be) previous node is not a text node
                    inode.normalize();                       // normalise non Text childNodes
                }
            }
                
            // remove redundant Text Nodes
            for(var i = 0; i < nodesToRemove.length; i++) {
                inode = nodesToRemove.item(i);
                inode.parentNode.removeChild(inode);
            }
        }
    },
    isSupported : function(feature, version) {
        // use Implementation.hasFeature to determin if this feature is supported
        return __ownerDocument__(this).implementation.hasFeature(feature, version);
    },
    getElementsByTagName : function(tagname) {
        // delegate to _getElementsByTagNameRecursive
        // recurse childNodes
        var nodelist = new DOMNodeList(__ownerDocument__(this));
        for(var i = 0; i < this.childNodes.length; i++) {
            nodeList = __getElementsByTagNameRecursive__(this.childNodes.item(i), tagname, nodelist);
        }
        return nodelist;
    },
    getElementsByTagNameNS : function(namespaceURI, localName) {
        // delegate to _getElementsByTagNameNSRecursive
        return __getElementsByTagNameNSRecursive__(this, namespaceURI, localName, 
            new DOMNodeList(__ownerDocument__(this)));
    },
    importNode : function(importedNode, deep) {
        
        var importNode;
        //$debug("importing node " + importedNode.nodeName + "(?deep = "+deep+")");
        //there is no need to perform namespace checks since everything has already gone through them
        //in order to have gotten into the DOM in the first place. The following line
        //turns namespace checking off in ._isValidNamespace
        __ownerDocument__(this)._performingImportNodeOperation = true;
        
            if (importedNode.nodeType == DOMNode.ELEMENT_NODE) {
                if (!__ownerDocument__(this).implementation.namespaceAware) {
                    // create a local Element (with the name of the importedNode)
                    importNode = __ownerDocument__(this).createElement(importedNode.tagName);
                
                    // create attributes matching those of the importedNode
                    for(var i = 0; i < importedNode.attributes.length; i++) {
                        importNode.setAttribute(importedNode.attributes.item(i).name, importedNode.attributes.item(i).value);
                    }
                }else {
                    // create a local Element (with the name & namespaceURI of the importedNode)
                    importNode = __ownerDocument__(this).createElementNS(importedNode.namespaceURI, importedNode.nodeName);
                
                    // create attributes matching those of the importedNode
                    for(var i = 0; i < importedNode.attributes.length; i++) {
                        importNode.setAttributeNS(importedNode.attributes.item(i).namespaceURI, 
                            importedNode.attributes.item(i).name, importedNode.attributes.item(i).value);
                    }
                
                    // create namespace definitions matching those of the importedNode
                    for(var i = 0; i < importedNode._namespaces.length; i++) {
                        importNode._namespaces[i] = __ownerDocument__(this).createNamespace(importedNode._namespaces.item(i).localName);
                        importNode._namespaces[i].value = importedNode._namespaces.item(i).value;
                    }
                }
            } else if (importedNode.nodeType == DOMNode.ATTRIBUTE_NODE) {
                if (!__ownerDocument__(this).implementation.namespaceAware) {
                    // create a local Attribute (with the name of the importedAttribute)
                    importNode = __ownerDocument__(this).createAttribute(importedNode.name);
                } else {
                    // create a local Attribute (with the name & namespaceURI of the importedAttribute)
                    importNode = __ownerDocument__(this).createAttributeNS(importedNode.namespaceURI, importedNode.nodeName);
                
                    // create namespace definitions matching those of the importedAttribute
                    for(var i = 0; i < importedNode._namespaces.length; i++) {
                        importNode._namespaces[i] = __ownerDocument__(this).createNamespace(importedNode._namespaces.item(i).localName);
                        importNode._namespaces[i].value = importedNode._namespaces.item(i).value;
                    }
                }
            
                // set the value of the local Attribute to match that of the importedAttribute
                importNode.value = importedNode.value;
                
            } else if (importedNode.nodeType == DOMNode.DOCUMENT_FRAGMENT) {
                // create a local DocumentFragment
                importNode = __ownerDocument__(this).createDocumentFragment();
            } else if (importedNode.nodeType == DOMNode.NAMESPACE_NODE) {
                // create a local NamespaceNode (with the same name & value as the importedNode)
                importNode = __ownerDocument__(this).createNamespace(importedNode.nodeName);
                importNode.value = importedNode.value;
            } else if (importedNode.nodeType == DOMNode.TEXT_NODE) {
                // create a local TextNode (with the same data as the importedNode)
                importNode = __ownerDocument__(this).createTextNode(importedNode.data);
            } else if (importedNode.nodeType == DOMNode.CDATA_SECTION_NODE) {
                // create a local CDATANode (with the same data as the importedNode)
                importNode = __ownerDocument__(this).createCDATASection(importedNode.data);
            } else if (importedNode.nodeType == DOMNode.PROCESSING_INSTRUCTION_NODE) {
                // create a local ProcessingInstruction (with the same target & data as the importedNode)
                importNode = __ownerDocument__(this).createProcessingInstruction(importedNode.target, importedNode.data);
            } else if (importedNode.nodeType == DOMNode.COMMENT_NODE) {
                // create a local Comment (with the same data as the importedNode)
                importNode = __ownerDocument__(this).createComment(importedNode.data);
            } else {  // throw Exception if nodeType is not supported
                throw(new DOMException(DOMException.NOT_SUPPORTED_ERR));
            }
            
            if (deep) {                                    // recurse childNodes
                for(var i = 0; i < importedNode.childNodes.length; i++) {
                    importNode.appendChild(__ownerDocument__(this).importNode(importedNode.childNodes.item(i), true));
                }
            }
            
            //reset _performingImportNodeOperation
            __ownerDocument__(this)._performingImportNodeOperation = false;
            return importNode;
        
    },
    contains : function(node){
            while(node && node != this ){
                node = node.parentNode;
            }
            return !!node;
    },
    compareDocumentPosition : function(b){
        var a = this;
        var number = (a != b && a.contains(b) && 16) + (a != b && b.contains(a) && 8);
        //find position of both
        var all = document.getElementsByTagName("*");
        var my_location = 0, node_location = 0;
        for(var i=0; i < all.length; i++){
            if(all[i] == a) my_location = i;
            if(all[i] == b) node_location = i;
            if(my_location && node_location) break;
        }
        number += (my_location < node_location && 4)
        number += (my_location > node_location && 2)
        return number;
    } 

});

/**
 * @method DOMNode._getElementsByTagNameRecursive - implements getElementsByTagName()
 * @param  elem     : DOMElement  - The element which are checking and then recursing into
 * @param  tagname  : string      - The name of the tag to match on. The special value "*" matches all tags
 * @param  nodeList : DOMNodeList - The accumulating list of matching nodes
 *
 * @return : DOMNodeList
 */
var __getElementsByTagNameRecursive__ = function (elem, tagname, nodeList) {
    
    if (elem.nodeType == DOMNode.ELEMENT_NODE || elem.nodeType == DOMNode.DOCUMENT_NODE) {
    
        if(elem.nodeType !== DOMNode.DOCUMENT_NODE && 
            ((elem.nodeName.toUpperCase() == tagname.toUpperCase()) || 
                (tagname == "*")) ){
            __appendChild__(nodeList, elem);               // add matching node to nodeList
        }
    
        // recurse childNodes
        for(var i = 0; i < elem.childNodes.length; i++) {
            nodeList = __getElementsByTagNameRecursive__(elem.childNodes.item(i), tagname, nodeList);
        }
    }
    
    return nodeList;
};

/**
 * @method DOMNode._getElementsByTagNameNSRecursive - implements getElementsByTagName()
 *
 * @param  elem     : DOMElement  - The element which are checking and then recursing into
 * @param  namespaceURI : string - the namespace URI of the required node
 * @param  localName    : string - the local name of the required node
 * @param  nodeList     : DOMNodeList - The accumulating list of matching nodes
 *
 * @return : DOMNodeList
 */
var __getElementsByTagNameNSRecursive__ = function(elem, namespaceURI, localName, nodeList) {
  if (elem.nodeType == DOMNode.ELEMENT_NODE || elem.nodeType == DOMNode.DOCUMENT_NODE) {

    if (((elem.namespaceURI == namespaceURI) || (namespaceURI == "*")) && ((elem.localName == localName) || (localName == "*"))) {
      __appendChild__(nodeList, elem);               // add matching node to nodeList
    }

    // recurse childNodes
    for(var i = 0; i < elem.childNodes.length; i++) {
      nodeList = __getElementsByTagNameNSRecursive__(elem.childNodes.item(i), namespaceURI, localName, nodeList);
    }
  }

  return nodeList;
};

/**
 * @method DOMNode._isAncestor - returns true if node is ancestor of target
 * @param  target         : DOMNode - The node we are using as context
 * @param  node         : DOMNode - The candidate ancestor node
 * @return : boolean
 */
var __isAncestor__ = function(target, node) {
  // if this node matches, return true,
  // otherwise recurse up (if there is a parentNode)
  return ((target == node) || ((target.parentNode) && (__isAncestor__(target.parentNode, node))));
};

var __ownerDocument__ = function(node){
    return (node.nodeType == DOMNode.DOCUMENT_NODE)?node:node.ownerDocument;
};
/**
 * @class  DOMNamespace - The Namespace interface represents an namespace in an Element object
 *
 * @extends DOMNode
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  ownerDocument : DOMDocument - The Document object associated with this node.
 */
var DOMNamespace = function(ownerDocument) {
  this.DOMNode = DOMNode;
  this.DOMNode(ownerDocument);

  this.name      = "";                           // the name of this attribute

  // If this attribute was explicitly given a value in the original document, this is true; otherwise, it is false.
  // Note that the implementation is in charge of this attribute, not the user.
  // If the user changes the value of the attribute (even if it ends up having the same value as the default value)
  // then the specified flag is automatically flipped to true
  this.specified = false;
};
DOMNamespace.prototype = new DOMNode;
__extend__(DOMNamespace.prototype, {
    get value(){
        // the value of the attribute is returned as a string
        return this.nodeValue;
    },
    set value(value){
        this.nodeValue = value+'';
    },
    get nodeType(){
        return DOMNode.NAMESPACE_NODE;
    },
    get xml(){
        var ret = "";

          // serialize Namespace Declaration
          if (this.nodeName != "") {
            ret += this.nodeName +"=\""+ __escapeXML__(this.nodeValue) +"\"";
          }
          else {  // handle default namespace
            ret += "xmlns=\""+ __escapeXML__(this.nodeValue) +"\"";
          }
        
          return ret;
    },
    toString: function(){
        return "Namespace #" + this.id;
    }
});

$debug("Defining CharacterData");
/*
* CharacterData - DOM Level 2
*/
$w.__defineGetter__("CharacterData", function(){
  return function(){
    throw new Error("Object cannot be created in this context");
  };
});

/**
 * @class  DOMCharacterData - parent abstract class for DOMText and DOMComment
 * @extends DOMNode
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  ownerDocument : DOMDocument - The Document object associated with this node.
 */
var DOMCharacterData = function(ownerDocument) {
  this.DOMNode  = DOMNode;
  this.DOMNode(ownerDocument);
};
DOMCharacterData.prototype = new DOMNode;
__extend__(DOMCharacterData.prototype,{
    get data(){
        return this.nodeValue;
    },
    set data(data){
        this.nodeValue = data;
    },
    get length(){return this.nodeValue.length;},
    appendData: function(arg){
        // throw Exception if DOMCharacterData is readonly
        if (__ownerDocument__(this).implementation.errorChecking && this._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }
        // append data
        this.data = "" + this.data + arg;
    },
    deleteData: function(offset, count){ 
        // throw Exception if DOMCharacterData is readonly
        if (__ownerDocument__(this).implementation.errorChecking && this._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }
        if (this.data) {
            // throw Exception if offset is negative or greater than the data length,
            if (__ownerDocument__(this).implementation.errorChecking && 
                ((offset < 0) || (offset >  this.data.length) || (count < 0))) {
                throw(new DOMException(DOMException.INDEX_SIZE_ERR));
            }
            
            // delete data
            if(!count || (offset + count) > this.data.length) {
              this.data = this.data.substring(0, offset);
            }else {
              this.data = this.data.substring(0, offset).
                concat(this.data.substring(offset + count));
            }
        }
    },
    insertData: function(offset, arg){
        // throw Exception if DOMCharacterData is readonly
        if(__ownerDocument__(this).implementation.errorChecking && this._readonly){
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }
        
        if(this.data){
            // throw Exception if offset is negative or greater than the data length,
            if (__ownerDocument__(this).implementation.errorChecking && 
                ((offset < 0) || (offset >  this.data.length))) {
                throw(new DOMException(DOMException.INDEX_SIZE_ERR));
            }
            
            // insert data
            this.data =  this.data.substring(0, offset).concat(arg, this.data.substring(offset));
        }else {
            // throw Exception if offset is negative or greater than the data length,
            if (__ownerDocument__(this).implementation.errorChecking && (offset != 0)) {
               throw(new DOMException(DOMException.INDEX_SIZE_ERR));
            }
            
            // set data
            this.data = arg;
        }
    },
    replaceData: function(offset, count, arg){
        // throw Exception if DOMCharacterData is readonly
        if (__ownerDocument__(this).implementation.errorChecking && this._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }
        
        if (this.data) {
            // throw Exception if offset is negative or greater than the data length,
            if (__ownerDocument__(this).implementation.errorChecking && 
                ((offset < 0) || (offset >  this.data.length) || (count < 0))) {
                throw(new DOMException(DOMException.INDEX_SIZE_ERR));
            }
            
            // replace data
            this.data = this.data.substring(0, offset).
                concat(arg, this.data.substring(offset + count));
        }else {
            // set data
            this.data = arg;
        }
    },
    substringData: function(offset, count){
        var ret = null;
        if (this.data) {
            // throw Exception if offset is negative or greater than the data length,
            // or the count is negative
            if (__ownerDocument__(this).implementation.errorChecking && 
                ((offset < 0) || (offset > this.data.length) || (count < 0))) {
                throw(new DOMException(DOMException.INDEX_SIZE_ERR));
            }
            // if count is not specified
            if (!count) {
                ret = this.data.substring(offset); // default to 'end of string'
            }else{
                ret = this.data.substring(offset, offset + count);
            }
        }
        return ret;
    }
});
$debug("Defining Text");
/*
* Text - DOM Level 2
*/
$w.__defineGetter__("Text", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

/**
 * @class  DOMText - The Text interface represents the textual content (termed character data in XML) of an Element or Attr.
 *   If there is no markup inside an element's content, the text is contained in a single object implementing the Text interface
 *   that is the only child of the element. If there is markup, it is parsed into a list of elements and Text nodes that form the
 *   list of children of the element.
 * @extends DOMCharacterData
 * @author Jon van Noort (jon@webarcana.com.au) and David Joham (djoham@yahoo.com)
 * @param  ownerDocument : DOMDocument - The Document object associated with this node.
 */
DOMText = function(ownerDocument) {
  this.DOMCharacterData  = DOMCharacterData;
  this.DOMCharacterData(ownerDocument);

  this.nodeName  = "#text";
};
DOMText.prototype = new DOMCharacterData;
__extend__(DOMText.prototype,{
    //Breaks this Text node into two Text nodes at the specified offset,
    // keeping both in the tree as siblings. This node then only contains all the content up to the offset point.
    // And a new Text node, which is inserted as the next sibling of this node, contains all the content at and after the offset point.
    splitText : function(offset) {
        var data, inode;
        
        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if Node is readonly
            if (this._readonly) {
              throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }
            
            // throw Exception if offset is negative or greater than the data length,
            if ((offset < 0) || (offset > this.data.length)) {
              throw(new DOMException(DOMException.INDEX_SIZE_ERR));
            }
        }
        
        if (this.parentNode) {
            // get remaining string (after offset)
            data  = this.substringData(offset);
            
            // create new TextNode with remaining string
            inode = __ownerDocument__(this).createTextNode(data);
            
            // attach new TextNode
            if (this.nextSibling) {
              this.parentNode.insertBefore(inode, this.nextSibling);
            }
            else {
              this.parentNode.appendChild(inode);
            }
            
            // remove remaining string from original TextNode
            this.deleteData(offset);
        }
        
        return inode;
    },
    get nodeType(){
        return DOMNode.TEXT_NODE;
    },
    get xml(){
        return __escapeXML__(""+ this.nodeValue);
    },
    toString: function(){
        return "Text #" + this._id;    
    }
});

$debug("Defining CDATASection");
/*
* CDATASection - DOM Level 2
*/
$w.__defineGetter__("CDATASection", function(){
  return function(){
    throw new Error("Object cannot be created in this context");
  };
});

/**
 * @class  DOMCDATASection - CDATA sections are used to escape blocks of text containing characters that would otherwise be regarded as markup.
 *   The only delimiter that is recognized in a CDATA section is the "\]\]\>" string that ends the CDATA section
 * @extends DOMCharacterData
 * @author Jon van Noort (jon@webarcana.com.au) and David Joham (djoham@yahoo.com)
 * @param  ownerDocument : DOMDocument - The Document object associated with this node.
 */
var DOMCDATASection = function(ownerDocument) {
  this.DOMText  = DOMText;
  this.DOMText(ownerDocument);

  this.nodeName  = "#cdata-section";
};
DOMCDATASection.prototype = new DOMText;
__extend__(DOMCDATASection.prototype,{
    get nodeType(){
        return DOMNode.CDATA_SECTION_NODE;
    },
    get xml(){
        return "<![CDATA[" + this.nodeValue + "]]>";
    },
    toString : function(){
        return "CDATA #"+this._id;
    }
});$debug("Defining Comment");
/* 
* Comment - DOM Level 2
*/
$w.__defineGetter__("Comment", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

/**
 * @class  DOMComment - This represents the content of a comment, i.e., all the characters between the starting '<!--' and ending '-->'
 * @extends DOMCharacterData
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  ownerDocument : DOMDocument - The Document object associated with this node.
 */
var DOMComment = function(ownerDocument) {
  this.DOMCharacterData  = DOMCharacterData;
  this.DOMCharacterData(ownerDocument);

  this.nodeName  = "#comment";
};
DOMComment.prototype = new DOMCharacterData;
__extend__(DOMComment.prototype, {
    get nodeType(){
        return DOMNode.COMMENT_NODE;
    },
    get xml(){
        return "<!--" + this.nodeValue + "-->";
    },
    toString : function(){
        return "Comment #"+this._id;
    }
});
$debug("Defining DocumentType");
;/*
* DocumentType - DOM Level 2
*/
$w.__defineGetter__('DocumentType', function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var DOMDocumentType    = function() { $error("DOMDocumentType.constructor(): Not Implemented"   ); };$debug("Defining Attr");
/*
* Attr - DOM Level 2
*/
$w.__defineGetter__("Attr", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});


/**
 * @class  DOMAttr - The Attr interface represents an attribute in an Element object
 * @extends DOMNode
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  ownerDocument : DOMDocument - The Document object associated with this node.
 */
var DOMAttr = function(ownerDocument) {
    this.DOMNode = DOMNode;
    this.DOMNode(ownerDocument);
                   
    this.ownerElement = null;               // set when Attr is added to NamedNodeMap
};
DOMAttr.prototype = new DOMNode; 
__extend__(DOMAttr.prototype, {
    // the name of this attribute
    get name(){
        return this.nodeName;
    },
    set name(name){
        this.nodeName = name;
    },
    // the value of the attribute is returned as a string
    get value(){
        return this.nodeValue;
    },
    set value(value){
        // throw Exception if Attribute is readonly
        if (__ownerDocument__(this).implementation.errorChecking && this._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }
        // delegate to node
        this.nodeValue = value;
    },
    get specified(){
        return (this.value.length > 0);
    },
    get nodeType(){
        return DOMNode.ATTRIBUTE_NODE;
    },
    get xml(){
        return this.nodeName + '="' + __escapeXML__(this.nodeValue) + '" ';
    },
    toString : function(){
        return "Attr #" + this._id + " " + this.name;
    }
});    

$debug("Defining Element");
/*
* Element - DOM Level 2
*/
$w.__defineGetter__("Element", function(){
  return function(){
    throw new Error("Object cannot be created in this context");
  };
});

	
/**
 * @class  DOMElement - By far the vast majority of objects (apart from text) that authors encounter
 *   when traversing a document are Element nodes.
 * @extends DOMNode
 * @author Jon van Noort (jon@webarcana.com.au) and David Joham (djoham@yahoo.com)
 * @param  ownerDocument : DOMDocument - The Document object associated with this node.
 */
var DOMElement = function(ownerDocument) {
    this.DOMNode  = DOMNode;
    this.DOMNode(ownerDocument);                   
    this.id = "";                                  // the ID of the element
};
DOMElement.prototype = new DOMNode;
__extend__(DOMElement.prototype, {	
    // The name of the element.
    get tagName(){
        return this.nodeName;  
    },
    set tagName(name){
        this.nodeName = name;  
    },
    addEventListener        : function(){ window.addEventListener.apply(this, arguments) },
	removeEventListener     : function(){ window.removeEventListener.apply(this, arguments) },
	dispatchEvent           : function(){ window.dispatchEvent.apply(this, arguments) },
    getAttribute: function(name) {
        var ret = null;
        // if attribute exists, use it
        var attr = this.attributes.getNamedItem(name);
        if (attr) {
            ret = attr.value;
        }
        return ret; // if Attribute exists, return its value, otherwise, return ""
    },
    setAttribute : function (name, value) {
        // if attribute exists, use it
        var attr = this.attributes.getNamedItem(name);
        var value = value+'';
        //I had to add this check becuase as the script initializes
        //the id may be set in the constructor, and the html element
        //overrides the id property with a getter/setter.
        if(__ownerDocument__(this)){
            if (!attr) {
                attr = __ownerDocument__(this).createAttribute(name);  // otherwise create it
            }
            
            
            // test for exceptions
            if (__ownerDocument__(this).implementation.errorChecking) {
                // throw Exception if Attribute is readonly
                if (attr._readonly) {
                    throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
                }
                
                // throw Exception if the value string contains an illegal character
                if (!__isValidString__(value)) {
                    throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
                }
            }
            
            if (__isIdDeclaration__(name)) {
            //    this.id = value;  // cache ID for getElementById()
            }
            
            // assign values to properties (and aliases)
            attr.value     = value;
            
            // add/replace Attribute in NamedNodeMap
            this.attributes.setNamedItem(attr);
        }
    },
    removeAttribute : function removeAttribute(name) {
        // delegate to DOMNamedNodeMap.removeNamedItem
        return this.attributes.removeNamedItem(name);
    },
    getAttributeNode : function getAttributeNode(name) {
        // delegate to DOMNamedNodeMap.getNamedItem
        return this.attributes.getNamedItem(name);
    },
    setAttributeNode: function(newAttr) {
        // if this Attribute is an ID
        if (__isIdDeclaration__(newAttr.name)) {
            this.id = newAttr.value;  // cache ID for getElementById()
        }
        // delegate to DOMNamedNodeMap.setNamedItem
        return this.attributes.setNamedItem(newAttr);
    },
    removeAttributeNode: function(oldAttr) {
      // throw Exception if Attribute is readonly
      if (__ownerDocument__(this).implementation.errorChecking && oldAttr._readonly) {
        throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
      }
    
      // get item index
      var itemIndex = this.attributes._findItemIndex(oldAttr._id);
    
      // throw Exception if node does not exist in this map
      if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
        throw(new DOMException(DOMException.NOT_FOUND_ERR));
      }
    
      return this.attributes._removeChild(itemIndex);
    },
    getAttributeNS : function(namespaceURI, localName) {
        var ret = "";
        // delegate to DOMNAmedNodeMap.getNamedItemNS
        var attr = this.attributes.getNamedItemNS(namespaceURI, localName);
        if (attr) {
            ret = attr.value;
        }
        return ret;  // if Attribute exists, return its value, otherwise return ""
    },
    setAttributeNS : function(namespaceURI, qualifiedName, value) {
        // call DOMNamedNodeMap.getNamedItem
        var attr = this.attributes.getNamedItem(namespaceURI, qualifiedName);
        
        if (!attr) {  // if Attribute exists, use it
            // otherwise create it
            attr = __ownerDocument__(this).createAttributeNS(namespaceURI, qualifiedName);
        }
        
        var value = value+'';
        
        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if Attribute is readonly
            if (attr._readonly) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }
            
            // throw Exception if the Namespace is invalid
            if (!__isValidNamespace__(namespaceURI, qualifiedName)) {
                throw(new DOMException(DOMException.NAMESPACE_ERR));
            }
            
            // throw Exception if the value string contains an illegal character
            if (!__isValidString__(value)) {
                throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
            }
        }
        
        // if this Attribute is an ID
        if (__isIdDeclaration__(name)) {
            this.id = value;  // cache ID for getElementById()
        }
        
        // assign values to properties (and aliases)
        attr.value     = value;
        attr.nodeValue = value;
        
        // delegate to DOMNamedNodeMap.setNamedItem
        this.attributes.setNamedItemNS(attr);
    },
    removeAttributeNS : function(namespaceURI, localName) {
        // delegate to DOMNamedNodeMap.removeNamedItemNS
        return this.attributes.removeNamedItemNS(namespaceURI, localName);
    },
    getAttributeNodeNS : function(namespaceURI, localName) {
        // delegate to DOMNamedNodeMap.getNamedItemNS
        return this.attributes.getNamedItemNS(namespaceURI, localName);
    },
    setAttributeNodeNS : function(newAttr) {
        // if this Attribute is an ID
        if ((newAttr.prefix == "") &&  __isIdDeclaration__(newAttr.name)) {
            this.id = newAttr.value+'';  // cache ID for getElementById()
        }
        
        // delegate to DOMNamedNodeMap.setNamedItemNS
        return this.attributes.setNamedItemNS(newAttr);
    },
    hasAttribute : function(name) {
        // delegate to DOMNamedNodeMap._hasAttribute
        return __hasAttribute__(this.attributes,name);
    },
    hasAttributeNS : function(namespaceURI, localName) {
        // delegate to DOMNamedNodeMap._hasAttributeNS
        return __hasAttributeNS__(this.attributes, namespaceURI, localName);
    },
    get nodeType(){
        return DOMNode.ELEMENT_NODE;
    },
    get xml() {
        var ret = "";
        
        // serialize namespace declarations
        var ns = this._namespaces.xml;
        if (ns.length > 0) ns = " "+ ns;
        
        // serialize Attribute declarations
        var attrs = this.attributes.xml;
        if (attrs.length > 0) attrs = " "+ attrs;
        
        // serialize this Element
        ret += "<" + this.nodeName.toLowerCase() + ns + attrs +">";
        ret += this.childNodes.xml;
        ret += "</" + this.nodeName.toLowerCase()+">";
        
        return ret;
    },
    toString : function(){
        return "Element #"+this._id + " "+ this.tagName + (this.id?" => "+this.id:'');
    }
});

/**
 * @class  DOMException - raised when an operation is impossible to perform
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  code : int - the exception code (one of the DOMException constants)
 */
var DOMException = function(code) {
  this.code = code;
};

// DOMException constants
// Introduced in DOM Level 1:
DOMException.INDEX_SIZE_ERR                 = 1;
DOMException.DOMSTRING_SIZE_ERR             = 2;
DOMException.HIERARCHY_REQUEST_ERR          = 3;
DOMException.WRONG_DOCUMENT_ERR             = 4;
DOMException.INVALID_CHARACTER_ERR          = 5;
DOMException.NO_DATA_ALLOWED_ERR            = 6;
DOMException.NO_MODIFICATION_ALLOWED_ERR    = 7;
DOMException.NOT_FOUND_ERR                  = 8;
DOMException.NOT_SUPPORTED_ERR              = 9;
DOMException.INUSE_ATTRIBUTE_ERR            = 10;

// Introduced in DOM Level 2:
DOMException.INVALID_STATE_ERR              = 11;
DOMException.SYNTAX_ERR                     = 12;
DOMException.INVALID_MODIFICATION_ERR       = 13;
DOMException.NAMESPACE_ERR                  = 14;
DOMException.INVALID_ACCESS_ERR             = 15;
$debug("Defining DocumentFragment");
/* 
* DocumentFragment - DOM Level 2
*/
$w.__defineGetter__("DocumentFragment", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

/**
 * @class  DOMDocumentFragment - DocumentFragment is a "lightweight" or "minimal" Document object.
 * @extends DOMNode
 * @author Jon van Noort (jon@webarcana.com.au) and David Joham (djoham@yahoo.com)
 * @param  ownerDocument : DOMDocument - The Document object associated with this node.
 */
var DOMDocumentFragment = function(ownerDocument) {
  this.DOMNode = DOMNode;
  this.DOMNode(ownerDocument);
  this.nodeName  = "#document-fragment";
};
DOMDocumentFragment.prototype = new DOMNode;
__extend__(DOMDocumentFragment.prototype,{
    get nodeType(){
        return DOMNode.DOCUMENT_FRAGMENT_NODE;
    },
    get xml(){
        var xml = "",
            count = this.childNodes.length;
        
        // create string concatenating the serialized ChildNodes
        for (var i = 0; i < count; i++) {
            xml += this.childNodes.item(i).xml;
        }
        
        return xml;
    },
    toString : function(){
        return "DocumentFragment #"+this._id;
    }
});
$debug("Defining ProcessingInstruction");
/*
* ProcessingInstruction - DOM Level 2
*/
$w.__defineGetter__('ProcessingInstruction', function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

/**
 * @class  DOMProcessingInstruction - The ProcessingInstruction interface represents a "processing instruction",
 *   used in XML as a way to keep processor-specific information in the text of the document
 * @extends DOMNode
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  ownerDocument : DOMDocument - The Document object associated with this node.
 */
var DOMProcessingInstruction = function(ownerDocument) {
  this.DOMNode  = DOMNode;
  this.DOMNode(ownerDocument);
};
DOMProcessingInstruction.prototype = new DOMNode;
__extend__(DOMProcessingInstruction.prototype, {
    get data(){
        return this.nodeValue;
    },
    set data(data){
        // throw Exception if DOMNode is readonly
        if (__ownerDocument__(this).errorChecking && this._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }
        this.nodeValue = data;
    },
    get target(){
      // The target of this processing instruction.
      // XML defines this as being the first token following the markup that begins the processing instruction.
      // The content of this processing instruction.
        return this.nodeName;
    },
    get nodeType(){
        return DOMNode.PROCESSING_INSTRUCTION_NODE;
    },
    get xml(){
        return "<?" + this.nodeName +" "+ this.nodeValue + " ?>";
    },
    toString : function(){
        return "ProcessingInstruction #"+this._id;
    }
});
$debug("Defining DOMParser");
/*
* DOMParser
*/

var DOMParser = function(){};
__extend__(DOMParser.prototype,{
    parseFromString: function(xmlString){
        //$log("Parsing XML String: " +xmlString);
        return document.implementation.createDocument().loadXML(xmlString);
    }
});

$debug("Initializing Internal DOMParser.");
//keep one around for internal use
$domparser = new DOMParser();

$w.__defineGetter__('DOMParser', DOMParser);
// =========================================================================
//
// xmlsax.js - an XML SAX parser in JavaScript.
//
// version 3.1
//
// =========================================================================
//
// Copyright (C) 2001 - 2002 David Joham (djoham@yahoo.com) and Scott Severtson
//
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 2.1 of the License, or (at your option) any later version.

// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.

// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
//
//
// Visit the XML for <SCRIPT> home page at http://xmljs.sourceforge.net
//

// CONSTANTS
var whitespace = "\n\r\t ";


/**
*   function:   this is the constructor to the XMLP Object
*   Author:   Scott Severtson
*   Description:XMLP is a pull-based parser. The calling application passes in a XML string
*   to the constructor, then repeatedly calls .next() to parse the next segment.
*   .next() returns a flag indicating what type of segment was found, and stores
*   data temporarily in couple member variables (name, content, array of
*   attributes), which can be accessed by several .get____() methods.
*
*   Basically, XMLP is the lowest common denominator parser - an very simple
*   API which other wrappers can be built against.
**/


var XMLP = function(strXML) {
    // Normalize line breaks
    strXML = SAXStrings.replace(strXML, null, null, "\r\n", "\n");
    strXML = SAXStrings.replace(strXML, null, null, "\r", "\n");

    this.m_xml = strXML;
    this.m_iP = 0;
    this.m_iState = XMLP._STATE_PROLOG;
    this.m_stack = new Stack();
    this._clearAttributes();
    this.replaceEntities = true;
};


// CONSTANTS    (these must be below the constructor)


XMLP._NONE    = 0;
XMLP._ELM_B   = 1;
XMLP._ELM_E   = 2;
XMLP._ELM_EMP = 3;
XMLP._ATT     = 4;
XMLP._TEXT    = 5;
XMLP._ENTITY  = 6;
XMLP._PI      = 7;
XMLP._CDATA   = 8;
XMLP._COMMENT = 9;
XMLP._DTD     = 10;
XMLP._ERROR   = 11;

XMLP._CONT_XML = 0;
XMLP._CONT_ALT = 1;

XMLP._ATT_NAME = 0;
XMLP._ATT_VAL  = 1;

XMLP._STATE_PROLOG = 1;
XMLP._STATE_DOCUMENT = 2;
XMLP._STATE_MISC = 3;

XMLP._errs = new Array();
XMLP._errs[XMLP.ERR_CLOSE_PI       = 0 ] = "PI: missing closing sequence";
XMLP._errs[XMLP.ERR_CLOSE_DTD      = 1 ] = "DTD: missing closing sequence";
XMLP._errs[XMLP.ERR_CLOSE_COMMENT  = 2 ] = "Comment: missing closing sequence";
XMLP._errs[XMLP.ERR_CLOSE_CDATA    = 3 ] = "CDATA: missing closing sequence";
XMLP._errs[XMLP.ERR_CLOSE_ELM      = 4 ] = "Element: missing closing sequence";
XMLP._errs[XMLP.ERR_CLOSE_ENTITY   = 5 ] = "Entity: missing closing sequence";
XMLP._errs[XMLP.ERR_PI_TARGET      = 6 ] = "PI: target is required";
XMLP._errs[XMLP.ERR_ELM_EMPTY      = 7 ] = "Element: cannot be both empty and closing";
XMLP._errs[XMLP.ERR_ELM_NAME       = 8 ] = "Element: name must immediatly follow \"<\"";
XMLP._errs[XMLP.ERR_ELM_LT_NAME    = 9 ] = "Element: \"<\" not allowed in element names";
XMLP._errs[XMLP.ERR_ATT_VALUES     = 10] = "Attribute: values are required and must be in quotes";
XMLP._errs[XMLP.ERR_ATT_LT_NAME    = 11] = "Element: \"<\" not allowed in attribute names";
XMLP._errs[XMLP.ERR_ATT_LT_VALUE   = 12] = "Attribute: \"<\" not allowed in attribute values";
XMLP._errs[XMLP.ERR_ATT_DUP        = 13] = "Attribute: duplicate attributes not allowed";
XMLP._errs[XMLP.ERR_ENTITY_UNKNOWN = 14] = "Entity: unknown entity";
XMLP._errs[XMLP.ERR_INFINITELOOP   = 15] = "Infininte loop";
XMLP._errs[XMLP.ERR_DOC_STRUCTURE  = 16] = "Document: only comments, processing instructions, or whitespace allowed outside of document element";
XMLP._errs[XMLP.ERR_ELM_NESTING    = 17] = "Element: must be nested correctly";



XMLP.prototype._addAttribute = function(name, value) {
    this.m_atts[this.m_atts.length] = new Array(name, value);
}


XMLP.prototype._checkStructure = function(iEvent) {

        if(XMLP._STATE_PROLOG == this.m_iState) {
                if((XMLP._TEXT == iEvent) || (XMLP._ENTITY == iEvent)) {
            if(SAXStrings.indexOfNonWhitespace(this.getContent(), this.getContentBegin(), this.getContentEnd()) != -1) {
                                return this._setErr(XMLP.ERR_DOC_STRUCTURE);
            }
        }

        if((XMLP._ELM_B == iEvent) || (XMLP._ELM_EMP == iEvent)) {
            this.m_iState = XMLP._STATE_DOCUMENT;
            // Don't return - fall through to next state
        }
    }
    if(XMLP._STATE_DOCUMENT == this.m_iState) {
        if((XMLP._ELM_B == iEvent) || (XMLP._ELM_EMP == iEvent)) {
            this.m_stack.push(this.getName());
        }

        if((XMLP._ELM_E == iEvent) || (XMLP._ELM_EMP == iEvent)) {
            var strTop = this.m_stack.pop();
            if((strTop == null) || (strTop != this.getName())) {
                return this._setErr(XMLP.ERR_ELM_NESTING);
            }
        }

        if(this.m_stack.count() == 0) {
            this.m_iState = XMLP._STATE_MISC;
            return iEvent;
        }
    }
    if(XMLP._STATE_MISC == this.m_iState) {
                if((XMLP._ELM_B == iEvent) || (XMLP._ELM_E == iEvent) || (XMLP._ELM_EMP == iEvent) || (XMLP.EVT_DTD == iEvent)) {
                        return this._setErr(XMLP.ERR_DOC_STRUCTURE);
        }

        if((XMLP._TEXT == iEvent) || (XMLP._ENTITY == iEvent)) {
                        if(SAXStrings.indexOfNonWhitespace(this.getContent(), this.getContentBegin(), this.getContentEnd()) != -1) {
                                return this._setErr(XMLP.ERR_DOC_STRUCTURE);
            }
        }
    }

    return iEvent;

}


XMLP.prototype._clearAttributes = function() {
    this.m_atts = new Array();
}


XMLP.prototype._findAttributeIndex = function(name) {
    for(var i = 0; i < this.m_atts.length; i++) {
        if(this.m_atts[i][XMLP._ATT_NAME] == name) {
            return i;
        }
    }
    return -1;

}


XMLP.prototype.getAttributeCount = function() {

    return this.m_atts ? this.m_atts.length : 0;

}


XMLP.prototype.getAttributeName = function(index) {

    return ((index < 0) || (index >= this.m_atts.length)) ? null : this.m_atts[index][XMLP._ATT_NAME];

}


XMLP.prototype.getAttributeValue = function(index) {

    return ((index < 0) || (index >= this.m_atts.length)) ? null : __unescapeXML__(this.m_atts[index][XMLP._ATT_VAL]);

}


XMLP.prototype.getAttributeValueByName = function(name) {

    return this.getAttributeValue(this._findAttributeIndex(name));

}


XMLP.prototype.getColumnNumber = function() {

    return SAXStrings.getColumnNumber(this.m_xml, this.m_iP);

}


XMLP.prototype.getContent = function() {

    return (this.m_cSrc == XMLP._CONT_XML) ? this.m_xml : this.m_cAlt;

}


XMLP.prototype.getContentBegin = function() {

    return this.m_cB;

}


XMLP.prototype.getContentEnd = function() {

    return this.m_cE;

}


XMLP.prototype.getLineNumber = function() {

    return SAXStrings.getLineNumber(this.m_xml, this.m_iP);

}


XMLP.prototype.getName = function() {

    return this.m_name;

}


XMLP.prototype.next = function() {

    return this._checkStructure(this._parse());

}

XMLP.prototype.appendFragment = function(xmlfragment) {

        var start = this.m_xml.slice(0,this.m_iP);
        var end = this.m_xml.slice(this.m_iP);
        this.m_xml = start+xmlfragment+end;

}


XMLP.prototype._parse = function() {

        if(this.m_iP == this.m_xml.length) {
        return XMLP._NONE;
    }

    if(this.m_iP == this.m_xml.indexOf("<", this.m_iP)){
        if(this.m_xml.charAt(this.m_iP+1) == "?") {
            return this._parsePI(this.m_iP + 2);
        }
        else if(this.m_xml.charAt(this.m_iP+1) == "!") {
            if(this.m_xml.charAt(this.m_iP+2) == "D") {
                return this._parseDTD(this.m_iP + 9);
            }
            else if(this.m_xml.charAt(this.m_iP+2) == "-") {
                return this._parseComment(this.m_iP + 4);
            }
            else if(this.m_xml.charAt(this.m_iP+2) == "[") {
                return this._parseCDATA(this.m_iP + 9);
            }
        }
        else{
            return this._parseElement(this.m_iP + 1);
        }
    }
    else if(this.m_iP == this.m_xml.indexOf("&", this.m_iP)) {
        return this._parseEntity(this.m_iP + 1);
    }
    else{
        return this._parseText(this.m_iP);
    }


}


XMLP.prototype._parseAttribute = function(iB, iE) {
    var iNB, iNE, iEq, iVB, iVE;
    var cQuote, strN, strV;

        this.m_cAlt = ""; //resets the value so we don't use an old one by accident (see testAttribute7 in the test suite)

        iNB = SAXStrings.indexOfNonWhitespace(this.m_xml, iB, iE);
    if((iNB == -1) ||(iNB >= iE)) {
        return iNB;
    }

    iEq = this.m_xml.indexOf("=", iNB);
    if((iEq == -1) || (iEq > iE)) {
        return this._setErr(XMLP.ERR_ATT_VALUES);
    }

    iNE = SAXStrings.lastIndexOfNonWhitespace(this.m_xml, iNB, iEq);

    iVB = SAXStrings.indexOfNonWhitespace(this.m_xml, iEq + 1, iE);
    if((iVB == -1) ||(iVB > iE)) {
        return this._setErr(XMLP.ERR_ATT_VALUES);
    }

    cQuote = this.m_xml.charAt(iVB);
    if(_SAXStrings.QUOTES.indexOf(cQuote) == -1) {
        return this._setErr(XMLP.ERR_ATT_VALUES);
    }

    iVE = this.m_xml.indexOf(cQuote, iVB + 1);
    if((iVE == -1) ||(iVE > iE)) {
        return this._setErr(XMLP.ERR_ATT_VALUES);
    }

    strN = this.m_xml.substring(iNB, iNE + 1);
    strV = this.m_xml.substring(iVB + 1, iVE);

    if(strN.indexOf("<") != -1) {
        return this._setErr(XMLP.ERR_ATT_LT_NAME);
    }

    if(strV.indexOf("<") != -1) {
        return this._setErr(XMLP.ERR_ATT_LT_VALUE);
    }

    strV = SAXStrings.replace(strV, null, null, "\n", " ");
    strV = SAXStrings.replace(strV, null, null, "\t", " ");
        iRet = this._replaceEntities(strV);
    if(iRet == XMLP._ERROR) {
        return iRet;
    }

    strV = this.m_cAlt;

    if(this._findAttributeIndex(strN) == -1) {
        this._addAttribute(strN, strV);
    }else {
        return this._setErr(XMLP.ERR_ATT_DUP);
    }

    this.m_iP = iVE + 2;

    return XMLP._ATT;

}


XMLP.prototype._parseCDATA = function(iB) {
    var iE = this.m_xml.indexOf("]]>", iB);
    if (iE == -1) {
        return this._setErr(XMLP.ERR_CLOSE_CDATA);
    }

    this._setContent(XMLP._CONT_XML, iB, iE);

    this.m_iP = iE + 3;

    return XMLP._CDATA;

}


XMLP.prototype._parseComment = function(iB) {
    var iE = this.m_xml.indexOf("-" + "->", iB);
    if (iE == -1) {
        return this._setErr(XMLP.ERR_CLOSE_COMMENT);
    }

    this._setContent(XMLP._CONT_XML, iB, iE);

    this.m_iP = iE + 3;

    return XMLP._COMMENT;

}


XMLP.prototype._parseDTD = function(iB) {

    // Eat DTD

    var iE, strClose, iInt, iLast;

    iE = this.m_xml.indexOf(">", iB);
    if(iE == -1) {
        return this._setErr(XMLP.ERR_CLOSE_DTD);
    }

    iInt = this.m_xml.indexOf("[", iB);
    strClose = ((iInt != -1) && (iInt < iE)) ? "]>" : ">";

    while(true) {
        // DEBUG: Remove
        /*if(iE == iLast) {
            return this._setErr(XMLP.ERR_INFINITELOOP);
        }

        iLast = iE;*/
        // DEBUG: Remove End

        iE = this.m_xml.indexOf(strClose, iB);
        if(iE == -1) {
            return this._setErr(XMLP.ERR_CLOSE_DTD);
        }

        // Make sure it is not the end of a CDATA section
        if (this.m_xml.substring(iE - 1, iE + 2) != "]]>") {
            break;
        }
    }

    this.m_iP = iE + strClose.length;

    return XMLP._DTD;

}


XMLP.prototype._parseElement = function(iB) {
    var iE, iDE, iNE, iRet;
    var iType, strN, iLast;

    iDE = iE = this.m_xml.indexOf(">", iB);
    if(iE == -1) {
        return this._setErr(XMLP.ERR_CLOSE_ELM);
    }

    if(this.m_xml.charAt(iB) == "/") {
        iType = XMLP._ELM_E;
        iB++;
    } else {
        iType = XMLP._ELM_B;
    }

    if(this.m_xml.charAt(iE - 1) == "/") {
        if(iType == XMLP._ELM_E) {
            return this._setErr(XMLP.ERR_ELM_EMPTY);
        }
        iType = XMLP._ELM_EMP;
        iDE--;
    }

    iDE = SAXStrings.lastIndexOfNonWhitespace(this.m_xml, iB, iDE);

    //djohack
    //hack to allow for elements with single character names to be recognized

    /*if (iE - iB != 1 ) {
        if(SAXStrings.indexOfNonWhitespace(this.m_xml, iB, iDE) != iB) {
            return this._setErr(XMLP.ERR_ELM_NAME);
        }
    }*/
    // end hack -- original code below

    /*
    if(SAXStrings.indexOfNonWhitespace(this.m_xml, iB, iDE) != iB)
        return this._setErr(XMLP.ERR_ELM_NAME);
    */
    this._clearAttributes();

    iNE = SAXStrings.indexOfWhitespace(this.m_xml, iB, iDE);
    if(iNE == -1) {
        iNE = iDE + 1;
    }
    else {
        this.m_iP = iNE;
        while(this.m_iP < iDE) {
            // DEBUG: Remove
            //if(this.m_iP == iLast) return this._setErr(XMLP.ERR_INFINITELOOP);
            //iLast = this.m_iP;
            // DEBUG: Remove End


            iRet = this._parseAttribute(this.m_iP, iDE);
            if(iRet == XMLP._ERROR) return iRet;
        }
    }

    strN = this.m_xml.substring(iB, iNE);

    /*if(strN.indexOf("<") != -1) {
        return this._setErr(XMLP.ERR_ELM_LT_NAME);
    }*/

    this.m_name = strN;
    this.m_iP = iE + 1;

    return iType;

}


XMLP.prototype._parseEntity = function(iB) {
    var iE = this.m_xml.indexOf(";", iB);
    if(iE == -1) {
        return this._setErr(XMLP.ERR_CLOSE_ENTITY);
    }

    this.m_iP = iE + 1;

    return this._replaceEntity(this.m_xml, iB, iE);

}


XMLP.prototype._parsePI = function(iB) {

    var iE, iTB, iTE, iCB, iCE;

    iE = this.m_xml.indexOf("?>", iB);
    if(iE   == -1) {
        return this._setErr(XMLP.ERR_CLOSE_PI);
    }

    iTB = SAXStrings.indexOfNonWhitespace(this.m_xml, iB, iE);
    if(iTB == -1) {
        return this._setErr(XMLP.ERR_PI_TARGET);
    }

    iTE = SAXStrings.indexOfWhitespace(this.m_xml, iTB, iE);
    if(iTE  == -1) {
        iTE = iE;
    }

    iCB = SAXStrings.indexOfNonWhitespace(this.m_xml, iTE, iE);
    if(iCB == -1) {
        iCB = iE;
    }

    iCE = SAXStrings.lastIndexOfNonWhitespace(this.m_xml, iCB, iE);
    if(iCE  == -1) {
        iCE = iE - 1;
    }

    this.m_name = this.m_xml.substring(iTB, iTE);
    this._setContent(XMLP._CONT_XML, iCB, iCE + 1);
    this.m_iP = iE + 2;

    return XMLP._PI;

}


XMLP.prototype._parseText = function(iB) {
    var iE, iEE;

    iE = this.m_xml.indexOf("<", iB);
    if(iE == -1) {
        iE = this.m_xml.length;
    }

    if(this.replaceEntities) {
        iEE = this.m_xml.indexOf("&", iB);
        if((iEE != -1) && (iEE <= iE)) {
            iE = iEE;
        }
    }

    this._setContent(XMLP._CONT_XML, iB, iE);

    this.m_iP = iE;

    return XMLP._TEXT;

}


XMLP.prototype._replaceEntities = function(strD, iB, iE) {
    if(SAXStrings.isEmpty(strD)) return "";
    iB = iB || 0;
    iE = iE || strD.length;


    var iEB, iEE, strRet = "";

    iEB = strD.indexOf("&", iB);
    iEE = iB;

    while((iEB > 0) && (iEB < iE)) {
        strRet += strD.substring(iEE, iEB);

        iEE = strD.indexOf(";", iEB) + 1;

        if((iEE == 0) || (iEE > iE)) {
            return this._setErr(XMLP.ERR_CLOSE_ENTITY);
        }

        iRet = this._replaceEntity(strD, iEB + 1, iEE - 1);
        if(iRet == XMLP._ERROR) {
            return iRet;
        }

        strRet += this.m_cAlt;

        iEB = strD.indexOf("&", iEE);
    }

    if(iEE != iE) {
        strRet += strD.substring(iEE, iE);
    }

    this._setContent(XMLP._CONT_ALT, strRet);

    return XMLP._ENTITY;

}


XMLP.prototype._replaceEntity = function(strD, iB, iE) {
    if(SAXStrings.isEmpty(strD)) return -1;
    iB = iB || 0;
    iE = iE || strD.length;

    switch(strD.substring(iB, iE)) {
        case "amp":  strEnt = "&";  break;
        case "lt":   strEnt = "<";  break;
        case "gt":   strEnt = ">";  break;
        case "apos": strEnt = "'";  break;
        case "quot": strEnt = "\""; break;
        default:
            if(strD.charAt(iB) == "#") {
                strEnt = String.fromCharCode(parseInt(strD.substring(iB + 1, iE)))+'';
            } else {
                return this._setErr(XMLP.ERR_ENTITY_UNKNOWN);
            }
        break;
    }
    this._setContent(XMLP._CONT_ALT, strEnt);

    return XMLP._ENTITY;
}


XMLP.prototype._setContent = function(iSrc) {
    var args = arguments;

    if(XMLP._CONT_XML == iSrc) {
        this.m_cAlt = null;
        this.m_cB = args[1];
        this.m_cE = args[2];
    } else {
        this.m_cAlt = args[1];
        this.m_cB = 0;
        this.m_cE = args[1].length;
    }
    this.m_cSrc = iSrc;

}


XMLP.prototype._setErr = function(iErr) {
    var strErr = XMLP._errs[iErr];

    this.m_cAlt = strErr;
    this.m_cB = 0;
    this.m_cE = strErr.length;
    this.m_cSrc = XMLP._CONT_ALT;

    return XMLP._ERROR;

}


/**
* function:   SAXDriver
* Author:   Scott Severtson
* Description:
*    SAXDriver is an object that basically wraps an XMLP instance, and provides an
*   event-based interface for parsing. This is the object users interact with when coding
*   with XML for <SCRIPT>
**/

var SAXDriver = function() {
    this.m_hndDoc = null;
    this.m_hndErr = null;
    this.m_hndLex = null;
}


// CONSTANTS
SAXDriver.DOC_B = 1;
SAXDriver.DOC_E = 2;
SAXDriver.ELM_B = 3;
SAXDriver.ELM_E = 4;
SAXDriver.CHARS = 5;
SAXDriver.PI    = 6;
SAXDriver.CD_B  = 7;
SAXDriver.CD_E  = 8;
SAXDriver.CMNT  = 9;
SAXDriver.DTD_B = 10;
SAXDriver.DTD_E = 11;



SAXDriver.prototype.parse = function(strD) {
    var parser = new XMLP(strD);

    if(this.m_hndDoc && this.m_hndDoc.setDocumentLocator) {
        this.m_hndDoc.setDocumentLocator(this);
    }

    this.m_parser = parser;
    this.m_bErr = false;

    if(!this.m_bErr) {
        this._fireEvent(SAXDriver.DOC_B);
    }
    this._parseLoop();
    if(!this.m_bErr) {
        this._fireEvent(SAXDriver.DOC_E);
    }

    this.m_xml = null;
    this.m_iP = 0;

}


SAXDriver.prototype.setDocumentHandler = function(hnd) {

    this.m_hndDoc = hnd;

}


SAXDriver.prototype.setErrorHandler = function(hnd) {

    this.m_hndErr = hnd;

}


SAXDriver.prototype.setLexicalHandler = function(hnd) {

    this.m_hndLex = hnd;

}


    /**
    * LOCATOR/PARSE EXCEPTION INTERFACE
    ***/

SAXDriver.prototype.getColumnNumber = function() {

    return this.m_parser.getColumnNumber();

}


SAXDriver.prototype.getLineNumber = function() {

    return this.m_parser.getLineNumber();

}


SAXDriver.prototype.getMessage = function() {

    return this.m_strErrMsg;

}


SAXDriver.prototype.getPublicId = function() {

    return null;

}


SAXDriver.prototype.getSystemId = function() {

    return null;

}


    /***
    * Attribute List Interface
    **/

SAXDriver.prototype.getLength = function() {

    return this.m_parser.getAttributeCount();

}


SAXDriver.prototype.getName = function(index) {

    return this.m_parser.getAttributeName(index);

}


SAXDriver.prototype.getValue = function(index) {

    return this.m_parser.getAttributeValue(index);

}


SAXDriver.prototype.getValueByName = function(name) {

    return this.m_parser.getAttributeValueByName(name);

}


    /***
    *    Private functions
    **/

SAXDriver.prototype._fireError = function(strMsg) {
    this.m_strErrMsg = strMsg;
    this.m_bErr = true;

    if(this.m_hndErr && this.m_hndErr.fatalError) {
        this.m_hndErr.fatalError(this);
    }

}   // end function _fireError


SAXDriver.prototype._fireEvent = function(iEvt) {
    var hnd, func, args = arguments, iLen = args.length - 1;

    if(this.m_bErr) return;

    if(SAXDriver.DOC_B == iEvt) {
        func = "startDocument";         hnd = this.m_hndDoc;
    }
    else if (SAXDriver.DOC_E == iEvt) {
        func = "endDocument";           hnd = this.m_hndDoc;
    }
    else if (SAXDriver.ELM_B == iEvt) {
        func = "startElement";          hnd = this.m_hndDoc;
    }
    else if (SAXDriver.ELM_E == iEvt) {
        func = "endElement";            hnd = this.m_hndDoc;
    }
    else if (SAXDriver.CHARS == iEvt) {
        func = "characters";            hnd = this.m_hndDoc;
    }
    else if (SAXDriver.PI    == iEvt) {
        func = "processingInstruction"; hnd = this.m_hndDoc;
    }
    else if (SAXDriver.CD_B  == iEvt) {
        func = "startCDATA";            hnd = this.m_hndLex;
    }
    else if (SAXDriver.CD_E  == iEvt) {
        func = "endCDATA";              hnd = this.m_hndLex;
    }
    else if (SAXDriver.CMNT  == iEvt) {
        func = "comment";               hnd = this.m_hndLex;
    }

    if(hnd && hnd[func]) {
        if(0 == iLen) {
            hnd[func]();
        }
        else if (1 == iLen) {
            hnd[func](args[1]);
        }
        else if (2 == iLen) {
            hnd[func](args[1], args[2]);
        }
        else if (3 == iLen) {
            hnd[func](args[1], args[2], args[3]);
        }
    }

}  // end function _fireEvent


SAXDriver.prototype._parseLoop = function(parser) {
    var iEvent, parser;

    parser = this.m_parser;
    while(!this.m_bErr) {
        iEvent = parser.next();

        if(iEvent == XMLP._ELM_B) {
            this._fireEvent(SAXDriver.ELM_B, parser.getName(), this);
        }
        else if(iEvent == XMLP._ELM_E) {
            this._fireEvent(SAXDriver.ELM_E, parser.getName());
        }
        else if(iEvent == XMLP._ELM_EMP) {
            this._fireEvent(SAXDriver.ELM_B, parser.getName(), this);
            this._fireEvent(SAXDriver.ELM_E, parser.getName());
        }
        else if(iEvent == XMLP._TEXT) {
            this._fireEvent(SAXDriver.CHARS, parser.getContent(), parser.getContentBegin(), parser.getContentEnd() - parser.getContentBegin());
        }
        else if(iEvent == XMLP._ENTITY) {
            this._fireEvent(SAXDriver.CHARS, parser.getContent(), parser.getContentBegin(), parser.getContentEnd() - parser.getContentBegin());
        }
        else if(iEvent == XMLP._PI) {
            this._fireEvent(SAXDriver.PI, parser.getName(), parser.getContent().substring(parser.getContentBegin(), parser.getContentEnd()));
        }
        else if(iEvent == XMLP._CDATA) {
            this._fireEvent(SAXDriver.CD_B);
            this._fireEvent(SAXDriver.CHARS, parser.getContent(), parser.getContentBegin(), parser.getContentEnd() - parser.getContentBegin());
            this._fireEvent(SAXDriver.CD_E);
        }
        else if(iEvent == XMLP._COMMENT) {
            this._fireEvent(SAXDriver.CMNT, parser.getContent(), parser.getContentBegin(), parser.getContentEnd() - parser.getContentBegin());
        }
        else if(iEvent == XMLP._DTD) {
        }
        else if(iEvent == XMLP._ERROR) {
            this._fireError(parser.getContent());
        }
        else if(iEvent == XMLP._NONE) {
            return;
        }
    }

}  // end function _parseLoop

/**
*   function:   SAXStrings
*   Author:   Scott Severtson
*   Description: a useful object containing string manipulation functions
**/

var _SAXStrings = function() {};


_SAXStrings.WHITESPACE = " \t\n\r";
_SAXStrings.NONWHITESPACE = /\S/;
_SAXStrings.QUOTES = "\"'";


_SAXStrings.prototype.getColumnNumber = function(strD, iP) {
    if((strD === null) || (strD.length === 0)) {
        return -1;
    }
    iP = iP || strD.length;

    var arrD = strD.substring(0, iP).split("\n");
    var strLine = arrD[arrD.length - 1];
    arrD.length--;
    var iLinePos = arrD.join("\n").length;

    return iP - iLinePos;

}  // end function getColumnNumber


_SAXStrings.prototype.getLineNumber = function(strD, iP) {
    if((strD === null) || (strD.length === 0)) {
        return -1;
    }
    iP = iP || strD.length;

    return strD.substring(0, iP).split("\n").length
}  // end function getLineNumber


_SAXStrings.prototype.indexOfNonWhitespace = function(strD, iB, iE) {
    if((strD === null) || (strD.length === 0)) {
        return -1;
    }
    iB = iB || 0;
    iE = iE || strD.length;

    //var i = strD.substring(iB, iE).search(_SAXStrings.NONWHITESPACE);
    //return i < 0 ? i : iB + i;

    while( strD.charCodeAt(iB++) < 33 );
    return (iB > iE)?-1:iB-1;
    /*for(var i = iB; i < iE; i++){
        if(_SAXStrings.WHITESPACE.indexOf(strD.charAt(i)) == -1) {
            return i;
        }
    }
    return -1;*/

}  // end function indexOfNonWhitespace


_SAXStrings.prototype.indexOfWhitespace = function(strD, iB, iE) {
    if((strD === null) || (strD.length === 0)) {
        return -1;
    }
    iB = iB || 0;
    iE = iE || strD.length;


    while( strD.charCodeAt(iB++) >= 33 );
    return (iB > iE)?-1:iB-1;

    /*for(var i = iB; i < iE; i++) {
        if(_SAXStrings.WHITESPACE.indexOf(strD.charAt(i)) != -1) {
            return i;
        }
    }
    return -1;*/
}  // end function indexOfWhitespace


_SAXStrings.prototype.isEmpty = function(strD) {

    return (strD == null) || (strD.length == 0);

}


_SAXStrings.prototype.lastIndexOfNonWhitespace = function(strD, iB, iE) {
    if((strD === null) || (strD.length === 0)) {
        return -1;
    }
    iB = iB || 0;
    iE = iE || strD.length;

    while( (iE >= iB) && strD.charCodeAt(--iE) < 33 );
    return (iE < iB)?-1:iE;

    /*for(var i = iE - 1; i >= iB; i--){
        if(_SAXStrings.WHITESPACE.indexOf(strD.charAt(i)) == -1){
            return i;
        }
    }
    return -1;*/
}


_SAXStrings.prototype.replace = function(strD, iB, iE, strF, strR) {
    if((strD == null) || (strD.length == 0)) {
        return "";
    }
    iB = iB || 0;
    iE = iE || strD.length;

    return strD.substring(iB, iE).split(strF).join(strR);

};

var SAXStrings = new _SAXStrings();



/***************************************************************************************************************
Stack: A simple stack class, used for verifying document structure.

    Author:   Scott Severtson
*****************************************************************************************************************/

var Stack = function() {
    this.m_arr = new Array();
};
__extend__(Stack.prototype, {
    clear : function() {
        this.m_arr = new Array();
    },
    count : function() {
        return this.m_arr.length;
    },
    destroy : function() {
        this.m_arr = null;
    },
    peek : function() {
        if(this.m_arr.length == 0) {
            return null;
        }
        return this.m_arr[this.m_arr.length - 1];
    },
    pop : function() {
        if(this.m_arr.length == 0) {
            return null;
        }
        var o = this.m_arr[this.m_arr.length - 1];
        this.m_arr.length--;
        return o;
    },
    push : function(o) {
        this.m_arr[this.m_arr.length] = o;
    }
});


/**
* function: isEmpty
* Author: mike@idle.org
* Description:  convenience function to identify an empty string
**/
function isEmpty(str) {
    return (str==null) || (str.length==0);
};


/**
 * function __escapeXML__
 * author: David Joham djoham@yahoo.com
 * @param  str : string - The string to be escaped
 * @return : string - The escaped string
 */
var escAmpRegEx = /&/g;
var escLtRegEx = /</g;
var escGtRegEx = />/g;
var quotRegEx = /"/g;
var aposRegEx = /'/g;
function __escapeXML__(str) {
    str = str.replace(escAmpRegEx, "&amp;").
            replace(escLtRegEx, "&lt;").
            replace(escGtRegEx, "&gt;").
            replace(quotRegEx, "&quot;").
            replace(aposRegEx, "&apos;");

    return str;
};

/**
 * function __unescapeXML__
 * author: David Joham djoham@yahoo.com
 * @param  str : string - The string to be unescaped
 * @return : string - The unescaped string
 */
var unescAmpRegEx = /&amp;/g;
var unescLtRegEx = /&lt;/g;
var unescGtRegEx = /&gt;/g;
var unquotRegEx = /&quot;/g;
var unaposRegEx = /&apos;/g;
function __unescapeXML__(str) {
    str = str.replace(unescAmpRegEx, "&").
            replace(unescLtRegEx, "<").
            replace(unescGtRegEx, ">").
            replace(unquotRegEx, "\"").
            replace(unaposRegEx, "'");

    return str;
};

//DOMImplementation
$debug("Defining DOMImplementation");
$w.__defineGetter__("DOMImplementation", function(){
  return function(){
    throw new Error("Object cannot be created in this context");
  };
});

/**
 * @class  DOMImplementation - provides a number of methods for performing operations
 *   that are independent of any particular instance of the document object model.
 *
 * @author Jon van Noort (jon@webarcana.com.au)
 */
var DOMImplementation = function() {
    this.preserveWhiteSpace = false;  // by default, ignore whitespace
    this.namespaceAware = true;       // by default, handle namespaces
    this.errorChecking  = true;       // by default, test for exceptions
};
__extend__(DOMImplementation.prototype,{
    // @param  feature : string - The package name of the feature to test.
    //      the legal only values are "XML" and "CORE" (case-insensitive).
    // @param  version : string - This is the version number of the package
    //       name to test. In Level 1, this is the string "1.0".*
    // @return : boolean
    hasFeature : function(feature, version) {
        var ret = false;
        if (feature.toLowerCase() == "xml") {
            ret = (!version || (version == "1.0") || (version == "2.0"));
        }
        else if (feature.toLowerCase() == "core") {
            ret = (!version || (version == "2.0"));
        }
        return ret;
    },
    createDocumentType : function(qname, publicid, systemid){
        return new DOMDocumentType();
    },
    createDocument : function(nsuri, qname, doctype){
      //TODO - this currently returns an empty doc
      //but needs to handle the args
        return new HTMLDocument($implementation);
    },
    translateErrCode : function(code) {
        //convert DOMException Code to human readable error message;
      var msg = "";

      switch (code) {
        case DOMException.INDEX_SIZE_ERR :                // 1
           msg = "INDEX_SIZE_ERR: Index out of bounds";
           break;

        case DOMException.DOMSTRING_SIZE_ERR :            // 2
           msg = "DOMSTRING_SIZE_ERR: The resulting string is too long to fit in a DOMString";
           break;

        case DOMException.HIERARCHY_REQUEST_ERR :         // 3
           msg = "HIERARCHY_REQUEST_ERR: The Node can not be inserted at this location";
           break;

        case DOMException.WRONG_DOCUMENT_ERR :            // 4
           msg = "WRONG_DOCUMENT_ERR: The source and the destination Documents are not the same";
           break;

        case DOMException.INVALID_CHARACTER_ERR :         // 5
           msg = "INVALID_CHARACTER_ERR: The string contains an invalid character";
           break;

        case DOMException.NO_DATA_ALLOWED_ERR :           // 6
           msg = "NO_DATA_ALLOWED_ERR: This Node / NodeList does not support data";
           break;

        case DOMException.NO_MODIFICATION_ALLOWED_ERR :   // 7
           msg = "NO_MODIFICATION_ALLOWED_ERR: This object cannot be modified";
           break;

        case DOMException.NOT_FOUND_ERR :                 // 8
           msg = "NOT_FOUND_ERR: The item cannot be found";
           break;

        case DOMException.NOT_SUPPORTED_ERR :             // 9
           msg = "NOT_SUPPORTED_ERR: This implementation does not support function";
           break;

        case DOMException.INUSE_ATTRIBUTE_ERR :           // 10
           msg = "INUSE_ATTRIBUTE_ERR: The Attribute has already been assigned to another Element";
           break;

        // Introduced in DOM Level 2:
        case DOMException.INVALID_STATE_ERR :             // 11
           msg = "INVALID_STATE_ERR: The object is no longer usable";
           break;

        case DOMException.SYNTAX_ERR :                    // 12
           msg = "SYNTAX_ERR: Syntax error";
           break;

        case DOMException.INVALID_MODIFICATION_ERR :      // 13
           msg = "INVALID_MODIFICATION_ERR: Cannot change the type of the object";
           break;

        case DOMException.NAMESPACE_ERR :                 // 14
           msg = "NAMESPACE_ERR: The namespace declaration is incorrect";
           break;

        case DOMException.INVALID_ACCESS_ERR :            // 15
           msg = "INVALID_ACCESS_ERR: The object does not support this function";
           break;

        default :
           msg = "UNKNOWN: Unknown Exception Code ("+ code +")";
      }

      return msg;
    }
});


/**
* Defined 'globally' to this scope.  Remember everything is wrapped in a closure so this doesnt show up
* in the outer most global scope.
*/

/**
 *  process SAX events
 *
 * @author Jon van Noort (jon@webarcana.com.au), David Joham (djoham@yahoo.com) and Scott Severtson
 *
 * @param  impl : DOMImplementation
 * @param  doc : DOMDocument - the Document to contain the parsed XML string
 * @param  p   : XMLP        - the SAX Parser
 *
 * @return : DOMDocument
 */
function __parseLoop__(impl, doc, p) {
    var iEvt, iNode, iAttr, strName;
    var iNodeParent = doc;

    var el_close_count = 0;

    var entitiesList = new Array();
    var textNodesList = new Array();

    // if namespaceAware, add default namespace
    if (impl.namespaceAware) {
        var iNS = doc.createNamespace(""); // add the default-default namespace
        iNS.value = "http://www.w3.org/2000/xmlns/";
        doc._namespaces.setNamedItem(iNS);
    }

  // loop until SAX parser stops emitting events
  while(true) {
    // get next event
    iEvt = p.next();

    if (iEvt == XMLP._ELM_B) {                      // Begin-Element Event
      var pName = p.getName();                      // get the Element name
      pName = trim(pName, true, true);              // strip spaces from Element name
      if(pName.toLowerCase() == 'script')
        p.replaceEntities = false;

      if (!impl.namespaceAware) {
        iNode = doc.createElement(p.getName());     // create the Element

        // add attributes to Element
        for(var i = 0; i < p.getAttributeCount(); i++) {
          strName = p.getAttributeName(i);          // get Attribute name
          iAttr = iNode.getAttributeNode(strName);  // if Attribute exists, use it

          if(!iAttr) {
            iAttr = doc.createAttribute(strName);   // otherwise create it
          }

          iAttr.value = p.getAttributeValue(i);   // set Attribute value
          iNode.setAttributeNode(iAttr);            // attach Attribute to Element
        }
      }
      else {  // Namespace Aware
        // create element (with empty namespaceURI,
        //  resolve after namespace 'attributes' have been parsed)
        iNode = doc.createElementNS("", p.getName());

        // duplicate ParentNode's Namespace definitions
        iNode._namespaces = __cloneNamedNodes__(iNodeParent._namespaces, iNode);

        // add attributes to Element
        for(var i = 0; i < p.getAttributeCount(); i++) {
          strName = p.getAttributeName(i);          // get Attribute name

          // if attribute is a namespace declaration
          if (__isNamespaceDeclaration__(strName)) {
            // parse Namespace Declaration
            var namespaceDec = __parseNSName__(strName);

            if (strName != "xmlns") {
              iNS = doc.createNamespace(strName);   // define namespace
            }
            else {
              iNS = doc.createNamespace("");        // redefine default namespace
            }
            iNS.value = p.getAttributeValue(i);   // set value = namespaceURI

            iNode._namespaces.setNamedItem(iNS);    // attach namespace to namespace collection
          }
          else {  // otherwise, it is a normal attribute
            iAttr = iNode.getAttributeNode(strName);        // if Attribute exists, use it

            if(!iAttr) {
              iAttr = doc.createAttributeNS("", strName);   // otherwise create it
            }

            iAttr.value = p.getAttributeValue(i);         // set Attribute value
            iNode.setAttributeNodeNS(iAttr);                // attach Attribute to Element

            if (__isIdDeclaration__(strName)) {
              iNode.id = p.getAttributeValue(i);    // cache ID for getElementById()
            }
          }
        }

        // resolve namespaceURIs for this Element
        if (iNode._namespaces.getNamedItem(iNode.prefix)) {
          iNode.namespaceURI = iNode._namespaces.getNamedItem(iNode.prefix).value;
        }

        //  for this Element's attributes
        for (var i = 0; i < iNode.attributes.length; i++) {
          if (iNode.attributes.item(i).prefix != "") {  // attributes do not have a default namespace
            if (iNode._namespaces.getNamedItem(iNode.attributes.item(i).prefix)) {
              iNode.attributes.item(i).namespaceURI = iNode._namespaces.getNamedItem(iNode.attributes.item(i).prefix).value;
            }
          }
        }
      }

      // if this is the Root Element
      if (iNodeParent.nodeType == DOMNode.DOCUMENT_NODE) {
        iNodeParent.documentElement = iNode;        // register this Element as the Document.documentElement
      }

      iNodeParent.appendChild(iNode);               // attach Element to parentNode
      iNodeParent = iNode;                          // descend one level of the DOM Tree
    }

    else if(iEvt == XMLP._ELM_E) {                  // End-Element Event
      //handle script tag
      if(iNodeParent.nodeName.toLowerCase() == 'script'){
         p.replaceEntities = true;
         $policy.loadScript(iNodeParent, p);
      }
      iNodeParent = iNodeParent.parentNode;         // ascend one level of the DOM Tree

    }

    else if(iEvt == XMLP._ELM_EMP) {                // Empty Element Event
      pName = p.getName();                          // get the Element name
      pName = trim(pName, true, true);              // strip spaces from Element name

      if (!impl.namespaceAware) {
        iNode = doc.createElement(pName);           // create the Element

        // add attributes to Element
        for(var i = 0; i < p.getAttributeCount(); i++) {
          strName = p.getAttributeName(i);          // get Attribute name
          iAttr = iNode.getAttributeNode(strName);  // if Attribute exists, use it

          if(!iAttr) {
            iAttr = doc.createAttribute(strName);   // otherwise create it
          }

          iAttr.value = p.getAttributeValue(i);   // set Attribute value
          iNode.setAttributeNode(iAttr);            // attach Attribute to Element
        }
      }
      else {  // Namespace Aware
        // create element (with empty namespaceURI,
        //  resolve after namespace 'attributes' have been parsed)
        iNode = doc.createElementNS("", p.getName());

        // duplicate ParentNode's Namespace definitions
        iNode._namespaces = __cloneNamedNodes__(iNodeParent._namespaces, iNode);

        // add attributes to Element
        for(var i = 0; i < p.getAttributeCount(); i++) {
          strName = p.getAttributeName(i);          // get Attribute name

          // if attribute is a namespace declaration
          if (__isNamespaceDeclaration__(strName)) {
            // parse Namespace Declaration
            var namespaceDec = __parseNSName__(strName);

            if (strName != "xmlns") {
              iNS = doc.createNamespace(strName);   // define namespace
            }
            else {
              iNS = doc.createNamespace("");        // redefine default namespace
            }
            iNS.value = p.getAttributeValue(i);   // set value = namespaceURI

            iNode._namespaces.setNamedItem(iNS);    // attach namespace to namespace collection
          }
          else {  // otherwise, it is a normal attribute
            iAttr = iNode.getAttributeNode(strName);        // if Attribute exists, use it

            if(!iAttr) {
              iAttr = doc.createAttributeNS("", strName);   // otherwise create it
            }

            iAttr.value = p.getAttributeValue(i);         // set Attribute value
            iNode.setAttributeNodeNS(iAttr);                // attach Attribute to Element

            if (__isIdDeclaration__(strName)) {
              iNode.id = p.getAttributeValue(i);    // cache ID for getElementById()
            }
          }
        }

        // resolve namespaceURIs for this Element
        if (iNode._namespaces.getNamedItem(iNode.prefix)) {
          iNode.namespaceURI = iNode._namespaces.getNamedItem(iNode.prefix).value;
        }

        //  for this Element's attributes
        for (var i = 0; i < iNode.attributes.length; i++) {
          if (iNode.attributes.item(i).prefix != "") {  // attributes do not have a default namespace
            if (iNode._namespaces.getNamedItem(iNode.attributes.item(i).prefix)) {
              iNode.attributes.item(i).namespaceURI = iNode._namespaces.getNamedItem(iNode.attributes.item(i).prefix).value;
            }
          }
        }
      }

      // if this is the Root Element
      if (iNodeParent.nodeType == DOMNode.DOCUMENT_NODE) {
        iNodeParent.documentElement = iNode;        // register this Element as the Document.documentElement
      }

      iNodeParent.appendChild(iNode);               // attach Element to parentNode
    }
    else if(iEvt == XMLP._TEXT || iEvt == XMLP._ENTITY) {                   // TextNode and entity Events
      // get Text content
      var pContent = p.getContent().substring(p.getContentBegin(), p.getContentEnd());

      if (!impl.preserveWhiteSpace ) {
        if (trim(pContent, true, true) == "") {
            pContent = ""; //this will cause us not to create the text node below
        }
      }

      if (pContent.length > 0) {                    // ignore empty TextNodes
        var textNode = doc.createTextNode(pContent);
        iNodeParent.appendChild(textNode); // attach TextNode to parentNode

        //the sax parser breaks up text nodes when it finds an entity. For
        //example hello&lt;there will fire a text, an entity and another text
        //this sucks for the dom parser because it looks to us in this logic
        //as three text nodes. I fix this by keeping track of the entity nodes
        //and when we're done parsing, calling normalize on their parent to
        //turn the multiple text nodes into one, which is what DOM users expect
        //the code to do this is at the bottom of this function
        if (iEvt == XMLP._ENTITY) {
            entitiesList[entitiesList.length] = textNode;
        }
        else {
            //I can't properly decide how to handle preserve whitespace
            //until the siblings of the text node are built due to
            //the entitiy handling described above. I don't know that this
            //will be all of the text node or not, so trimming is not appropriate
            //at this time. Keep a list of all the text nodes for now
            //and we'll process the preserve whitespace stuff at a later time.
            textNodesList[textNodesList.length] = textNode;
        }
      }
    }
    else if(iEvt == XMLP._PI) {                     // ProcessingInstruction Event
      // attach ProcessingInstruction to parentNode
      iNodeParent.appendChild(doc.createProcessingInstruction(p.getName(), p.getContent().substring(p.getContentBegin(), p.getContentEnd())));
    }
    else if(iEvt == XMLP._CDATA) {                  // CDATA Event
      // get CDATA data
      pContent = p.getContent().substring(p.getContentBegin(), p.getContentEnd());

      if (!impl.preserveWhiteSpace) {
        pContent = trim(pContent, true, true);      // trim whitespace
        pContent.replace(/ +/g, ' ');               // collapse multiple spaces to 1 space
      }

      if (pContent.length > 0) {                    // ignore empty CDATANodes
        iNodeParent.appendChild(doc.createCDATASection(pContent)); // attach CDATA to parentNode
      }
    }
    else if(iEvt == XMLP._COMMENT) {                // Comment Event
      // get COMMENT data
      var pContent = p.getContent().substring(p.getContentBegin(), p.getContentEnd());

      if (!impl.preserveWhiteSpace) {
        pContent = trim(pContent, true, true);      // trim whitespace
        pContent.replace(/ +/g, ' ');               // collapse multiple spaces to 1 space
      }

      if (pContent.length > 0) {                    // ignore empty CommentNodes
        iNodeParent.appendChild(doc.createComment(pContent));  // attach Comment to parentNode
      }
    }
    else if(iEvt == XMLP._DTD) {                    // ignore DTD events
    }
    else if(iEvt == XMLP._ERROR) {
        $error("Fatal Error: " + p.getContent() +
                "\nLine: " + p.getLineNumber() +
                "\nColumn: " + p.getColumnNumber() + "\n");
        throw(new DOMException(DOMException.SYNTAX_ERR));
    }
    else if(iEvt == XMLP._NONE) {                   // no more events
      if (iNodeParent == doc) {                     // confirm that we have recursed back up to root
        break;
      }
      else {
        throw(new DOMException(DOMException.SYNTAX_ERR));  // one or more Tags were not closed properly
      }
    }
  }

  //normalize any entities in the DOM to a single textNode
  for (var i = 0; i < entitiesList.length; i++) {
      var entity = entitiesList[i];
      //its possible (if for example two entities were in the
      //same domnode, that the normalize on the first entitiy
      //will remove the parent for the second. Only do normalize
      //if I can find a parent node
      var parentNode = entity.parentNode;
      if (parentNode) {
          parentNode.normalize();

          //now do whitespace (if necessary)
          //it was not done for text nodes that have entities
          if(!impl.preserveWhiteSpace) {
                var children = parentNode.childNodes;
                for ( var j = 0; j < children.length; j++) {
                    var child = children.item(j);
                    if (child.nodeType == DOMNode.TEXT_NODE) {
                        var childData = child.data;
                        childData.replace(/\s/g, ' ');
                        child.data = childData;
                    }
                }
          }
      }
  }

  //do the preserve whitespace processing on the rest of the text nodes
  //It's possible (due to the processing above) that the node will have been
  //removed from the tree. Only do whitespace checking if parentNode is not null.
  //This may duplicate the whitespace processing for some nodes that had entities in them
  //but there's no way around that
  if (!impl.preserveWhiteSpace) {
    for (var i = 0; i < textNodesList.length; i++) {
        var node = textNodesList[i];
        if (node.parentNode != null) {
            var nodeData = node.data;
            nodeData.replace(/\s/g, ' ');
            node.data = nodeData;
        }
    }

  }
};


/**
 * @method DOMImplementation._isNamespaceDeclaration - Return true, if attributeName is a namespace declaration
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  attributeName : string - the attribute name
 * @return : boolean
 */
function __isNamespaceDeclaration__(attributeName) {
  // test if attributeName is 'xmlns'
  return (attributeName.indexOf('xmlns') > -1);
};

/**
 * @method DOMImplementation._isIdDeclaration - Return true, if attributeName is an id declaration
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  attributeName : string - the attribute name
 * @return : boolean
 */
function __isIdDeclaration__(attributeName) {
  // test if attributeName is 'id' (case insensitive)
  return (attributeName.toLowerCase() == 'id');
};

/**
 * @method DOMImplementation._isValidName - Return true,
 *   if name contains no invalid characters
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  name : string - the candidate name
 * @return : boolean
 */
function __isValidName__(name) {
  // test if name contains only valid characters
  return name.match(re_validName);
};
var re_validName = /^[a-zA-Z_:][a-zA-Z0-9\.\-_:]*$/;

/**
 * @method DOMImplementation._isValidString - Return true, if string does not contain any illegal chars
 *  All of the characters 0 through 31 and character 127 are nonprinting control characters.
 *  With the exception of characters 09, 10, and 13, (Ox09, Ox0A, and Ox0D)
 *  Note: different from _isValidName in that ValidStrings may contain spaces
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  name : string - the candidate string
 * @return : boolean
 */
function __isValidString__(name) {
  // test that string does not contains invalid characters
  return (name.search(re_invalidStringChars) < 0);
};
var re_invalidStringChars = /\x01|\x02|\x03|\x04|\x05|\x06|\x07|\x08|\x0B|\x0C|\x0E|\x0F|\x10|\x11|\x12|\x13|\x14|\x15|\x16|\x17|\x18|\x19|\x1A|\x1B|\x1C|\x1D|\x1E|\x1F|\x7F/;

/**
 * @method DOMImplementation._parseNSName - parse the namespace name.
 *  if there is no colon, the
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  qualifiedName : string - The qualified name
 * @return : NSName - [
         .prefix        : string - The prefix part of the qname
         .namespaceName : string - The namespaceURI part of the qname
    ]
 */
function __parseNSName__(qualifiedName) {
  var resultNSName = new Object();

  resultNSName.prefix          = qualifiedName;  // unless the qname has a namespaceName, the prefix is the entire String
  resultNSName.namespaceName   = "";

  // split on ':'
  var delimPos = qualifiedName.indexOf(':');
  if (delimPos > -1) {
    // get prefix
    resultNSName.prefix        = qualifiedName.substring(0, delimPos);
    // get namespaceName
    resultNSName.namespaceName = qualifiedName.substring(delimPos +1, qualifiedName.length);
  }
  return resultNSName;
};

/**
 * @method DOMImplementation._parseQName - parse the qualified name
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  qualifiedName : string - The qualified name
 * @return : QName
 */
function __parseQName__(qualifiedName) {
  var resultQName = new Object();

  resultQName.localName = qualifiedName;  // unless the qname has a prefix, the local name is the entire String
  resultQName.prefix    = "";

  // split on ':'
  var delimPos = qualifiedName.indexOf(':');

  if (delimPos > -1) {
    // get prefix
    resultQName.prefix    = qualifiedName.substring(0, delimPos);

    // get localName
    resultQName.localName = qualifiedName.substring(delimPos +1, qualifiedName.length);
  }

  return resultQName;
};

$debug("Initializing document.implementation");
var $implementation =  new DOMImplementation();
$implementation.namespaceAware = false;
$implementation.errorChecking = false;$debug("Defining Document");
/*
* Document - DOM Level 2
*  The Document object is not directly 
*/
$w.__defineGetter__('Document', function(){
  return function(){
    throw new Error("Object cannot be created in this context");
  };
});


/**
 * @class  DOMDocument - The Document interface represents the entire HTML or XML document.
 *   Conceptually, it is the root of the document tree, and provides the primary access to the document's data.
 *
 * @extends DOMNode
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  implementation : DOMImplementation - the creator Implementation
 */
var DOMDocument = function(implementation) {
    //$log("\tcreating dom document");
    this.DOMNode = DOMNode;
    this.DOMNode(this);
    
    this.doctype = null;                  // The Document Type Declaration (see DocumentType) associated with this document
    this.implementation = implementation; // The DOMImplementation object that handles this document.
    this.documentElement = null;          // This is a convenience attribute that allows direct access to the child node that is the root element of the document
    
    this.nodeName  = "#document";
    this._id = 0;
    this._lastId = 0;
    this._parseComplete = false;                   // initially false, set to true by parser
    this._url = "";
    
    this.ownerDocument = null;
    
    this._performingImportNodeOperation = false;
    //$log("\tfinished creating dom document " + this);
};
DOMDocument.prototype = new DOMNode;
__extend__(DOMDocument.prototype, {	
    addEventListener        : function(){ window.addEventListener.apply(this, arguments); },
	removeEventListener     : function(){ window.removeEventListener.apply(this, arguments); },
	attachEvent             : function(){ window.addEventListener.apply(this, arguments); },
	detachEvent             : function(){ window.removeEventListener.apply(this, arguments); },
	dispatchEvent           : function(){ window.dispatchEvent.apply(this, arguments); },

    get styleSheets(){ 
        return [];/*TODO*/ 
    },
    get all(){
        return this.getElementsByTagName("*");
    },
    loadXML : function(xmlStr) {
        // create SAX Parser
        var parser = new XMLP(xmlStr+'');
        
        // create DOM Document
        var doc = new HTMLDocument(this.implementation);
        if(this === $document){
            $debug("Setting internal window.document");
            $document = doc;
        }
        // populate Document with Parsed Nodes
        try {
            __parseLoop__(this.implementation, doc, parser);
            //doc = html2dom(xmlStr+"", doc);
        	//$log("\nhtml2xml\n" + doc.xml);
        } catch (e) {
            //$error(this.implementation.translateErrCode(e.code))
            $error(e);
        }

        // set parseComplete flag, (Some validation Rules are relaxed if this is false)
        doc._parseComplete = true;
        return doc;
    },
    load: function(url){
		$debug("Loading url into DOM Document: "+ url + " - (Asynch? "+$w.document.async+")");
        var scripts, _this = this;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, $w.document.async);
        xhr.onreadystatechange = function(){
            try{
        	    _this.loadXML(xhr.responseText);
            }catch(e){
                $error("Error Parsing XML - ",e);
                _this.loadXML(
                "<html><head></head><body>"+
                    "<h1>Parse Error</h1>"+
                    "<p>"+e.toString()+"</p>"+  
                "</body></html>");
            }
            _this._url = url;
            
        	$info("Sucessfully loaded document at "+url);
        	var event = document.createEvent();
        	event.initEvent("load");
        	$w.dispatchEvent( event );
        };
        xhr.send();
    },
	createEvent             : function(eventType){ 
        var event;
        if(eventType === "UIEvents"){ event = new UIEvent();}
        else if(eventType === "MouseEvents"){ event = new MouseEvent();}
        else{ event = new Event(); } 
        return event;
    },
    createExpression        : function(xpath, nsuriMap){ 
        return null;/*TODO*/
    },
    createElement : function(tagName) {
          //$debug("DOMDocument.createElement( "+tagName+" )");
          // throw Exception if the tagName string contains an illegal character
          if (__ownerDocument__(this).implementation.errorChecking 
            && (!__isValidName__(tagName))) {
            throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
          }
        
          // create DOMElement specifying 'this' as ownerDocument
          var node = new DOMElement(this);
        
          // assign values to properties (and aliases)
          node.tagName  = tagName;
        
          return node;
    },
    createDocumentFragment : function() {
          // create DOMDocumentFragment specifying 'this' as ownerDocument
          var node = new DOMDocumentFragment(this);
          return node;
    },
    createTextNode: function(data) {
          // create DOMText specifying 'this' as ownerDocument
          var node = new DOMText(this);
        
          // assign values to properties (and aliases)
          node.data      = data;
        
          return node;
    },
    createComment : function(data) {
          // create DOMComment specifying 'this' as ownerDocument
          var node = new DOMComment(this);
        
          // assign values to properties (and aliases)
          node.data      = data;
        
          return node;
    },
    createCDATASection : function(data) {
          // create DOMCDATASection specifying 'this' as ownerDocument
          var node = new DOMCDATASection(this);
        
          // assign values to properties (and aliases)
          node.data      = data;
        
          return node;
    },
    createProcessingInstruction : function(target, data) {
          // throw Exception if the target string contains an illegal character
          //$log("DOMDocument.createProcessingInstruction( "+target+" )");
          if (__ownerDocument__(this).implementation.errorChecking 
            && (!__isValidName__(target))) {
            throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
          }
        
          // create DOMProcessingInstruction specifying 'this' as ownerDocument
          var node = new DOMProcessingInstruction(this);
        
          // assign values to properties (and aliases)
          node.target    = target;
          node.data      = data;
        
          return node;
    },
    createAttribute : function(name) {
        // throw Exception if the name string contains an illegal character
        //$log("DOMDocument.createAttribute( "+target+" )");
        if (__ownerDocument__(this).implementation.errorChecking 
            && (!__isValidName__(name))) {
            throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
        }
        
        // create DOMAttr specifying 'this' as ownerDocument
        var node = new DOMAttr(this);
        
        // assign values to properties (and aliases)
        node.name     = name;
        
        return node;
    },
    createElementNS : function(namespaceURI, qualifiedName) {
        //$log("DOMDocument.createElement( "+namespaceURI+", "+qualifiedName+" )");
          // test for exceptions
          if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if the Namespace is invalid
            if (!__isValidNamespace__(this, namespaceURI, qualifiedName)) {
              throw(new DOMException(DOMException.NAMESPACE_ERR));
            }
        
            // throw Exception if the qualifiedName string contains an illegal character
            if (!__isValidName__(qualifiedName)) {
              throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
            }
          }
        
          // create DOMElement specifying 'this' as ownerDocument
          var node  = new DOMElement(this);
          var qname = __parseQName__(qualifiedName);
        
          // assign values to properties (and aliases)
          node.namespaceURI = namespaceURI;
          node.prefix       = qname.prefix;
          node.localName    = qname.localName;
          node.tagName      = qualifiedName;
        
          return node;
    },
    createAttributeNS : function(namespaceURI, qualifiedName) {
          // test for exceptions
          if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if the Namespace is invalid
            if (!__isValidNamespace__(this, namespaceURI, qualifiedName, true)) {
              throw(new DOMException(DOMException.NAMESPACE_ERR));
            }
        
            // throw Exception if the qualifiedName string contains an illegal character
            if (!__isValidName__(qualifiedName)) {
              throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
            }
          }
        
          // create DOMAttr specifying 'this' as ownerDocument
          var node  = new DOMAttr(this);
          var qname = __parseQName__(qualifiedName);
        
          // assign values to properties (and aliases)
          node.namespaceURI = namespaceURI;
          node.prefix       = qname.prefix;
          node.localName    = qname.localName;
          node.name         = qualifiedName;
          node.nodeValue    = "";
        
          return node;
    },
    createNamespace : function(qualifiedName) {
          // create DOMNamespace specifying 'this' as ownerDocument
          var node  = new DOMNamespace(this);
          var qname = __parseQName__(qualifiedName);
        
          // assign values to properties (and aliases)
          node.prefix       = qname.prefix;
          node.localName    = qname.localName;
          node.name         = qualifiedName;
          node.nodeValue    = "";
        
          return node;
    },
    getElementById : function(elementId) {
          var retNode = null,
              node;
          // loop through all Elements in the 'all' collection
          var all = this.all;
          for (var i=0; i < all.length; i++) {
            node = all[i];
            // if id matches & node is alive (ie, connected (in)directly to the documentElement)
            if (node.id == elementId) {
                if((__ownerDocument__(node).documentElement._id == this.documentElement._id)){
                    retNode = node;
                    //$log("Found node with id = " + node.id);
                    break;
                }
            }
          }
          
          //if(retNode == null){$log("Couldn't find id " + elementId);}
          return retNode;
    },
    normalizeDocument: function(){
	    this.documentElement.normalize();
    },
    get nodeType(){
        return DOMNode.DOCUMENT_NODE;
    },
    get xml(){
        //$log("Serializing " + this);
        return this.documentElement.xml;
    },
	toString: function(){ 
	    return "Document" +  (typeof this._url == "string" ? ": " + this._url : ""); 
    },
	get defaultView(){ //TODO: why isnt this just 'return $w;'?
		return { getComputedStyle: function(elem){
			return { getPropertyValue: function(prop){
				prop = prop.replace(/\-(\w)/g,function(m,c){ return c.toUpperCase(); });
				var val = elem.style[prop];
				if ( prop == "opacity" && val == "" ){ val = "1"; }return val;
			}};
		}};
	},
    _genId : function() {
          this._lastId += 1;                             // increment lastId (to generate unique id)
          return this._lastId;
    }
});


var __isValidNamespace__ = function(doc, namespaceURI, qualifiedName, isAttribute) {

      if (doc._performingImportNodeOperation == true) {
        //we're doing an importNode operation (or a cloneNode) - in both cases, there
        //is no need to perform any namespace checking since the nodes have to have been valid
        //to have gotten into the DOM in the first place
        return true;
      }
    
      var valid = true;
      // parse QName
      var qName = __parseQName__(qualifiedName);
    
    
      //only check for namespaces if we're finished parsing
      if (this._parseComplete == true) {
    
        // if the qualifiedName is malformed
        if (qName.localName.indexOf(":") > -1 ){
            valid = false;
        }
    
        if ((valid) && (!isAttribute)) {
            // if the namespaceURI is not null
            if (!namespaceURI) {
            valid = false;
            }
        }
    
        // if the qualifiedName has a prefix
        if ((valid) && (qName.prefix == "")) {
            valid = false;
        }
    
      }
    
      // if the qualifiedName has a prefix that is "xml" and the namespaceURI is
      //  different from "http://www.w3.org/XML/1998/namespace" [Namespaces].
      if ((valid) && (qName.prefix == "xml") && (namespaceURI != "http://www.w3.org/XML/1998/namespace")) {
        valid = false;
      }
    
      return valid;
};
/*
*	parser.js
*/
/*
 * HTML Parser By John Resig (ejohn.org)
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 *
 * // Use like so:
 * HTMLParser(htmlString, {
 *     start: function(tag, attrs, unary) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 * // or to get an XML string:
 * HTMLtoXML(htmlString);
 *
 * // or to get an XML DOM Document
 * HTMLtoDOM(htmlString);
 *
 * // or to inject into an existing document/DOM node
 * HTMLtoDOM(htmlString, document);
 * HTMLtoDOM(htmlString, document.body);
 *
 */
 var html2dom, html2xml;

(function(){

	// Regular Expressions for parsing tags and attributes
	var startTag = /^<([\w\:\-]+)((?:\s+[\w\:\-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
        endTag = /^<\/([\w\:\-]+)[^>]*>/,
        attr = /([\w\:\-]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g; 	
	// Empty Elements - HTML 4.01
	var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

	// Block Elements - HTML 4.01
	var block = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");

	// Inline Elements - HTML 4.01
	var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

	// Elements that you can, intentionally, leave open
	// (and which close themselves)
	var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

	// Attributes that have their values filled in disabled="disabled"
	var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

	// Special Elements (can contain anything)
	var special = makeMap("script,style");

	var HTMLParser  = function( html, handler ) {
		var index, chars, match, stack = [], last = html;
		stack.last = function(){
			return this[ this.length - 1 ];
		};

		while ( html ) {
		    //$log("HTMLParser: chunking... ");
			chars = true;

			// Make sure we're not in a script or style element
			if ( !stack.last() || !special[ stack.last() ] ) {
            
		        //$log("HTMLParser: ... ");
				// Comment
				if ( html.indexOf("<!--") === 0 ) {
		            //$log("HTMLParser: comment ");
					index = html.indexOf("-->");
	
					if ( index >= 0 ) {
						if ( handler.comment )
							handler.comment( html.substring( 4, index ) );
						html = html.substring( index + 3 );
						chars = false;
					}
	
				// end tag
				} else if ( html.indexOf("</") === 0 ) {
		            //$log("HTMLParser: endtag ");
					match = html.match( endTag );
	
					if ( match ) {
		                //$log("HTMLParser: endtag match : "+match[0]);
						html = html.substring( match[0].length );
						match[0].replace( endTag, parseEndTag );
						chars = false;
					}
	
				// start tag
				} else if ( html.indexOf("<") === 0 ) {
		            //$log("HTMLParser: starttag ");
					match = html.match( startTag );
	
					if ( match ) {
		                //$log("HTMLParser: starttag match : "+match[0]);
						html = html.substring( match[0].length );
						match[0].replace( startTag, parseStartTag );
						chars = false;
					}
				}

				if ( chars ) {
		            //$log("HTMLParser: other ");
					index = html.indexOf("<");
					var text = index < 0 ? html : html.substring( 0, index );
					html = index < 0 ? "" : html.substring( index );
					if ( handler.chars ){
		                //$log("HTMLParser: chars " + text);
					    handler.chars( text );
				    }
				}
			} else {
		        //$log("HTMLParser: special ");
				html = html.replace(new RegExp("(.*)<\/" + stack.last() + "[^>]*>"), function(all, text){
					text = text.replace(/<!--(.*?)-->/g, "$1").
						replace(/<!\[CDATA\[(.*?)]]>/g, "$1");
					if ( handler.chars ){
		                //$log("HTMLParser: special chars " + text);
					    handler.chars( text );
				    }
					return "";
				});
				parseEndTag( "", stack.last() );
			}
			if ( html == last ){throw "Parse Error: " + html;}
			last = html;
		}
		
		// Clean up any remaining tags
		parseEndTag();

		function parseStartTag( tag, tagName, rest, unary ) {
			if ( block[ tagName ] ) {
				while ( stack.last() && inline[ stack.last() ] ) {
					parseEndTag( "", stack.last() );
				}
			}

			if ( closeSelf[ tagName ] && stack.last() == tagName ) {
				parseEndTag( "", tagName );
			}

			unary = empty[ tagName ] || !!unary;

			if ( !unary )
				stack.push( tagName );
			
			if ( handler.start ) {
				var attrs = [];
	
				rest.replace(attr, function(match, name) {
					var value = arguments[2] ? arguments[2] :
						arguments[3] ? arguments[3] :
						arguments[4] ? arguments[4] :
						fillAttrs[name] ? name : "";
					
					attrs.push({
						name: name,
						value: value,
						escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
					});
				});
	
				if ( handler.start ){
				    //$log("unary ? : "+unary);
					handler.start( tagName, attrs, unary );
				}
			}
		}

		function parseEndTag( tag, tagName ) {
		  var pos;
			// If no tag name is provided, clean shop
			if ( !tagName ){
				pos = 0;
			}else{
			// Find the closest opened tag of the same type
				for ( pos = stack.length - 1; pos >= 0; pos-- ){
					//$log("parseEndTag : "+stack[ pos ] );
					if ( stack[ pos ] == tagName ){ 
					    break; 
				    }
				}
            }
			if ( pos >= 0 ) {
				// Close all the open elements, up the stack
				for ( var i = stack.length - 1; i >= pos; i-- ){
                    if ( handler.end ){
					    //$log("end : "+stack[ i ] );
                        handler.end( stack[ i ] );
                    }
				}
				// Remove the open elements from the stack
				//$log("setting stack length : " + stack.length + " -> " +pos );
				stack.length = pos;
			}
		}
	};
	
	html2xml = function( html ) {
		var results = "";
		
		HTMLParser(html, {
			start: function( tag, attrs, unary ) {
				results += "<" + tag;
		
				for ( var i = 0; i < attrs.length; i++ )
					results += " " + attrs[i].name + '="' + attrs[i].escaped + '"';
		
				results += (unary ? "/" : "") + ">";
			},
			end: function( tag ) {
				results += "</" + tag + ">";
			},
			chars: function( text ) {
				results += text;
			},
			comment: function( text ) {
				results += "<!--" + text + "-->";
			}
		});
		
		return results;
	};
	
	html2dom = function( html, doc ) {
		// There can be only one of these elements
		var one = makeMap("html,head,body,title");
		
		// Enforce a structure for the document
		/*var structure = {
			link: "head",
			base: "head"
		};*/
	
		if ( !doc ) {
			if ( typeof DOMDocument != "undefined" ){
				doc = new DOMDocument();
			}else if ( typeof document != "undefined" && document.implementation && document.implementation.createDocument ){
				doc = document.implementation.createDocument("", "", null);
			}else if ( typeof ActiveX != "undefined" ){
				doc = new ActiveXObject("Msxml.DOMDocument");
			}
		} else {
			doc = doc.ownerDocument ||
				doc.getOwnerDocument && doc.getOwnerDocument() ||
				doc;
		}
		
		var elems = [],
			documentElement = doc.documentElement || 
			    doc.getDocumentElement && doc.getDocumentElement();
				
		// If we're dealing with an empty document then we
		// need to pre-populate it with the HTML document structure
		/*if ( !documentElement && doc.createElement ) (function(){
		    //$log("HTMLtoDOM: adding structure... ");
			var html = doc.createElement("html");
			var head = doc.createElement("head");
			head.appendChild( doc.createElement("title") );
			html.appendChild( head );
			html.appendChild( doc.createElement("body") );
			doc.appendChild( html );
			doc.documentElement = html;
		})();*/
		
		// Find all the unique elements
		/*if ( doc.getElementsByTagName ){
			for ( var i in one ){
			   one[ i ] = doc.getElementsByTagName( i )[0];
            }
		}*/
		
		// If we're working with a document, inject contents into
		// the body element
		var curParentNode;// = one.body;
		
		//$log("HTMLtoDOM: Parsing... ");
		HTMLParser( html, {
			start: function( tagName, attrs, unary ) {
			    
				var elem;
		        //$log("HTMLtoDOM: createElement... " + tagName);
				elem = doc.createElement( tagName );
			
				
				for ( var attr in attrs ){
		            //$log("HTMLtoDOM: setAttribute... " +  attrs[ attr ].name);
					elem.setAttribute( attrs[ attr ].name, attrs[ attr ].value );
				}
				
				if ( !doc.documentElement ){		            
				    //$log("HTMLtoDOM: documentElement... " +  elem.nodeName);
		            doc.documentElement = elem;
			        doc.appendChild( elem );
				}
				
				else if ( curParentNode && curParentNode.appendChild ){
		            //$log("HTMLtoDOM: curParentNode.appendChild... " +  curParentNode.nodeName + " -> " +elem.nodeName);
					curParentNode.appendChild( elem );
				}
					
				if ( !unary ) {
				    //$log("start : push into elems[] " + tagName);
					elems.push( elem );
					curParentNode = elem;
				}
			},
			end: function( tag ) {
			    //$log(tag + " : elems.lengths : "+elems.length);
			    elems.length -= 1;
				
				// Init the new parentNode
				curParentNode = elems[ elems.length - 1 ];

			},
			chars: function( text ) {
				curParentNode.appendChild( doc.createTextNode( text ) );
			},
			comment: function( text ) {
				curParentNode.appendChild( doc.createComment( text ) );
			}
		});
				
        //$log("HTMLtoDOM: doc... " + doc);
		return doc;
	};

	function makeMap(str){
		var obj = {}, items = str.split(",");
		for ( var i = 0; i < items.length; i++ )
			obj[ items[i] ] = true;
		return obj;
	};
	
})( );
$debug("Defining HTMLDocument");
/*
* HTMLDocument - DOM Level 2
*  The Document object is not directly 
*/
$w.__defineGetter__("HTMLDocument", function(){
  return function(){
    throw new Error("Object cannot be created in this context");
  };
});
/**
 * @class  HTMLDocument - The Document interface represents the entire HTML or XML document.
 *   Conceptually, it is the root of the document tree, and provides the primary access to the document's data.
 *
 * @extends DOMDocument
 */
var HTMLDocument = function(implementation) {
  this.DOMDocument = DOMDocument;
  this.DOMDocument(implementation);

  this.title = "";
  this._refferer = "";
  this._domain;
  this._open = false;
};
HTMLDocument.prototype = new DOMDocument;
__extend__(HTMLDocument.prototype, {
    createElement: function(tagName){
          // throw Exception if the tagName string contains an illegal character
          if (__ownerDocument__(this).implementation.errorChecking && 
                (!__isValidName__(tagName))) {
              throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
          }
          tagName = tagName.toUpperCase();
          // create DOMElement specifying 'this' as ownerDocument
          //This is an html document so we need to use explicit interfaces per the 
          if(     tagName.match(/^A$/))                 {node = new HTMLAnchorElement(this);}
          else if(tagName.match(/AREA/))                {node = new HTMLAreaElement(this);}
          else if(tagName.match(/BASE/))                {node = new HTMLBaseElement(this);}
          else if(tagName.match(/BLOCKQUOTE|Q/))        {node = new HTMLQuoteElement(this);}
          else if(tagName.match(/BODY/))                {node = new HTMLElement(this);}
          else if(tagName.match(/BR/))                  {node = new HTMLElement(this);}
          else if(tagName.match(/BUTTON/))              {node = new HTMLButtonElement(this);}
          else if(tagName.match(/CAPTION/))             {node = new HTMLElement(this);}
          else if(tagName.match(/COL|COLGROUP/))        {node = new HTMLTableColElement(this);}
          else if(tagName.match(/DEL|INS/))             {node = new HTMLModElement(this);}
          else if(tagName.match(/DIV/))                 {node = new HTMLElement(this);}
          else if(tagName.match(/DL/))                  {node = new HTMLElement(this);}
          else if(tagName.match(/FIELDSET/))            {node = new HTMLFieldSetElement(this);}
          else if(tagName.match(/FORM/))                {node = new HTMLFormElement(this);}
          else if(tagName.match(/^FRAME$/))             {node = new HTMLFrameElement(this);}
          else if(tagName.match(/FRAMESET/))            {node = new HTMLFrameSetElement(this);}
          else if(tagName.match(/H1|H2|H3|H4|H5|H6/))   {node = new HTMLElement(this);}
          else if(tagName.match(/HEAD/))                {node = new HTMLHeadElement(this);}
          else if(tagName.match(/HR/))                  {node = new HTMLElement(this);}
          else if(tagName.match(/HTML/))                {node = new HTMLElement(this);}
          else if(tagName.match(/IFRAME/))              {node = new HTMLIFrameElement(this);}
          else if(tagName.match(/IMG/))                 {node = new HTMLImageElement(this);}
          else if(tagName.match(/INPUT/))               {node = new HTMLInputElement(this);}
          else if(tagName.match(/LABEL/))               {node = new HTMLLabelElement(this);}
          else if(tagName.match(/LEGEND/))              {node = new HTMLLegendElement(this);}
          else if(tagName.match(/^LI$/))                {node = new HTMLElement(this);}
          else if(tagName.match(/LINK/))                {node = new HTMLLinkElement(this);}
          else if(tagName.match(/MAP/))                 {node = new HTMLMapElement(this);}
          else if(tagName.match(/META/))                {node = new HTMLMetaElement(this);}
          else if(tagName.match(/OBJECT/))              {node = new HTMLObjectElement(this);}
          else if(tagName.match(/OL/))                  {node = new HTMLElement(this);}
          else if(tagName.match(/OPTGROUP/))            {node = new HTMLOptGroupElement(this);}
          else if(tagName.match(/OPTION/))              {node = new HTMLOptionElement(this);;}
          else if(tagName.match(/^P$/))                 {node = new HTMLElement(this);}
          else if(tagName.match(/PARAM/))               {node = new HTMLParamElement(this);}
          else if(tagName.match(/PRE/))                 {node = new HTMLElement(this);}
          else if(tagName.match(/SCRIPT/))              {node = new HTMLScriptElement(this);}
          else if(tagName.match(/SELECT/))              {node = new HTMLSelectElement(this);}
          else if(tagName.match(/STYLE/))               {node = new HTMLStyleElement(this);}
          else if(tagName.match(/TABLE/))               {node = new HTMLTableElement(this);}
          else if(tagName.match(/TBODY|TFOOT|THEAD/))   {node = new HTMLElement(this);}
          else if(tagName.match(/TD|TH/))               {node = new HTMLTableCellElement(this);}
          else if(tagName.match(/TEXTAREA/))            {node = new HTMLElement(this);}
          else if(tagName.match(/TITLE/))               {node = new HTMLElement(this);}
          else if(tagName.match(/TR/))                  {node = new HTMLTableRowElement(this);}
          else if(tagName.match(/UL/))                  {node = new HTMLElement(this);}
          else{
            node = new HTMLElement(this);
          }
        
          // assign values to properties (and aliases)
          node.tagName  = tagName;
          return node;
    },
    get anchors(){
        return new HTMLCollection(this.getElementsByTagName('a'), 'Anchor');
        
    },
    get applets(){
        return new HTMLCollection(this.getElementsByTagName('applet'), 'Applet');
        
    },
    get body(){ 
        var nodelist = this.getElementsByTagName('body');
        return nodelist.item(0);
        
    },
    set body(html){
        return this.replaceNode(this.body,html);
        
    },
    //set/get cookie see cookie.js
    get domain(){
        return this._domain||window.location.domain;
        
    },
    set domain(){
        /* TODO - requires a bit of thought to enforce domain restrictions */ 
        return; 
        
    },
    get forms(){
      return new HTMLCollection(this.getElementsByTagName('form'), 'Form');
    },
    get images(){
        return new HTMLCollection(this.getElementsByTagName('img'), 'Image');
        
    },
    get lastModified(){ 
        /* TODO */
        return this._lastModified; 
    
    },
    get links(){
        return new HTMLCollection(this.getElementsByTagName('a'), 'Link');
        
    },
    get location(){
        return $w.location
    },
    get referrer(){
        /* TODO */
        return this._refferer; 
        
    },
    get URL(){
        /* TODO*/
        return this._url; 
        
    },
	close : function(){ 
	    /* TODO */ 
	    this._open = false;
    },
	getElementsByName : function(name){
        //returns a real Array + the DOMNodeList
        var retNodes = __extend__([],new DOMNodeList(this, this.documentElement)),
          node;
        // loop through all Elements in the 'all' collection
        var all = this.all;
        for (var i=0; i < all.length; i++) {
            node = all[i];
            if (node.nodeType == DOMNode.ELEMENT_NODE && node.getAttribute('name') == name) {
                retNodes.push(node);
            }
        }
        return retNodes;
	},
	open : function(){ 
	    /* TODO */
	    this._open = true;  
    },
	write: function(htmlstring){ 
	    /* TODO */
	    return; 
	
    },
	writeln: function(htmlstring){ 
	    this.write(htmlstring+'\n'); 
    },
	toString: function(){ 
	    return "Document" +  (typeof this._url == "string" ? ": " + this._url : ""); 
    },
	get innerHTML(){ 
	    return this.documentElement.outerHTML; 
	    
    },
	get __html__(){
	    return true;
	    
    }
});

//This is useful as html elements that modify the dom must also run through the new 
//nodes and determine if they are javascript tags and load it.  This is really the fun 
//parts! ;)
function __execScripts__( node ) {
	if ( node.nodeName == "SCRIPT" ) {
		if ( !node.getAttribute("src") ) {
			eval.call( window, node.textContent );
		}
	} else {
		var scripts = node.getElementsByTagName("script");
		for ( var i = 0; i < scripts.length; i++ ) {
			__execScripts__( node );
		}
	}
};$debug("Defining HTMLElement");
/*
* HTMLElement - DOM Level 2
*/
$w.__defineGetter__("HTMLElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLElement = function(ownerDocument) {
    this.DOMElement = DOMElement;
    this.DOMElement(ownerDocument);
    
    this.$css2props = null;
};
HTMLElement.prototype = new DOMElement;
__extend__(HTMLElement.prototype, {
		get className() { 
		    return this.getAttribute("class")||""; 
		    
	    },
		set className(val) { 
		    return this.setAttribute("class",trim(val)); 
		    
	    },
		get dir() { 
		    return this.getAttribute("dir")||"ltr"; 
		    
	    },
		set dir(val) { 
		    return this.setAttribute("dir",val); 
		    
	    },
		get id(){  
		    return this.getAttribute('id')||''; 
		    
	    },
		set id(id){  
		    this.setAttribute('id', id); 
            
	    },
		get innerHTML(){  
		    return this.childNodes.xml; 
		    
	    },
		set innerHTML(html){
		    $debug("htmlElement.innerHTML("+html+")");
		    //Should be replaced with HTMLPARSER usage
		    var doc = new DOMParser().
			  parseFromString('<div>'+html+'</div>');
            var parent = doc.documentElement;
			while(this.firstChild != null){
			    this.removeChild( this.firstChild );
			}
			var importedNode;
			while(parent.firstChild != null){
	            importedNode = this.importNode( 
	                parent.removeChild( parent.firstChild ), true);
			    this.appendChild( importedNode );   
		    }
		    //Mark for garbage collection
		    doc = null;
		},
		get lang() { 
		    return this.getAttribute("lang")||""; 
		    
	    },
		set lang(val) { 
		    return this.setAttribute("lang",val); 
		    
	    },
		get offsetHeight(){
		    return Number(this.style["height"].replace("px",""));
		},
		get offsetWidth(){
		    return Number(this.style["width"].replace("px",""));
		},
		offsetLeft: 0,
		offsetRight: 0,
		get offsetParent(){
		    /* TODO */
		    return;
	    },
		set offsetParent(element){
		    /* TODO */
		    return;
	    },
		scrollHeight: 0,
		scrollWidth: 0,
		scrollLeft: 0, 
		scrollRight: 0,
		get style(){
		    if(this.$css2props === null){
		        this.$css2props = new CSS2Properties({
    		        cssText:this.getAttribute("style")
    	        });
	        }
	        return this.$css2props
		},
		get title() { 
		    return this.getAttribute("title")||""; 
		    
	    },
		set title(val) { 
		    return this.setAttribute("title",val); 
		    
	    },
		//Not in the specs but I'll leave it here for now.
		get outerHTML(){ 
		    return this.xml; 
		    
	    },
	    scrollIntoView: function(){
	        /*TODO*/
	        return;
	    
        },
		onclick: function(event){
		    __eval__(this.getAttribute('onclick')||'')
	    },
		ondblclick: function(event){
            __eval__(this.getAttribute('ondblclick')||'');
	    },
		onkeydown: function(event){
            __eval__(this.getAttribute('onkeydown')||'');
	    },
		onkeypress: function(event){
            __eval__(this.getAttribute('onkeypress')||'');
	    },
		onkeyup: function(event){
            __eval__(this.getAttribute('onkeyup')||'');
	    },
		onmousedown: function(event){
            __eval__(this.getAttribute('onmousedown')||'');
	    },
		onmousemove: function(event){
            __eval__(this.getAttribute('onmousemove')||'');
	    },
		onmouseout: function(event){
            __eval__(this.getAttribute('onmouseout')||'');
	    },
		onmouseover: function(event){
            __eval__(this.getAttribute('onmouseover')||'');
	    },
		onmouseup: function(event){
            __eval__(this.getAttribute('onmouseup')||'');
	    }
});

var __eval__ = function(script){
    try{
        eval(script);
    }catch(e){
        $error(e);
    }
};

var __registerEventAttrs__ = function(elm){
    if(elm.hasAttribute('onclick')){ 
        elm.addEventListener('click', elm.onclick ); 
    }
    if(elm.hasAttribute('ondblclick')){ 
        elm.addEventListener('dblclick', elm.onclick ); 
    }
    if(elm.hasAttribute('onkeydown')){ 
        elm.addEventListener('keydown', elm.onclick ); 
    }
    if(elm.hasAttribute('onkeypress')){ 
        elm.addEventListener('keypress', elm.onclick ); 
    }
    if(elm.hasAttribute('onkeyup')){ 
        elm.addEventListener('keyup', elm.onclick ); 
    }
    if(elm.hasAttribute('onmousedown')){ 
        elm.addEventListener('mousedown', elm.onclick ); 
    }
    if(elm.hasAttribute('onmousemove')){ 
        elm.addEventListener('mousemove', elm.onclick ); 
    }
    if(elm.hasAttribute('onmouseout')){ 
        elm.addEventListener('mouseout', elm.onclick ); 
    }
    if(elm.hasAttribute('onmouseover')){ 
        elm.addEventListener('mouseover', elm.onclick ); 
    }
    if(elm.hasAttribute('onmouseup')){ 
        elm.addEventListener('mouseup', elm.onclick ); 
    }
    return elm;
};
	
var __click__ = function(element){
	var event = new Event({
	  target:element,
	  currentTarget:element
	});
	event.initEvent("click");
	element.dispatchEvent(event);
};
var __submit__ = function(element){
	var event = new Event({
	  target:element,
	  currentTarget:element
	});
	event.initEvent("submit");
	element.dispatchEvent(event);
};
var __focus__ = function(element){
	var event = new Event({
	  target:element,
	  currentTarget:element
	});
	event.initEvent("focus");
	element.dispatchEvent(event);
};
var __blur__ = function(element){
	var event = new Event({
	  target:element,
	  currentTarget:element
	});
	event.initEvent("blur");
	element.dispatchEvent(event);
};
$debug("Defining HTMLCollection");
/*
* HTMLCollection - DOM Level 2
* Implementation Provided by Steven Wood
*/
$w.__defineGetter__("HTMLCollection", function(){
  return function(){
    throw new Error("Object cannot be created in this context");
  };
});

var HTMLCollection = function(nodelist, type){

  __setArray__(this, []);
  for (var i=0; i<nodelist.length; i++) {
      this[i] = nodelist[i];
  }
  
  this.length = nodelist.length;

}

HTMLCollection.prototype = {
        
    item : function (idx) {
        var ret = null;
        if ((idx >= 0) && (idx < this.length)) { 
            ret = this[idx];                    
        }
    
        return ret;   
    },
    
    namedItem : function (name) {
    }
};

/*var HTMLCollection = function(nodelist, type){
  var $items = [], 
      $item, i;
  if(type === "Anchor" ){
    for(i=0;i<nodelist.length;i++){ 
      //The name property is required to be add to the collection
      if(nodelist.item(i).name){
        item = new nodelist.item(i);
        $items.push(item);
        this[nodelist.item(i).name] = item;
      }
    }
  }else if(type === "Link"){
    for(i=0;i<nodelist.length;i++){ 
      //The name property is required to be add to the collection
      if(nodelist.item(i).href){
        item = new nodelist.item(i);
        $items.push(item);
        this[nodelist.item(i).name] = item;
      }
    }
  }else if(type === "Form"){
    for(i=0;i<nodelist.length;i++){ 
      //The name property is required to be add to the collection
      if(nodelist.item(i).href){
        item = new nodelist.item(i);
        $items.push(item);
        this[nodelist.item(i).name] = item;
      }
    }
  }
  setArray(this, $items);
  return __extend__(this, {
    item : function(i){return this[i];},
    namedItem : function(name){return this[name];}
  });
};*/

	$debug("Defining HTMLAnchorElement");
/* 
* HTMLAnchorElement - DOM Level 2
*/
$w.__defineGetter__("HTMLAnchorElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLAnchorElement = function(ownerDocument) {
    //$log("creating anchor element");
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLAnchorElement.prototype = new HTMLElement;
__extend__(HTMLAnchorElement.prototype, {
	get accessKey() { 
	    return this.getAttribute("accesskey") || ""; 
	    
    },
	set accessKey(val) { 
	    return this.setAttribute("accesskey",val); 
	    
    },
	get charset() { 
	    return this.getAttribute("charset") || ""; 
	    
    },
	set charset(val) { 
	    return this.setAttribute("charset",val); 
	    
    },
	get coords() { 
	    return this.getAttribute("coords") || ""; 
	    
    },
	set coords(val) { 
	    return this.setAttribute("coords",val); 
	    
    },
	get href() { 
	    return this.getAttribute("href") || ""; 
	    
    },
	set href(val) { 
	    return this.setAttribute("href",val); 
	    
    },
	get hreflang() { 
	    return this.getAttribute("hreflang") || ""; 
	    
    },
	set hreflang(val) { 
	    return this.setAttribute("hreflang",val); 
	    
    },
	get name() { 
	    return this.getAttribute("name") || ""; 
	    
    },
	set name(val) { 
	    return this.setAttribute("name",val); 
	    
    },
	get rel() { 
	    return this.getAttribute("rel") || ""; 
	    
    },
	set rel(val) { 
	    return this.setAttribute("rel",val); 
	    
    },
	get rev() { 
	    return this.getAttribute("rev") || ""; 
	    
    },
	set rev(val) { 
	    return this.setAttribute("rev",val); 
	    
    },
	get shape() { 
	    return this.getAttribute("shape") || ""; 
	    
    },
	set shape(val) { 
	    return this.setAttribute("shape",val); 
	    
    },
	get tabIndex() { 
	    return this.getAttribute("tabindex") || ""; 
	    
    },
	set tabIndex(val) { 
	    return this.setAttribute("tabindex",val); 
	    
    },
	get target() { 
	    return this.getAttribute("target") || ""; 
	    
    },
	set target(val) { 
	    return this.setAttribute("target",val); 
	    
    },
	get type() { 
	    return this.getAttribute("type") || ""; 
	    
    },
	set type(val) { 
	    return this.setAttribute("type",val); 
	    
    },
	blur:function(){
	    __blur__(this);
	    
    },
	focus:function(){
	    __focus__(this);
	    
    }
});

			$debug("Defining Anchor");
/* 
* Anchor - DOM Level 2
*/
$w.__defineGetter__("Anchor", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var Anchor = function(ownerDocument) {
    this.HTMLAnchorElement = HTMLAnchorElement;
    this.HTMLAnchorElement(ownerDocument);
};
Anchor.prototype = new Anchor;

(function(){
    //static regular expressions
	var hash 	 = new RegExp('(\\#.*)'),
        hostname = new RegExp('\/\/([^\:\/]+)'),
        pathname = new RegExp('(\/[^\\?\\#]*)'),
        port 	 = new RegExp('\:(\\d+)\/'),
        protocol = new RegExp('(^\\w*\:)'),
        search 	 = new RegExp('(\\?[^\\#]*)');
			
    __extend__(Anchor.prototype, {
		get hash(){
			var m = hash.exec(this.href);
			return m&&m.length>1?m[1]:"";
		},
		set hash(_hash){
			//setting the hash is the only property of the location object
			//that doesn't cause the window to reload
			_hash = _hash.indexOf('#')===0?_hash:"#"+_hash;	
			this.href = this.protocol + this.host + this.pathname + this.search + _hash;
		},
		get host(){
			return this.hostname + (this.port !== "")?":"+this.port:"";
		},
		set host(_host){
			this.href = this.protocol + _host + this.pathname + this.search + this.hash;
		},
		get hostname(){
			var m = hostname.exec(this.href);
			return m&&m.length>1?m[1]:"";
		},
		set hostname(_hostname){
			this.href = this.protocol + _hostname + ((this.port=="")?"":(":"+this.port)) +
			 	 this.pathname + this.search + this.hash;
		},
		get pathname(){
			var m = this.href;
			m = pathname.exec(m.substring(m.indexOf(this.hostname)));
			return m&&m.length>1?m[1]:"/";
		},
		set pathname(_pathname){
			this.href = this.protocol + this.host + _pathname + 
				this.search + this.hash;
		},
		get port(){
			var m = port.exec(this.href);
			return m&&m.length>1?m[1]:"";
		},
		set port(_port){
			this.href = this.protocol + this.hostname + ":"+_port + this.pathname + 
				this.search + this.hash;
		},
		get protocol(){
			return protocol.exec(this.href)[0];
		},
		set protocol(_protocol){
			this.href = _protocol + this.host + this.pathname + 
				this.search + this.hash;
		},
		get search(){
			var m = search.exec(this.href);
			return m&&m.length>1?m[1]:"";
		},
		set search(_search){
			this.href = this.protocol + this.host + this.pathname + 
				_search + this.hash;
		}
  });

})();
			$debug("Defining HTMLAreaElement");
/* 
* HTMLAreaElement - DOM Level 2
*/
$w.__defineGetter__("HTMLAreaElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLAreaElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLAreaElement.prototype = new HTMLElement;
__extend__(HTMLAreaElement.prototype, {
    get accessKey(){
        return this.getAttribute('accesskey');
    },
    set accessKey(value){
        this.setAttribute('accesskey',value);
    },
    get alt(){
        return this.getAttribute('alt');
    },
    set alt(value){
        this.setAttribute('alt',value);
    },
    get coords(){
        return this.getAttribute('coords');
    },
    set coords(value){
        this.setAttribute('coords',value);
    },
    get href(){
        return this.getAttribute('href');
    },
    set href(value){
        this.setAttribute('href',value);
    },
    get noHref(){
        return this.hasAttribute('href');
    },
    get shape(){
        //TODO
        return 0;
    },
    get tabIndex(){
        return this.getAttribute('tabindex');
    },
    set tabIndex(value){
        this.setAttribute('tabindex',value);
    },
    get target(){
        return this.getAttribute('target');
    },
    set target(value){
        this.setAttribute('target',value);
    }
});

			$debug("Defining HTMLBaseElement");
/* 
* HTMLBaseElement - DOM Level 2
*/
$w.__defineGetter__("HTMLBaseElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLBaseElement = function(ownerDocument) {
    //$log("creating anchor element");
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLBaseElement.prototype = new HTMLElement;
__extend__(HTMLBaseElement.prototype, {
    get href(){
        return this.getAttribute('href');
    },
    set href(value){
        this.setAttribute('href',value);
    },
    get target(){
        return this.getAttribute('target');
    },
    set target(value){
        this.setAttribute('target',value);
    }
});

			$debug("Defining HTMLQuoteElement");
/* 
* HTMLQuoteElement - DOM Level 2
*/
$w.__defineGetter__("HTMLQuoteElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLQuoteElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLQuoteElement.prototype = new HTMLElement;
__extend__(HTMLQuoteElement.prototype, {
    get cite(){
        return this.getAttribute('cite');
    },
    set cite(value){
        this.setAttribute('cite',value);
    }
});

			$debug("Defining HTMLButtonElement");
/* 
* HTMLButtonElement - DOM Level 2
*/
$w.__defineGetter__("HTMLButtonElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLButtonElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLButtonElement.prototype = new HTMLElement;
__extend__(HTMLButtonElement.prototype, {
    get form(){
        var parent = this.parent;
        while(parent.nodeName.toLowerCase() != 'form'){
            parent = parent.parent;
        }
        return parent;
    },
    get accessKey(){
        return this.getAttribute('accesskey');
    },
    set accessKey(value){
        this.setAttribute('accesskey',value);
    },
    get tabIndex(){
        return Number(this.getAttribute('tabindex'));
    },
    set tabIndex(value){
        this.setAttribute('tabindex',Number(value));
    },
    get type(){
        return this.getAttribute('type');
    },
    set type(value){
        this.setAttribute('type',value);
    },
    get value(){
        return this.getAttribute('value');
    },
    set value(value){
        this.setAttribute('value',value);
    }
});

			$debug("Defining HTMLTableColElement");
/* 
* HTMLTableColElement - DOM Level 2
*/
$w.__defineGetter__("HTMLTableColElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLTableColElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLTableColElement.prototype = new HTMLElement;
__extend__(HTMLTableColElement.prototype, {
    get align(){
        return this.getAttribute('align');
    },
    set align(value){
        this.setAttribute('align', value);
    },
    get ch(){
        return this.getAttribute('ch');
    },
    set ch(value){
        this.setAttribute('ch', value);
    },
    get chOff(){
        return this.getAttribute('ch');
    },
    set chOff(value){
        this.setAttribute('ch', value);
    },
    get span(){
        return this.getAttribute('span');
    },
    set span(value){
        this.setAttribute('span', value);
    },
    get vAlign(){
        return this.getAttribute('valign');
    },
    set vAlign(value){
        this.setAttribute('valign', value);
    },
    get width(){
        return this.getAttribute('width');
    },
    set width(value){
        this.setAttribute('width', value);
    }
});

			$debug("Defining HTMLModElement");
/* 
* HTMLModElement - DOM Level 2
*/
$w.__defineGetter__("HTMLModElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLModElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLModElement.prototype = new HTMLElement;
__extend__(HTMLModElement.prototype, {
    get cite(){
        return this.getAttribute('cite');
    },
    set cite(value){
        this.setAttribute('cite', value);
    },
    get dateTime(){
        return this.getAttribute('datetime');
    },
    set dateTime(value){
        this.setAttribute('datetime', value);
    }
});

			$debug("Defining HTMLFieldSetElement");
/* 
* HTMLFieldSetElement - DOM Level 2
*/
$w.__defineGetter__("HTMLFieldSetElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLFieldSetElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLFieldSetElement.prototype = new HTMLElement;
__extend__(HTMLFieldSetElement.prototype, {
    get form(){
        var parent = this.parent;
        while(parent.nodeName.toLowerCase() != 'form'){
            parent = parent.parent;
        }
        return parent;
    }
});

			$debug("Defining HTMLFormElement");
/* 
* HTMLAnchorElement - DOM Level 2
*/
$w.__defineGetter__("Form", function(){
  return function(){
    throw new Error("Object cannot be created in this context");
  };
});
$w.__defineGetter__("HTMLFormElement", function(){
  return function(){
    throw new Error("Object cannot be created in this context");
  };
});

var HTMLFormElement = function(ownerDocument){
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLFormElement.prototype = new HTMLElement;
__extend__(HTMLFormElement.prototype,{
    get acceptCharset(){ 
        return this.getAttribute('accept-charset');
        
    },
    set acceptCharset(acceptCharset){
        this.setAttribute('accept-charset', acceptCharset);
        
    },
    get action(){
        return this.getAttribute('action');
        
    },
    set action(action){
        this.setAttribute('action', action);
        
    },
    get elements() {
        return this.getElementsByTagName("*");
        
    },
    get enctype(){
        return this.getAttribute('enctype');
        
    },
    set enctype(enctype){
        this.setAttribute('enctype', enctype);
        
    },
    get length() {
        return this.elements.length;
        
    },
    get method(){
        return this.getAttribute('method');
        
    },
    set method(action){
        this.setAttribute('method', method);
        
    },
	get name() {
	    return this.getAttribute("name") || ""; 
	    
    },
	set name(val) { 
	    return this.setAttribute("name",val); 
	    
    },
	get target() { 
	    return this.getAttribute("target") || ""; 
	    
    },
	set target(val) { 
	    return this.setAttribute("target",val); 
	    
    },
	submit:function(){
	    __submit__(this);
	    
    },
	reset:function(){
	    __reset__(this);
	    
    }
});

			$debug("Defining HTMLFrameElement");
/* 
* HTMLFrameElement - DOM Level 2
*/
$w.__defineGetter__("HTMLFrameElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLFrameElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLFrameElement.prototype = new HTMLElement;
__extend__(HTMLFrameElement.prototype, {
    get frameBorder(){
        return this.getAttribute('border')||"";
    },
    set frameBorder(value){
        this.setAttribute('border', value);
    },
    get longDesc(){
        return this.getAttribute('longdesc')||"";
    },
    set longDesc(value){
        this.setAttribute('longdesc', value);
    },
    get marginHeight(){
        return this.getAttribute('marginheight')||"";
    },
    set marginHeight(value){
        this.setAttribute('marginheight', value);
    },
    get marginWidth(){
        return this.getAttribute('marginwidth')||"";
    },
    set marginWidth(value){
        this.setAttribute('marginwidth', value);
    },
    get name(){
        return this.getAttribute('name')||"";
    },
    set name(value){
        this.setAttribute('name', value);
    },
    get noResize(){
        return this.getAttribute('noresize')||"";
    },
    set noResize(value){
        this.setAttribute('noresize', value);
    },
    get scrolling(){
        return this.getAttribute('scrolling')||"";
    },
    set scrolling(value){
        this.setAttribute('scrolling', value);
    },
    get src(){
        return this.getAttribute('src')||"";
    },
    set src(value){
        this.setAttribute('src', value);
    },
    get contentDocument(){
        $debug("getting content document for (i)frame");
        if(!this._content){
            this._content = new HTMLDocument($implementation);
            if(this.src.length > 0){
                $info("Loading frame content from " + this.src);
                try{
                    this._content.load(this.src);
                }catch(e){
                    $error("failed to load frame content: from " + this.src, e);
                }
            }
        }
        return true;
    }
});

			$debug("Defining HTMLFrameSetElement");
/* 
* HTMLFrameSetElement - DOM Level 2
*/
$w.__defineGetter__("HTMLFrameSetElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLFrameSetElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLFrameSetElement.prototype = new HTMLElement;
__extend__(HTMLFrameSetElement.prototype, {
    get cols(){
        return this.getAttribute('cols');
    },
    set cols(value){
        this.setAttribute('cols', value);
    },
    get rows(){
        return this.getAttribute('rows');
    },
    set rows(value){
        this.setAttribute('rows', value);
    }
});

			$debug("Defining HTMLHeadElement");
/* 
* HTMLHeadElement - DOM Level 2
*/
$w.__defineGetter__("HTMLHeadElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLHeadElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLHeadElement.prototype = new HTMLElement;
__extend__(HTMLHeadElement.prototype, {
    get profile(){
        return this.getAttribute('profile');
    },
    set profile(value){
        this.setAttribute('profile', value);
    },
    //we override this so we can apply browser behavior specific to head children
    //like loading scripts
    appendChild : function(newChild) {
        var newChild = HTMLElement.prototype.appendChild.apply(this,[newChild]);
        //__evalScript__(newChild);
        return newChild;
    },
    insertBefore : function(newChild, refChild) {
        var newChild = HTMLElement.prototype.insertBefore.apply(this,[newChild]);
        //__evalScript__(newChild);
        return newChild;
    }
});

var __evalScript__ = function(newChild){
    //check to see if this is a script element and apply a script loading strategy
    //the check against the ownerDocument isnt really enough to support frames in
    // the long run, but for now it's ok
    if(newChild.nodeType == DOMNode.ELEMENT_NODE && 
        newChild.ownerDocument == window.document ){
        if(newChild.nodeName.toUpperCase() == "SCRIPT"){
            $debug("loading script via policy. ");
            $policy.loadScript(newChild);
        }
    }
};$debug("Defining HTMLIFrameElement");
/* 
* HTMLIFrameElement - DOM Level 2
*/
$w.__defineGetter__("HTMLIFrameElement", function(){
  return function(){
    throw new Error("Object cannot be created in this context");
  };
});

var HTMLIFrameElement = function(ownerDocument) {
    this.HTMLFrameElement = HTMLFrameElement;
    this.HTMLFrameElement(ownerDocument);
};
HTMLIFrameElement.prototype = new HTMLFrameElement;
__extend__(HTMLIFrameElement.prototype, {
	get height() { 
	    return this.getAttribute("height") || ""; 
    },
	set height(val) { 
	    return this.setAttribute("height",val); 
    },
	get width() { 
	    return this.getAttribute("width") || ""; 
    },
	set width(val) { 
	    return this.setAttribute("width",val); 
    }
});


			$debug("Defining HTMLImageElement");
/* 
* HTMLImageElement - DOM Level 2
*/
$w.__defineGetter__("HTMLImageElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLImageElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLImageElement.prototype = new HTMLElement;
__extend__(HTMLImageElement.prototype, {
    get alt(){
        return this.getAttribute('alt');
    },
    set alt(value){
        this.setAttribute('alt', value);
    },
    get height(){
        return this.getAttribute('height');
    },
    set height(value){
        this.setAttribute('height', value);
    },
    get isMap(){
        return this.hasAttribute('map');
    },
    set useMap(value){
        this.setAttribute('map', value);
    },
    get longDesc(){
        return this.getAttribute('longdesc');
    },
    set longDesc(value){
        this.setAttribute('longdesc', value);
    },
    get name(){
        return this.getAttribute('name');
    },
    set name(value){
        this.setAttribute('name', value);
    },
    get src(){
        return this.getAttribute('src');
    },
    set src(value){
        this.setAttribute('src', value);
    },
    get width(){
        return this.getAttribute('width');
    },
    set width(value){
        this.setAttribute('width', value);
    }
});

			$debug("Defining HTMLInputElement");
/* 
* HTMLInputElement - DOM Level 2
*/
$w.__defineGetter__("HTMLInputElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLInputElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLInputElement.prototype = new HTMLElement;
__extend__(HTMLInputElement.prototype, {
    get defaultValue(){
        return this.getAttribute('defaultValue');
    },
    set defaultValue(value){
        this.setAttribute('defaultValue', value);
    },
    get defaultChecked(){
        return this.getAttribute('defaultChecked');
    },
    get form(){
        var parent = this.parent;
        while(parent.nodeName.toLowerCase() != 'form'){
            parent = parent.parent;
        }
        return parent;
    },
    get accessKey(){
        return this.getAttribute('accesskey');
    },
    set accessKey(value){
        this.setAttribute('accesskey',value);
    },
    get access(){
        return this.getAttribute('access');
    },
    set access(value){
        this.setAttribute('access', value);
    },
    get alt(){
        return this.getAttribute('alt');
    },
    set alt(value){
        this.setAttribute('alt', value);
    },
    get checked(){
        return (this.getAttribute('checked')=='checked');
    },
    set checked(value){
        this.setAttribute('checked', (value ? 'checked' :''));
    },
    get disabled(){
        return (this.getAttribute('disabled')=='disabled');
    },
    set disabled(value){
        this.setAttribute('disabled', (value ? 'disabled' :''));
    },
    get maxLength(){
        return Number(this.getAttribute('maxlength')||'0');
    },
    set maxLength(value){
        this.setAttribute('maxlength', value);
    },
    get name(){
        return this.getAttribute('name')||'';
    },
    set name(value){
        this.setAttribute('name', value);
    },
    get readOnly(){
        return (this.getAttribute('readonly')=='readonly');
    },
    set readOnly(value){
        this.setAttribute('readonly', (value ? 'readonly' :''));
    },
    get size(){
        return this.getAttribute('size');
    },
    set size(value){
        this.setAttribute('size', value);
    },
    get src(){
        return this.getAttribute('src');
    },
    set src(value){
        this.setAttribute('src', value);
    },
    get tabIndex(){
        return Number(this.getAttribute('tabindex'));
    },
    set tabIndex(value){
        this.setAttribute('tabindex',Number(value));
    },
    get type(){
        return this.getAttribute('type');
    },
    set type(value){
        this.setAttribute('type',value);
    },
    get useMap(){
        return this.getAttribute('map');
    },
    get value(){
        return this.getAttribute('value');
    },
    set value(value){
        this.setAttribute('value',value);
    },
	blur:function(){
	    __blur__(this);
	    
    },
	focus:function(){
	    __focus__(this);
	    
    },
	select:function(){
	    __select__(this);
	    
    },
	click:function(){
	    __click__(this);
	    
    }
});

			$debug("Defining HTMLLabelElement");
/* 
* HTMLLabelElement - DOM Level 2
*/
$w.__defineGetter__("HTMLLabelElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLLabelElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLLabelElement.prototype = new HTMLElement;
__extend__(HTMLLabelElement.prototype, {
    get form(){
        var parent = this.parent;
        while(parent.nodeName.toLowerCase() != 'form'){
            parent = parent.parent;
        }
        return parent;
    },
    get accessKey(){
        return this.getAttribute('accesskey');
    },
    set accessKey(value){
        this.setAttribute('accesskey',value);
    },
    get htmlFor(){
        return this.getAttribute('for');
    },
    set htmlFor(value){
        this.setAttribute('for',value);
    }
});

			$debug("Defining HTMLLegendElement");
/* 
* HTMLLegendElement - DOM Level 2
*/
$w.__defineGetter__("HTMLLegendElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLLegendElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLLegendElement.prototype = new HTMLElement;
__extend__(HTMLLegendElement.prototype, {
    get form(){
        var parent = this.parent;
        while(parent.nodeName.toLowerCase() != 'form'){
            parent = parent.parent;
        }
        return parent;
    },
    get accessKey(){
        return this.getAttribute('accesskey');
    },
    set accessKey(value){
        this.setAttribute('accesskey',value);
    }
});

			/**
* Link - HTMLElement 
*/
$w.__defineGetter__("Link", function(){
  return function(){
    throw new Error("Object cannot be created in this context");
  };
});


$debug("Defining HTMLLinkElement");
/* 
* HTMLLinkElement - DOM Level 2
*/
$w.__defineGetter__("HTMLLinkElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLLinkElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLLinkElement.prototype = new HTMLElement;
__extend__(HTMLLinkElement.prototype, {
    get disabled(){
        return this.getAttribute('disabled');
    },
    set disabled(value){
        this.setAttribute('disabled',value);
    },
    get charset(){
        return this.getAttribute('charset');
    },
    set charset(value){
        this.setAttribute('charset',value);
    },
    get href(){
        return this.getAttribute('href');
    },
    set href(value){
        this.setAttribute('href',value);
    },
    get hreflang(){
        return this.getAttribute('hreflang');
    },
    set hreflang(value){
        this.setAttribute('hreflang',value);
    },
    get media(){
        return this.getAttribute('media');
    },
    set media(value){
        this.setAttribute('media',value);
    },
    get rel(){
        return this.getAttribute('rel');
    },
    set rel(value){
        this.setAttribute('rel',value);
    },
    get rev(){
        return this.getAttribute('rev');
    },
    set rev(value){
        this.setAttribute('rev',value);
    },
    get target(){
        return this.getAttribute('target');
    },
    set target(value){
        this.setAttribute('target',value);
    },
    get type(){
        return this.getAttribute('type');
    },
    set type(value){
        this.setAttribute('type',value);
    }
});

			

			$debug("Defining HTMLMapElement");
/* 
* HTMLMapElement - DOM Level 2
*/
$w.__defineGetter__("HTMLMapElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLMapElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLMapElement.prototype = new HTMLElement;
__extend__(HTMLMapElement.prototype, {
    get areas(){
        return this.getElementsByTagName('area');
    },
    get name(){
        return this.getAttribute('name');
    },
    set name(value){
        this.setAttribute('name',value);
    }
});

			$debug("Defining HTMLMetaElement");
/* 
* HTMLMetaElement - DOM Level 2
*/
$w.__defineGetter__("HTMLMetaElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLMetaElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLMetaElement.prototype = new HTMLElement;
__extend__(HTMLMetaElement.prototype, {
    get content(){
        return this.getAttribute('content');
    },
    set content(value){
        this.setAttribute('content',value);
    },
    get httpEquiv(){
        return this.getAttribute('http-equiv');
    },
    set httpEquiv(value){
        this.setAttribute('http-equiv',value);
    },
    get name(){
        return this.getAttribute('name');
    },
    set name(value){
        this.setAttribute('name',value);
    },
    get scheme(){
        return this.getAttribute('scheme');
    },
    set scheme(value){
        this.setAttribute('scheme',value);
    }
});

			$debug("Defining HTMLObjectElement");
/* 
* HTMLObjectElement - DOM Level 2
*/
$w.__defineGetter__("HTMLObjectElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLObjectElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLObjectElement.prototype = new HTMLElement;
__extend__(HTMLObjectElement.prototype, {
    get code(){
        return this.getAttribute('code');
    },
    set code(value){
        this.setAttribute('code',value);
    },
    get archive(){
        return this.getAttribute('archive');
    },
    set archive(value){
        this.setAttribute('archive',value);
    },
    get codeBase(){
        return this.getAttribute('codebase');
    },
    set codeBase(value){
        this.setAttribute('codebase',value);
    },
    get codeType(){
        return this.getAttribute('codetype');
    },
    set codeType(value){
        this.setAttribute('codetype',value);
    },
    get data(){
        return this.getAttribute('data');
    },
    set data(value){
        this.setAttribute('data',value);
    },
    get declare(){
        return this.getAttribute('declare');
    },
    set declare(value){
        this.setAttribute('declare',value);
    },
    get height(){
        return this.getAttribute('height');
    },
    set height(value){
        this.setAttribute('height',value);
    },
    get standby(){
        return this.getAttribute('standby');
    },
    set standby(value){
        this.setAttribute('standby',value);
    },
    get tabIndex(){
        return this.getAttribute('tabindex');
    },
    set tabIndex(value){
        this.setAttribute('tabindex',value);
    },
    get type(){
        return this.getAttribute('type');
    },
    set type(value){
        this.setAttribute('type',value);
    },
    get useMap(){
        return this.getAttribute('usemap');
    },
    set useMap(value){
        this.setAttribute('usemap',value);
    },
    get width(){
        return this.getAttribute('width');
    },
    set width(value){
        this.setAttribute('width',value);
    },
    get contentDocument(){
        return this.ownerDocument;
    }
});

			$debug("Defining HTMLOptGroupElement");
/* 
* HTMLOptGroupElement - DOM Level 2
*/
$w.__defineGetter__("HTMLOptGroupElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLOptGroupElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLOptGroupElement.prototype = new HTMLElement;
__extend__(HTMLOptGroupElement.prototype, {
    get disabled(){
        return this.getAttribute('disabled');
    },
    set disabled(value){
        this.setAttribute('disabled',value);
    },
    get label(){
        return this.getAttribute('label');
    },
    set label(value){
        this.setAttribute('label',value);
    },
});

			$debug("Defining HTMLOptionElement");
/* 
* HTMLOptionElement - DOM Level 2
*/
$w.__defineGetter__("HTMLOptionElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLOptionElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLOptionElement.prototype = new HTMLElement;
__extend__(HTMLOptionElement.prototype, {
    get form(){
        var parent = this.parent;
        while(parent.nodeName.toLowerCase() != 'form'){
            parent = parent.parent;
        }
        return parent;
    },
    get defaultSelected(){
        return this.getAttribute('defaultSelected');
    },
    set defaultSelected(value){
        this.setAttribute('defaultSelected',value);
    },
    get text(){
        return this.nodeValue;
    },
    get index(){
        var options = this.parent.childNodes;
        for(var i; i<options.length;i++){
            if(this == options[i])
                return i;
        }
        return -1;
    },
    get disabled(){
        return this.getAttribute('disabled');
    },
    set disabled(value){
        this.setAttribute('disabled',value);
    },
    get label(){
        return this.getAttribute('label');
    },
    set label(value){
        this.setAttribute('label',value);
    },
    get selected(){
        return (this.getAttribute('selected')=='selected');
    },
    set selected(value){
        this.setAttribute('selected', (value ? 'selected' :''));
    },
    get value(){
        return this.getAttribute('value');
    },
    set value(value){
        this.setAttribute('value',value);
    }
});

			$debug("Defining HTMLParamElement");
/* 
* HTMLParamElement - DOM Level 2
*/
$w.__defineGetter__("HTMLParamElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLParamElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLParamElement.prototype = new HTMLElement;
__extend__(HTMLParamElement.prototype, {
    get name(){
        return this.getAttribute('name');
    },
    set name(value){
        this.setAttribute('name',value);
    },
    get type(){
        return this.getAttribute('type');
    },
    set type(value){
        this.setAttribute('type',value);
    },
    get value(){
        return this.getAttribute('value');
    },
    set value(value){
        this.setAttribute('value',value);
    },
    get valueType(){
        return this.getAttribute('valuetype');
    },
    set valueType(value){
        this.setAttribute('valuetype',value);
    },
});

			$debug("Defining HTMLScriptElement");
/* 
* HTMLScriptElement - DOM Level 2
*/
$w.__defineGetter__("HTMLScriptElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLScriptElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLScriptElement.prototype = new HTMLElement;
__extend__(HTMLScriptElement.prototype, {
    get text(){
        // text of script is in a child node of the element
        // scripts with < operator must be in a CDATA node
        for (var i=0; i<this.childNodes.length; i++) {
            if (this.childNodes[i].nodeType == DOMNode.CDATA_SECTION_NODE) {
                return this.childNodes[i].nodeValue;
            }
        } 
        // otherwise there will be a text node containing the script
        if (this.childNodes[0] && this.childNodes[0].nodeType == DOMNode.TEXT_NODE) {
            return this.childNodes[0].nodeValue;
 		}
        return this.nodeValue;

    },
    get htmlFor(){
        return this.getAttribute('for');
    },
    set htmlFor(value){
        this.setAttribute('for',value);
    },
    get event(){
        return this.getAttribute('event');
    },
    set event(value){
        this.setAttribute('event',value);
    },
    get charset(){
        return this.getAttribute('charset');
    },
    set charset(value){
        this.setAttribute('charset',value);
    },
    get defer(){
        return this.getAttribute('defer');
    },
    set defer(value){
        this.setAttribute('defer',value);
    },
    get src(){
        return this.getAttribute('src');
    },
    set src(value){
        this.setAttribute('src',value);
    },
    get type(){
        return this.getAttribute('type');
    },
    set type(value){
        this.setAttribute('type',value);
    }
});

            $debug("Defining HTMLSelectElement");
/* 
* HTMLSelectElement - DOM Level 2
*/
$w.__defineGetter__("HTMLSelectElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLSelectElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLSelectElement.prototype = new HTMLElement;
__extend__(HTMLSelectElement.prototype, {
    get type(){
        return this.getAttribute('type');
    },
    get selectedIndex(){
        var options = this.options;
        for(var i=0;i<options.length;i++){
            if(options[i].selected){
                return i;
            }
        };
        return -1;
    },
    set selectedIndex(value){
        this.options[Number(value)].selected = 'selected';
    },
    get value(){
        return this.getAttribute('value')||'';
    },
    set value(value) {
        var options = this.options,
            i, index;
        for (i=0; i<options.length; i++) {
            if (options[i].value == value) {
                index = i;
                break;
            }
        }
        if (index !== undefined) {
            this.setAttribute('value', value);
            this.selectedIndex = index;
        }
    },
    get length(){
        return this.options.length;
    },
    get form(){
        var parent = this.parent;
        while(parent.nodeName.toLowerCase() != 'form'){
            parent = parent.parent;
        }
        return parent;
    },
    get options(){
        return this.getElementsByTagName('option');
    },
    get disabled(){
        return (this.getAttribute('disabled')=='disabled');
    },
    set disabled(value){
        this.setAttribute('disabled', (value ? 'disabled' :''));
    },
    get multiple(){
        return this.getAttribute('multiple');
    },
    set multiple(value){
        this.setAttribute('multiple',value);
    },
    get name(){
        return this.getAttribute('name')||'';
    },
    set name(value){
        this.setAttribute('name',value);
    },
    get size(){
        return Number(this.getAttribute('size'));
    },
    set size(value){
        this.setAttribute('size',value);
    },
    get tabIndex(){
        return Number(this.getAttribute('tabindex'));
    },
    set tabIndex(value){
        this.setAttribute('tabindex',value);
    },
    add : function(){
        __add__(this);
    },
    remove : function(){
        __remove__(this);
    },
    blur: function(){
        __blur__(this);
    },
    focus: function(){
        __focus__(this);
    }
});

			$debug("Defining HTMLStyleElement");
/* 
* HTMLStyleElement - DOM Level 2
*/
$w.__defineGetter__("HTMLStyleElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLStyleElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLStyleElement.prototype = new HTMLElement;
__extend__(HTMLStyleElement.prototype, {
    get disabled(){
        return this.getAttribute('disabled');
    },
    set disabled(value){
        this.setAttribute('disabled',value);
    },
    get media(){
        return this.getAttribute('media');
    },
    set media(value){
        this.setAttribute('media',value);
    },
    get type(){
        return this.getAttribute('type');
    },
    set type(value){
        this.setAttribute('type',value);
    }
});

			$debug("Defining HTMLTableElement");
/* 
* HTMLTableElement - DOM Level 2
* Implementation Provided by Steven Wood
*/
$w.__defineGetter__("HTMLTableElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLTableElement = function(ownerDocument) {

    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);

};

HTMLTableElement.prototype = new HTMLElement;
__extend__(HTMLTableElement.prototype, {
    
    get rows() {
        return new HTMLCollection(this.getElementsByTagName("tr"));
    },
    
    insertRow : function (idx) {
        if (idx === undefined) {
            throw new Error("Index omitted in call to HTMLTableElement.insertRow ");
        }
        
        var numRows = this.rows.length,
            node = null;
        
        if (idx > numRows) {
            throw new Error("Index > rows.length in call to HTMLTableElement.insertRow");
        }
        
        var row = document.createElement("tr");
        // If index is -1 or equal to the number of rows, 
        // the row is appended as the last row. If index is omitted 
        // or greater than the number of rows, an error will result
        if (idx === -1 || idx === numRows) {
            this.appendChild(row);
        } else {
            

            node = this.firstChild;

            for (var i=0; i<idx; i++) {
                node = node.nextSibling;
            }
        }
            
        this.insertBefore(row, node);
        
        return row;
    },
    
    deleteRow : function (idx) {
        var elem = this.rows[idx];
        this.removeChild(elem);
    }
    
});

			$debug("Defining HTMLTableCellElement");
/* 
* HTMLTableCellElement - DOM Level 2
* Implementation Provided by Steven Wood
*/
$w.__defineGetter__("HTMLTableCellElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLTableCellElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);
};
HTMLTableCellElement.prototype = new HTMLElement;
__extend__(HTMLTableCellElement.prototype, {
    
    
    // TODO :
    
});

			$debug("Defining HTMLRowElement");
/* 
* HTMLRowElement - DOM Level 2
* Implementation Provided by Steven Wood
*/
$w.__defineGetter__("HTMLTableRowElement", function(){
    return function(){
        throw new Error("Object cannot be created in this context");
    };
});

var HTMLTableRowElement = function(ownerDocument) {
    this.HTMLElement = HTMLElement;
    this.HTMLElement(ownerDocument);

};
HTMLTableRowElement.prototype = new HTMLElement;
__extend__(HTMLTableRowElement.prototype, {
    
    // align gets or sets the horizontal alignment of data within cells of the row.
    get align() {
        return this.getAttribute("align");
    },
     
    get bgColor() {
        return this.getAttribute("bgcolor");
    },
         
    get cells() {
        var nl = this.getElementsByTagName("td");
        return new HTMLCollection(nl);
    },
       
    get ch() {
        return this.getAttribute("ch");
    },
     
    set ch(ch) {
        this.setAttribute("ch", ch);
    },
    
    // ch gets or sets the alignment character for cells in a column. 
    set chOff(chOff) {
        this.setAttribute("chOff", chOff);
    },
     
    get chOff(chOff) {
        return this.getAttribute("chOff");
    },
   
    get rowIndex() {
        var nl = this.parentNode.childNodes;
        for (var i=0; i<nl.length; i++) {
            if (nl[i] === this) {
                return i;
            }
        }
    },

    get sectionRowIndex() {
        var nl = this.parentNode.getElementsByTagName(this.tagName);
        for (var i=0; i<nl.length; i++) {
            if (nl[i] === this) {
                return i;
            }
        }
    },
     
    get vAlign () {
         return this.getAttribute("vAlign");
    },

    insertCell : function (idx) {
        if (idx === undefined) {
            throw new Error("Index omitted in call to HTMLTableRow.insertCell");
        }
        
        var numCells = this.cells.length,
            node = null;
        
        if (idx > numCells) {
            throw new Error("Index > rows.length in call to HTMLTableRow.insertCell");
        }
        
        var cell = document.createElement("td");

        if (idx === -1 || idx === numCells) {
            this.appendChild(cell);
        } else {
            

            node = this.firstChild;

            for (var i=0; i<idx; i++) {
                node = node.nextSibling;
            }
        }
            
        this.insertBefore(cell, node);
        
        return cell;
    },
    
    deleteCell : function (idx) {
        var elem = this.cells[idx];
        this.removeChild(elem);
    }
    
    
});

			$debug("Defining Event");
/*
* event.js
*/
$w.__defineGetter__("Event", function(){
    __extend__(this,{
        CAPTURING_PHASE : 1,
        AT_TARGET       : 2,
        BUBBLING_PHASE  : 3
    });
    if(this.__output__ == undefined) {
        this.__output__ = function(){
            throw new Error("Object cannot be created in this context");
        };
    }
    return this.__output__;
});

var Event = function(options){
  if(options === undefined){
      options={target:window,currentTarget:window};
  }
  __extend__(this,{
    CAPTURING_PHASE : 1,
    AT_TARGET       : 2,
    BUBBLING_PHASE  : 3
  });
  $debug("Creating new Event");
  var $bubbles = options.bubbles?options.bubbles:true,
      $cancelable = options.cancelable?options.cancelable:true,
      $currentTarget = options.currentTarget?options.currentTarget:null,
      $eventPhase = options.eventPhase?options.eventPhase:Event.CAPTURING_PHASE,
      $target = options.eventPhase?options.eventPhase:document,
      $timestamp = options.timestamp?options.timestamp:new Date().getTime().toString(),
      $type = options.type?options.type:"";
  return __extend__(this,{
    get bubbles(){return $bubbles;},
    get cancelable(){return $cancelable;},
    get currentTarget(){return $currentTarget;},
    get eventPhase(){return $eventPhase;},
    get target(){return $target;},
    get timestamp(){return $timestamp;},
    get type(){return $type;},
    initEvent: function(type,bubbles,cancelable){
      $type=type?type:$type;
      $bubbles=bubbles?bubbles:$bubbles;
      $cancelable=cancelable?cancelable:$cancelable;
    },
    preventDefault: function(){return;/* TODO */},
    stopPropagation: function(){return;/* TODO */}
  });
};

$debug("Defining MouseEvent");
/*
*	mouseevent.js
*/
$debug("Defining MouseEvent");
/*
*	uievent.js
*/

var $onblur,
    $onfocus,
    $onresize;/*
* CSS2Properties - DOM Level 2 CSS
*/
$w.__defineGetter__("CSS2Properties", function(){
  return function(){
    throw new Error("Object cannot be created in this context");
  };
});


var CSS2Properties = function(options){
    __extend__(this, __supportedStyles__);
    __cssTextToStyles__(this, options.cssText?options.cssText:"");
};
__extend__(CSS2Properties.prototype, {
    get cssText(){
        return Array.prototype.apply.join(this,[';\n']);
    },
    set cssText(cssText){ 
        __cssTextToStyles__(this, cssText); 
    },
    getPropertyCSSValue : function(){
        
    },
    getPropertyPriority : function(){
        
    },
    getPropertyValue : function(name){
		var camelCase = name.replace(/\-(\w)/g, function(all, letter){
			return letter.toUpperCase();
		});
        var i, value = this[camelCase];
        if(value === undefined){
            for(i=0;i<this.length;i++){
                if(this[i]===name){
                    return this[i];
                }
            }
        }
        return value;
    },
    item : function(index){
        return this[index];
    },
    removeProperty: function(){
        
    },
    setProperty: function(){
        
    },
    toString:function(){
        if (this.length >0){
            return "{\n\t"+Array.prototype.join.apply(this,[';\n\t'])+"}\n";
        }else{
            return '';
        }
    }
});

var __cssTextToStyles__ = function(css2props, cssText){
    var styleArray=[];
    var style, name, value, camelCaseName, w3cName, styles = cssText.split(';');
    for ( var i = 0; i < styles.length; i++ ) {
        //$log("Adding style property " + styles[i]);
    	style = styles[i].split(':');
    	if ( style.length == 2 ){
    	    //keep a reference to the original name of the style which was set
    	    //this is the w3c style setting method.
    	    styleArray[styleArray.length] = w3cName = styles[i];
            //camel case for dash case
    	    value = trim(style[1]);
            camelCaseName = trim(style[0].replace(/\-(\w)/g, function(all, letter){
				return letter.toUpperCase();
			}));
            $debug('CSS Style Name:  ' + camelCaseName);
            if(css2props[camelCaseName]!==undefined){
                //set the value internally with camelcase name 
                $debug('Setting css ' + camelCaseName + ' to ' + value);
                css2props[camelCaseName] = value;
            };
    	}
    }
    __setArray__(css2props, styleArray);
};
//Obviously these arent all supported but by commenting out various sections
//this provides a single location to configure what is exposed as supported.
//These will likely need to be functional getters/setters in the future to deal with
//the variation on input formulations
var __supportedStyles__ = {
    azimuth: "",
    background:	"",
    backgroundAttachment:	"",
    backgroundColor:	"",
    backgroundImage:	"",
    backgroundPosition:	"",
    backgroundRepeat:	"",
    border:	"",
    borderBottom:	"",
    borderBottomColor:	"",
    borderBottomStyle:	"",
    borderBottomWidth:	"",
    borderCollapse:	"",
    borderColor:	"",
    borderLeft:	"",
    borderLeftColor:	"",
    borderLeftStyle:	"",
    borderLeftWidth:	"",
    borderRight:	"",
    borderRightColor:	"",
    borderRightStyle:	"",
    borderRightWidth:	"",
    borderSpacing:	"",
    borderStyle:	"",
    borderTop:	"",
    borderTopColor:	"",
    borderTopStyle:	"",
    borderTopWidth:	"",
    borderWidth:	"",
    bottom:	"",
    captionSide:	"",
    clear:	"",
    clip:	"",
    color:	"",
    content:	"",
    counterIncrement:	"",
    counterReset:	"",
    cssFloat:	"",
    cue:	"",
    cueAfter:	"",
    cueBefore:	"",
    cursor:	"",
    direction:	"",
    display:	"",
    elevation:	"",
    emptyCells:	"",
    font:	"",
    fontFamily:	"",
    fontSize:	"",
    fontSizeAdjust:	"",
    fontStretch:	"",
    fontStyle:	"",
    fontVariant:	"",
    fontWeight:	"",
    height:	"",
    left:	"",
    letterSpacing:	"",
    lineHeight:	"",
    listStyle:	"",
    listStyleImage:	"",
    listStylePosition:	"",
    listStyleType:	"",
    margin:	"",
    marginBottom:	"",
    marginLeft:	"",
    marginRight:	"",
    marginTop:	"",
    markerOffset:	"",
    marks:	"",
    maxHeight:	"",
    maxWidth:	"",
    minHeight:	"",
    minWidth:	"",
    opacity:	1,
    orphans:	"",
    outline:	"",
    outlineColor:	"",
    outlineOffset:	"",
    outlineStyle:	"",
    outlineWidth:	"",
    overflow:	"",
    overflowX:	"",
    overflowY:	"",
    padding:	"",
    paddingBottom:	"",
    paddingLeft:	"",
    paddingRight:	"",
    paddingTop:	"",
    page:	"",
    pageBreakAfter:	"",
    pageBreakBefore:	"",
    pageBreakInside:	"",
    pause:	"",
    pauseAfter:	"",
    pauseBefore:	"",
    pitch:	"",
    pitchRange:	"",
    position:	"",
    quotes:	"",
    richness:	"",
    right:	"",
    size:	"",
    speak:	"",
    speakHeader:	"",
    speakNumeral:	"",
    speakPunctuation:	"",
    speechRate:	"",
    stress:	"",
    tableLayout:	"",
    textAlign:	"",
    textDecoration:	"",
    textIndent:	"",
    textShadow:	"",
    textTransform:	"",
    top:	"",
    unicodeBidi:	"",
    verticalAlign:	"",
    visibility:	"",
    voiceFamily:	"",
    volume:	"",
    whiteSpace:	"",
    widows:	"",
    width:	"",
    wordSpacing:	"",
    zIndex:	""
};/* 
* CSSRule - DOM Level 2
*/
$w.__defineGetter__("CSSRule", function(){
  return function(){
    throw new Error("Object cannot be created in this context");
  };
});

var CSSRule = function(options){
  var $style, 
      $selectorText = options.selectorText?options.selectorText:"";
      $style = new CSS2Properties({
          cssText:options.cssText?options.cssText:null
      });
    return __extend__(this, {
      get style(){
          return $style;
      },
      get selectorText(){
          return $selectorText;
      },
      set selectorText(selectorText){
          $selectorText = selectorText;
      }
    });
};
/* 
* CSSStyleSheet - DOM Level 2
*/
$w.__defineGetter__("CSSStyleSheet", function(){
  return function(){
    throw new Error("Object cannot be created in this context");
  };
});

var CSSStyleSheet = function(options){
    var $cssRules, 
        $disabled = options.disabled?options.disabled:false,
        $href = options.href?options.href:null,
        $parentStyleSheet = options.parentStyleSheet?options.parentStyleSheet:null,
        $title = options.title?options.title:"",
        $type = "text/css";
        
    function parseStyleSheet(text){
        $debug("parsing css");
        //this is pretty ugly, but text is the entire text of a stylesheet
        var cssRules = [];
    	if (!text) text = "";
    	text = trim(text.replace(/\/\*(\r|\n|.)*\*\//g,""));
    	// TODO: @import ?
    	var blocks = text.split("}");
    	blocks.pop();
    	var i, len = blocks.length;
    	var definition_block, properties, selectors;
    	for (i=0; i<len; i++){
    		definition_block = blocks[i].split("{");
    		if(definition_block.length === 2){
      		selectors = definition_block[0].split(",");
      		for(var j=0;j<selectors.length;j++){
      		  cssRules.push(new CSSRule({
      		    selectorText:selectors[j],
      		    cssText:definition_block[1]
      		  }));
      		}
      		__setArray__($cssRules, cssRules);
    		}
    	}
    };
    parseStyleSheet(options.text);
    return __extend__(this, {
      get cssRules(){return $cssRules;},
      get rule(){return $cssRules;},//IE - may be deprecated
      get href(){return $href;},
      get parentStyleSheet(){return $parentStyleSheet;},
      get title(){return $title;},
      get type(){return $type;},
      addRule: function(selector, style, index){/*TODO*/},
      deleteRule: function(index){/*TODO*/},
      insertRule: function(rule, index){/*TODO*/},
      removeRule: function(index){this.deleteRule(index);}//IE - may be deprecated
    });
};
/*
*	location.js
*   - requires env
*/
$debug("Initializing Window Location.");
//the current location
var $location = '';

$w.__defineSetter__("location", function(url){
    //$w.onunload();
	$location = $env.location(url);
	setHistory($location);
	$w.document.load($location);
});

$w.__defineGetter__("location", function(url){
	var hash 	 = new RegExp('(\\#.*)'),
		hostname = new RegExp('\/\/([^\:\/]+)'),
		pathname = new RegExp('(\/[^\\?\\#]*)'),
		port 	 = new RegExp('\:(\\d+)\/'),
		protocol = new RegExp('(^\\w*\:)'),
		search 	 = new RegExp('(\\?[^\\#]*)');
	return {
		get hash(){
			var m = hash.exec(this.href);
			return m&&m.length>1?m[1]:"";
		},
		set hash(_hash){
			//setting the hash is the only property of the location object
			//that doesn't cause the window to reload
			_hash = _hash.indexOf('#')===0?_hash:"#"+_hash;	
			$location = this.protocol + this.host + this.pathname + 
				this.search + _hash;
			setHistory(_hash, "hash");
		},
		get host(){
			return this.hostname + (this.port !== "")?":"+this.port:"";
		},
		set host(_host){
			$w.location = this.protocol + _host + this.pathname + 
				this.search + this.hash;
		},
		get hostname(){
			var m = hostname.exec(this.href);
			return m&&m.length>1?m[1]:"";
		},
		set hostname(_hostname){
			$w.location = this.protocol + _hostname + ((this.port==="")?"":(":"+this.port)) +
			 	 this.pathname + this.search + this.hash;
		},
		get href(){
			//This is the only env specific function
			return $location;
		},
		set href(url){
			$w.location = url;	
		},
		get pathname(){
			var m = this.href;
			m = pathname.exec(m.substring(m.indexOf(this.hostname)));
			return m&&m.length>1?m[1]:"/";
		},
		set pathname(_pathname){
			$w.location = this.protocol + this.host + _pathname + 
				this.search + this.hash;
		},
		get port(){
			var m = port.exec(this.href);
			return m&&m.length>1?m[1]:"";
		},
		set port(_port){
			$w.location = this.protocol + this.hostname + ":"+_port + this.pathname + 
				this.search + this.hash;
		},
		get protocol(){
			return protocol.exec(this.href)[0];
		},
		set protocol(_protocol){
			$w.location = _protocol + this.host + this.pathname + 
				this.search + this.hash;
		},
		get search(){
			var m = search.exec(this.href);
			return m&&m.length>1?m[1]:"";
		},
		set search(_search){
			$w.location = this.protocol + this.host + this.pathname + 
				_search + this.hash;
		},
		toString: function(){
			return this.href;
		},
		reload: function(force){
			//TODO
		},
		replace: function(url){
			//TODO
		}
	};
});

/*
*	history.js
*/

    $info("Initializing Window History.");
	$currentHistoryIndex = 0;
	$history = [];
	
	// Browser History
	$w.__defineGetter__("history", function(){	
		return {
			get length(){ return $history.length; },
			back : function(count){
				if(count){
					go(-count);
				}else{go(-1);}
			},
			forward : function(count){
				if(count){
					go(count);
				}else{go(1);}
			},
			go : function(target){
				if(typeof target == "number"){
					target = $currentHistoryIndex+target;
					if(target > -1 && target < $history.length){
						if($history[target].location == "hash"){
							$w.location.hash = $history[target].value;
						}else{
							$w.location = $history[target].value;
						}
						$currentHistoryIndex = target;
						//remove the last item added to the history
						//since we are moving inside the history
						$history.pop();
					}
				}else{
					//TODO: walk throu the history and find the 'best match'
				}
			}
		};
	});

	//Here locationPart is the particutlar method/attribute 
	// of the location object that was modified.  This allows us
	// to modify the correct portion of the location object
	// when we navigate the history
	var setHistory = function( value, locationPart){
	    $info("adding value to history: " +value);
		$currentHistoryIndex++;
		$history.push({
			location: locationPart||"href",
			value: value
		});
	};
	/*
*	navigator.js
*   - requires env
*/
$debug("Initializing Window Navigator.");

var $appCodeName  = $env.appCodeName;//eg "Mozilla"
var $appName      = $env.appName;//eg "Gecko/20070309 Firefox/2.0.0.3"

// Browser Navigator
$w.__defineGetter__("navigator", function(){	
	return {
		get appCodeName(){
			return $appCodeName;
		},
		get appName(){
			return $appName;
		},
		get appVersion(){
			return $version +" ("+ 
			    $w.navigator.platform +"; "+
			    "U; "+//?
			    $env.os_name+" "+$env.os_arch+" "+$env.os_version+"; "+
			    $env.lang+"; "+
			    "rv:"+$revision+
			  ")";
		},
		get cookieEnabled(){
			return true;
		},
		get mimeTypes(){
			return [];
		},
		get platform(){
			return $env.platform;
		},
		get plugins(){
			return [];
		},
		get userAgent(){
			return $w.navigator.appCodeName + "/" + $w.navigator.appVersion + " " + $w.navigator.appName;
		},
		javaEnabled : function(){
			return $env.javaEnabled;	
		}
	};
});

/*
*	timer.js
*/
	

$debug("Initializing Window Timer.");

//private
var $timers = [];

$w.setTimeout = function(fn, time){
	var num;
	return num = window.setInterval(function(){
		fn();
		window.clearInterval(num);
	}, time);
};

window.setInterval = function(fn, time){
	var num = $timers.length;
	
    if (typeof fn == 'string') {
        var fnstr = fn; 
        fn = function() { 
            eval(fnstr); 
        }; 
    }
	if(time===0){
	    fn();
	}else{
	    // $log("Creating timer number "+num);
    	$timers[num] = $env.timer(fn, time);
    	$timers[num].start();
	}
	return num;
};

window.clearInterval = window.clearTimeout = function(num){
	if ( $timers[num] ) {
	    
	    $debug("Deleting timer number "+num);
		$timers[num].stop();
		delete $timers[num];
	}
};	
	/*
* event.js
*/
// Window Events
$debug("Initializing Window Event.");
var $events = [],
    $onerror,
    $onload,
    $onunload;

$w.addEventListener = function(type, fn){
  //$log("adding event listener " + type);
	if ( !this.uuid ) {
		this.uuid = $events.length;
		$events[this.uuid] = {};
	}
	if ( !$events[this.uuid][type] ){
		$events[this.uuid][type] = [];
	}
	if ( $events[this.uuid][type].indexOf( fn ) < 0 ){
		$events[this.uuid][type].push( fn );
	}
};

$w.removeEventListener = function(type, fn){
  if ( !this.uuid ) {
    this.uuid = $events.length;
    $events[this.uuid] = {};
  }
  if ( !$events[this.uuid][type] ){
		$events[this.uuid][type] = [];
	}	
  $events[this.uuid][type] =
    $events[this.uuid][type].filter(function(f){
			return f != fn;
		});
};

$w.dispatchEvent = function(event){
    //$log("dispatching event " + event.type);
    //the window scope defines the $event object, for IE(^^^) compatibility;
    $event = event;
    if(!event.target)
        event.target = this;
    if ( event.type ) {
        if ( this.uuid && $events[this.uuid][event.type] ) {
            var _this = this;
            $events[this.uuid][event.type].forEach(function(fn){
                fn.call( _this, event );
            });
        }
    
        if ( this["on" + event.type] )
            this["on" + event.type].call( _this, event );
    }
    if(this.parentNode){
        this.parentNode.dispatchEvent.call(this.parentNode,event);
    }
};
	
$w.__defineGetter__('onerror', function(){
  return function(){
   //$w.dispatchEvent('error');
  };
});

$w.__defineSetter__('onerror', function(fn){
  //$w.addEventListener('error', fn);
});

/*$w.__defineGetter__('onload', function(){
  return function(){
		//var event = document.createEvent();
		//event.initEvent("load");
   //$w.dispatchEvent(event);
  };
});

$w.__defineSetter__('onload', function(fn){
  //$w.addEventListener('load', fn);
});

$w.__defineGetter__('onunload', function(){
  return function(){
   //$w.dispatchEvent('unload');
  };
});

$w.__defineSetter__('onunload', function(fn){
  //$w.addEventListener('unload', fn);
});*//*
*	xhr.js
*/
$debug("Initializing Window XMLHttpRequest.");
// XMLHttpRequest
// Originally implemented by Yehuda Katz
$w.XMLHttpRequest = function(){
	this.headers = {};
	this.responseHeaders = {};
	$debug("creating xhr");
};

XMLHttpRequest.prototype = {
	open: function(method, url, async, user, password){ 
		this.readyState = 1;
		if (async === false ){
			this.async = false;
		}else{ this.async = true; }
		this.method = method || "GET";
		this.url = $env.location(url);
		this.onreadystatechange();
	},
	setRequestHeader: function(header, value){
		this.headers[header] = value;
	},
	getResponseHeader: function(header){ },
	send: function(data){
		var _this = this;
		
		function makeRequest(){
			$env.connection(_this, function(){
			  var responseXML = null;
				_this.__defineGetter__("responseXML", function(){
      				if ( _this.responseText.match(/^\s*</) ) {
      				  if(responseXML){
      				      return responseXML;
      				      
  				      }else{
        					try {
        					    $debug("parsing response text into xml document");
        						responseXML = $domparser.parseFromString(_this.responseText+"");
                                return responseXML;
        					} catch(e) { return null;/*TODO: need to flag an error here*/}
      					}
      				}else{return null;}
      			});
			});
			_this.onreadystatechange();
		}
		if (this.async){
		    $debug("XHR sending asynch;");
			$env.runAsync(makeRequest);
		}else{
		    $debug("XHR sending synch;");
			makeRequest();
		}
	},
	abort: function(){
		//TODO
	},
	onreadystatechange: function(){
		//TODO
	},
	getResponseHeader: function(header){
	  var rHeader, returnedHeaders;
		if (this.readyState < 3){
			throw new Error("INVALID_STATE_ERR");
		} else {
			returnedHeaders = [];
			for (rHeader in this.responseHeaders) {
				if (rHeader.match(new RegExp(header, "i")))
					returnedHeaders.push(this.responseHeaders[rHeader]);
			}
			if (returnedHeaders.length){ return returnedHeaders.join(", "); }
		}return null;
	},
	getAllResponseHeaders: function(){
	  var header, returnedHeaders = [];
		if (this.readyState < 3){
			throw new Error("INVALID_STATE_ERR");
		} else {
			for (header in this.responseHeaders){
				returnedHeaders.push( header + ": " + this.responseHeaders[header] );
			}
		}return returnedHeaders.join("\r\n");
	},
	async: true,
	readyState: 0,
	responseText: "",
	status: 0
};/*
*	css.js
*/
$debug("Initializing Window CSS");
// returns a CSS2Properties object that represents the style
// attributes and values used to render the specified element in this
// window.  Any length values are always expressed in pixel, or
// absolute values.
$w.getComputedStyle = function(elt, pseudo_elt){
  //TODO
  //this is a naive implementation
  $debug("Getting computed style");
  return elt?elt.style:new CSS2Properties({cssText:""});
};/*
*	screen.js
*/
$debug("Initializing Window Screen.");

var $availHeight  = 600,
    $availWidth   = 800,
    $colorDepth    = 16,
    $height       = 600,
    $width        = 800;
    
$w.__defineGetter__("screen", function(){
  return {
    get availHeight(){return $availHeight;},
    get availWidth(){return $availWidth;},
    get colorDepth(){return $colorDepth;},
    get height(){return $height;},
    get width(){return $width;}
  };
});


$w.moveBy = function(dx,dy){
  //TODO
};

$w.moveTo = function(x,y) {
  //TODO
};

/*$w.print = function(){
  //TODO
};*/

$w.resizeBy = function(dw, dh){
  $w.resizeTo($width+dw,$height+dh);
};

$w.resizeTo = function(width, height){
  $width = (width <= $availWidth) ? width : $availWidth;
  $height = (height <= $availHeight) ? height : $availHeight;
};


$w.scroll = function(x,y){
  //TODO
};
$w.scrollBy = function(dx, dy){
  //TODO
};
$w.scrollTo = function(x,y){
  //TODO
};/*
*	dialog.js
*/
$debug("Initializing Window Dialogs.");
$w.alert = function(message){
 //TODO 
};

$w.confirm = function(question){
  //TODO
};

$w.prompt = function(message, defaultMsg){
  //TODO
};/**
* jQuery AOP - jQuery plugin to add features of aspect-oriented programming (AOP) to jQuery.
* http://jquery-aop.googlecode.com/
*
* Licensed under the MIT license:
* http://www.opensource.org/licenses/mit-license.php
*
* Version: 1.1
*/
window.$profiler;

(function() {

	var _after	= 1;
	var _before	= 2;
	var _around	= 3;
	var _intro  = 4;
	var _regexEnabled = true;

	/**
	 * Private weaving function.
	 */
	var weaveOne = function(source, method, advice) {

		var old = source[method];

		var aspect;
		if (advice.type == _after)
			aspect = function() {
				var returnValue = old.apply(this, arguments);
				return advice.value.apply(this, [returnValue, method]);
			};
		else if (advice.type == _before)
			aspect = function() {
				advice.value.apply(this, [arguments, method]);
				return old.apply(this, arguments);
			};
		else if (advice.type == _intro)
			aspect = function() {
				return advice.value.apply(this, arguments);
			};
		else if (advice.type == _around) {
			aspect = function() {
				var invocation = { object: this, args: arguments };
				return advice.value.apply(invocation.object, [{ arguments: invocation.args, method: method, proceed : 
					function() {
						return old.apply(invocation.object, invocation.args);
					}
				}] );
			};
		}

		aspect.unweave = function() { 
			source[method] = old;
			pointcut = source = aspect = old = null;
		};

		source[method] = aspect;

		return aspect;

	};


	/**
	 * Private weaver and pointcut parser.
	 */
	var weave = function(pointcut, advice)
	{

		var source = (typeof(pointcut.target.prototype) != 'undefined') ? pointcut.target.prototype : pointcut.target;
		var advices = [];

		// If it's not an introduction and no method was found, try with regex...
		if (advice.type != _intro && typeof(source[pointcut.method]) == 'undefined')
		{

			for (var method in source)
			{
				if (source[method] != null && source[method] instanceof Function && method.match(pointcut.method))
				{
					advices[advices.length] = weaveOne(source, method, advice);
				}
			}

			if (advices.length == 0)
				throw 'No method: ' + pointcut.method;

		} 
		else
		{
			// Return as an array of one element
			advices[0] = weaveOne(source, pointcut.method, advice);
		}

		return _regexEnabled ? advices : advices[0];

	};

	window.$profiler = 
	{
		/**
		 * Creates an advice after the defined point-cut. The advice will be executed after the point-cut method 
		 * has completed execution successfully, and will receive one parameter with the result of the execution.
		 * This function returns an array of weaved aspects (Function).
		 *
		 * @example jQuery.aop.after( {target: window, method: 'MyGlobalMethod'}, function(result) { alert('Returned: ' + result); } );
		 * @result Array<Function>
		 *
		 * @example jQuery.aop.after( {target: String, method: 'indexOf'}, function(index) { alert('Result found at: ' + index + ' on:' + this); } );
		 * @result Array<Function>
		 *
		 * @name after
		 * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
		 * @option Object target Target object to be weaved. 
		 * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
		 * @param Function advice Function containing the code that will get called after the execution of the point-cut. It receives one parameter
		 *                        with the result of the point-cut's execution.
		 *
		 * @type Array<Function>
		 * @cat Plugins/General
		 */
		after : function(pointcut, advice)
		{
			return weave( pointcut, { type: _after, value: advice } );
		},

		/**
		 * Creates an advice before the defined point-cut. The advice will be executed before the point-cut method 
		 * but cannot modify the behavior of the method, or prevent its execution.
		 * This function returns an array of weaved aspects (Function).
		 *
		 * @example jQuery.aop.before( {target: window, method: 'MyGlobalMethod'}, function() { alert('About to execute MyGlobalMethod'); } );
		 * @result Array<Function>
		 *
		 * @example jQuery.aop.before( {target: String, method: 'indexOf'}, function(index) { alert('About to execute String.indexOf on: ' + this); } );
		 * @result Array<Function>
		 *
		 * @name before
		 * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
		 * @option Object target Target object to be weaved. 
		 * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
		 * @param Function advice Function containing the code that will get called before the execution of the point-cut.
		 *
		 * @type Array<Function>
		 * @cat Plugins/General
		 */
		before : function(pointcut, advice)
		{
			return weave( pointcut, { type: _before, value: advice } );
		},


		/**
		 * Creates an advice 'around' the defined point-cut. This type of advice can control the point-cut method execution by calling
		 * the functions '.proceed()' on the 'invocation' object, and also, can modify the arguments collection before sending them to the function call.
		 * This function returns an array of weaved aspects (Function).
		 *
		 * @example jQuery.aop.around( {target: window, method: 'MyGlobalMethod'}, function(invocation) {
		 *                alert('# of Arguments: ' + invocation.arguments.length); 
		 *                return invocation.proceed(); 
		 *          } );
		 * @result Array<Function>
		 *
		 * @example jQuery.aop.around( {target: String, method: 'indexOf'}, function(invocation) { 
		 *                alert('Searching: ' + invocation.arguments[0] + ' on: ' + this); 
		 *                return invocation.proceed(); 
		 *          } );
		 * @result Array<Function>
		 *
		 * @example jQuery.aop.around( {target: window, method: /Get(\d+)/}, function(invocation) {
		 *                alert('Executing ' + invocation.method); 
		 *                return invocation.proceed(); 
		 *          } );
		 * @desc Matches all global methods starting with 'Get' and followed by a number.
		 * @result Array<Function>
		 *
		 *
		 * @name around
		 * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
		 * @option Object target Target object to be weaved. 
		 * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
		 * @param Function advice Function containing the code that will get called around the execution of the point-cut. This advice will be called with one
		 *                        argument containing one function '.proceed()', the collection of arguments '.arguments', and the matched method name '.method'.
		 *
		 * @type Array<Function>
		 * @cat Plugins/General
		 */
		around : function(pointcut, advice)
		{
			return weave( pointcut, { type: _around, value: advice } );
		},

		/**
		 * Creates an introduction on the defined point-cut. This type of advice replaces any existing methods with the same
		 * name. To restore them, just unweave it.
		 * This function returns an array with only one weaved aspect (Function).
		 *
		 * @example jQuery.aop.introduction( {target: window, method: 'MyGlobalMethod'}, function(result) { alert('Returned: ' + result); } );
		 * @result Array<Function>
		 *
		 * @example jQuery.aop.introduction( {target: String, method: 'log'}, function() { alert('Console: ' + this); } );
		 * @result Array<Function>
		 *
		 * @name introduction
		 * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
		 * @option Object target Target object to be weaved. 
		 * @option String method Name of the function to be weaved.
		 * @param Function advice Function containing the code that will be executed on the point-cut. 
		 *
		 * @type Array<Function>
		 * @cat Plugins/General
		 */
		introduction : function(pointcut, advice)
		{
			return weave( pointcut, { type: _intro, value: advice } );
		},
		
		/**
		 * Configures global options.
		 *
		 * @name setup
		 * @param Map settings Configuration options.
		 * @option Boolean regexMatch Enables/disables regex matching of method names.
		 *
		 * @example jQuery.aop.setup( { regexMatch: false } );
		 * @desc Disable regex matching.
		 *
		 * @type Void
		 * @cat Plugins/General
		 */
		setup: function(settings)
		{
			_regexEnabled = settings.regexMatch;
		}
	};

})();


var $profile = window.$profile = {};


var __profile__ = function(id, invocation){
    var start = new Date().getTime();
    var retval = invocation.proceed(); 
    var finish = new Date().getTime();
    $profile[id] = $profile[id] ? $profile[id] : {};
    $profile[id].callCount = $profile[id].callCount !== undefined ? 
        $profile[id].callCount+1 : 0;
    $profile[id].times = $profile[id].times ? $profile[id].times : [];
    $profile[id].times[$profile[id].callCount++] = (finish-start);
    return retval;
};


window.$profiler.stats = function(raw){
    var max     = 0,
        avg     = -1,
        min     = 10000000,
        own     = 0;
    for(var i = 0;i<raw.length;i++){
        if(raw[i] > 0){
            own += raw[i];
        };
        if(raw[i] > max){
            max = raw[i];
        }
        if(raw[i] < min){
            min = raw[i];
        }
    }
    avg = Math.floor(own/raw.length);
    return {
        min: min,
        max: max,
        avg: avg,
        own: own
    };
};

if(__env__.profile){
    /**
    *   CSS2Properties
    */
    window.$profiler.around({ target: CSS2Properties,  method:"getPropertyCSSValue"}, function(invocation) {
        return __profile__("CSS2Properties.getPropertyCSSValue", invocation);
    });  
    window.$profiler.around({ target: CSS2Properties,  method:"getPropertyPriority"}, function(invocation) {
        return __profile__("CSS2Properties.getPropertyPriority", invocation);
    });  
    window.$profiler.around({ target: CSS2Properties,  method:"getPropertyValue"}, function(invocation) {
        return __profile__("CSS2Properties.getPropertyValue", invocation);
    });  
    window.$profiler.around({ target: CSS2Properties,  method:"item"}, function(invocation) {
        return __profile__("CSS2Properties.item", invocation);
    });  
    window.$profiler.around({ target: CSS2Properties,  method:"removeProperty"}, function(invocation) {
        return __profile__("CSS2Properties.removeProperty", invocation);
    });  
    window.$profiler.around({ target: CSS2Properties,  method:"setProperty"}, function(invocation) {
        return __profile__("CSS2Properties.setProperty", invocation);
    });  
    window.$profiler.around({ target: CSS2Properties,  method:"toString"}, function(invocation) {
        return __profile__("CSS2Properties.toString", invocation);
    });  
               
    
    /**
    *   DOMNode
    */
                    
    window.$profiler.around({ target: DOMNode,  method:"hasAttributes"}, function(invocation) {
        return __profile__("DOMNode.hasAttributes", invocation);
    });          
    window.$profiler.around({ target: DOMNode,  method:"insertBefore"}, function(invocation) {
        return __profile__("DOMNode.insertBefore", invocation);
    }); 
    window.$profiler.around({ target: DOMNode,  method:"replaceChild"}, function(invocation) {
        return __profile__("DOMNode.replaceChild", invocation);
    }); 
    window.$profiler.around({ target: DOMNode,  method:"removeChild"}, function(invocation) {
        return __profile__("DOMNode.removeChild", invocation);
    }); 
    window.$profiler.around({ target: DOMNode,  method:"replaceChild"}, function(invocation) {
        return __profile__("DOMNode.replaceChild", invocation);
    }); 
    window.$profiler.around({ target: DOMNode,  method:"appendChild"}, function(invocation) {
        return __profile__("DOMNode.appendChild", invocation);
    }); 
    window.$profiler.around({ target: DOMNode,  method:"hasChildNodes"}, function(invocation) {
        return __profile__("DOMNode.hasChildNodes", invocation);
    }); 
    window.$profiler.around({ target: DOMNode,  method:"cloneNode"}, function(invocation) {
        return __profile__("DOMNode.cloneNode", invocation);
    }); 
    window.$profiler.around({ target: DOMNode,  method:"normalize"}, function(invocation) {
        return __profile__("DOMNode.normalize", invocation);
    }); 
    window.$profiler.around({ target: DOMNode,  method:"isSupported"}, function(invocation) {
        return __profile__("DOMNode.isSupported", invocation);
    }); 
    window.$profiler.around({ target: DOMNode,  method:"getElementsByTagName"}, function(invocation) {
        return __profile__("DOMNode.getElementsByTagName", invocation);
    }); 
    window.$profiler.around({ target: DOMNode,  method:"getElementsByTagNameNS"}, function(invocation) {
        return __profile__("DOMNode.getElementsByTagNameNS", invocation);
    }); 
    window.$profiler.around({ target: DOMNode,  method:"importNode"}, function(invocation) {
        return __profile__("DOMNode.importNode", invocation);
    }); 
    window.$profiler.around({ target: DOMNode,  method:"contains"}, function(invocation) {
        return __profile__("DOMNode.contains", invocation);
    }); 
    window.$profiler.around({ target: DOMNode,  method:"compareDocumentPosition"}, function(invocation) {
        return __profile__("DOMNode.compareDocumentPosition", invocation);
    }); 
    
    
    /**
    *   DOMDocument
    */
    window.$profiler.around({ target: DOMDocument,  method:"addEventListener"}, function(invocation) {
        return __profile__("DOMDocument.addEventListener", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"removeEventListener"}, function(invocation) {
        return __profile__("DOMDocument.removeEventListener", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"attachEvent"}, function(invocation) {
        return __profile__("DOMDocument.attachEvent", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"detachEvent"}, function(invocation) {
        return __profile__("DOMDocument.detachEvent", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"dispatchEvent"}, function(invocation) {
        return __profile__("DOMDocument.dispatchEvent", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"loadXML"}, function(invocation) {
        return __profile__("DOMDocument.loadXML", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"load"}, function(invocation) {
        return __profile__("DOMDocument.load", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"createEvent"}, function(invocation) {
        return __profile__("DOMDocument.createEvent", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"createExpression"}, function(invocation) {
        return __profile__("DOMDocument.createExpression", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"createElement"}, function(invocation) {
        return __profile__("DOMDocument.createElement", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"createDocumentFragment"}, function(invocation) {
        return __profile__("DOMDocument.createDocumentFragment", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"createTextNode"}, function(invocation) {
        return __profile__("DOMDocument.createTextNode", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"createComment"}, function(invocation) {
        return __profile__("DOMDocument.createComment", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"createCDATASection"}, function(invocation) {
        return __profile__("DOMDocument.createCDATASection", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"createProcessingInstruction"}, function(invocation) {
        return __profile__("DOMDocument.createProcessingInstruction", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"createAttribute"}, function(invocation) {
        return __profile__("DOMDocument.createAttribute", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"createElementNS"}, function(invocation) {
        return __profile__("DOMDocument.createElementNS", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"createAttributeNS"}, function(invocation) {
        return __profile__("DOMDocument.createAttributeNS", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"createNamespace"}, function(invocation) {
        return __profile__("DOMDocument.createNamespace", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"getElementById"}, function(invocation) {
        return __profile__("DOMDocument.getElementById", invocation);
    });
    window.$profiler.around({ target: DOMDocument,  method:"normalizeDocument"}, function(invocation) {
        return __profile__("DOMDocument.normalizeDocument", invocation);
    });
    
    
    /**
    *   HTMLDocument
    */      
    window.$profiler.around({ target: HTMLDocument,  method:"createElement"}, function(invocation) {
        return __profile__("HTMLDocument.createElement", invocation);
    }); 
    
    /**
    *   DOMParser
    */      
    window.$profiler.around({ target: DOMParser,  method:"parseFromString"}, function(invocation) {
        return __profile__("DOMParser.parseFromString", invocation);
    }); 
    
    /**
    *   DOMNodeList
    */      
    window.$profiler.around({ target: DOMNodeList,  method:"item"}, function(invocation) {
        return __profile__("DOMNode.item", invocation);
    }); 
    window.$profiler.around({ target: DOMNodeList,  method:"toString"}, function(invocation) {
        return __profile__("DOMNode.toString", invocation);
    }); 
    
    /**
    *   XMLP
    */      
    window.$profiler.around({ target: XMLP,  method:"_addAttribute"}, function(invocation) {
        return __profile__("XMLP._addAttribute", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"_checkStructure"}, function(invocation) {
        return __profile__("XMLP._checkStructure", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"_clearAttributes"}, function(invocation) {
        return __profile__("XMLP._clearAttributes", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"_findAttributeIndex"}, function(invocation) {
        return __profile__("XMLP._findAttributeIndex", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"getAttributeCount"}, function(invocation) {
        return __profile__("XMLP.getAttributeCount", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"getAttributeName"}, function(invocation) {
        return __profile__("XMLP.getAttributeName", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"getAttributeValue"}, function(invocation) {
        return __profile__("XMLP.getAttributeValue", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"getAttributeValueByName"}, function(invocation) {
        return __profile__("XMLP.getAttributeValueByName", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"getColumnNumber"}, function(invocation) {
        return __profile__("XMLP.getColumnNumber", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"getContentBegin"}, function(invocation) {
        return __profile__("XMLP.getContentBegin", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"getContentEnd"}, function(invocation) {
        return __profile__("XMLP.getContentEnd", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"getLineNumber"}, function(invocation) {
        return __profile__("XMLP.getLineNumber", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"getName"}, function(invocation) {
        return __profile__("XMLP.getName", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"next"}, function(invocation) {
        return __profile__("XMLP.next", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"_parse"}, function(invocation) {
        return __profile__("XMLP._parse", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"_parse"}, function(invocation) {
        return __profile__("XMLP._parse", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"_parseAttribute"}, function(invocation) {
        return __profile__("XMLP._parseAttribute", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"_parseCDATA"}, function(invocation) {
        return __profile__("XMLP._parseCDATA", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"_parseComment"}, function(invocation) {
        return __profile__("XMLP._parseComment", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"_parseDTD"}, function(invocation) {
        return __profile__("XMLP._parseDTD", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"_parseElement"}, function(invocation) {
        return __profile__("XMLP._parseElement", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"_parseEntity"}, function(invocation) {
        return __profile__("XMLP._parseEntity", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"_parsePI"}, function(invocation) {
        return __profile__("XMLP._parsePI", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"_parseText"}, function(invocation) {
        return __profile__("XMLP._parseText", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"_replaceEntities"}, function(invocation) {
        return __profile__("XMLP._replaceEntities", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"_replaceEntity"}, function(invocation) {
        return __profile__("XMLP._replaceEntity", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"_setContent"}, function(invocation) {
        return __profile__("XMLP._setContent", invocation);
    }); 
    window.$profiler.around({ target: XMLP,  method:"_setErr"}, function(invocation) {
        return __profile__("XMLP._setErr", invocation);
    }); 
    
    
    /**
    *   SAXDriver
    */      
    window.$profiler.around({ target: SAXDriver,  method:"parse"}, function(invocation) {
        return __profile__("SAXDriver.parse", invocation);
    }); 
    window.$profiler.around({ target: SAXDriver,  method:"setDocumentHandler"}, function(invocation) {
        return __profile__("SAXDriver.setDocumentHandler", invocation);
    }); 
    window.$profiler.around({ target: SAXDriver,  method:"setErrorHandler"}, function(invocation) {
        return __profile__("SAXDriver.setErrorHandler", invocation);
    }); 
    window.$profiler.around({ target: SAXDriver,  method:"setLexicalHandler"}, function(invocation) {
        return __profile__("SAXDriver.setLexicalHandler", invocation);
    }); 
    window.$profiler.around({ target: SAXDriver,  method:"getColumnNumber"}, function(invocation) {
        return __profile__("SAXDriver.getColumnNumber", invocation);
    }); 
    window.$profiler.around({ target: SAXDriver,  method:"getLineNumber"}, function(invocation) {
        return __profile__("SAXDriver.getLineNumber", invocation);
    }); 
    window.$profiler.around({ target: SAXDriver,  method:"getMessage"}, function(invocation) {
        return __profile__("SAXDriver.getMessage", invocation);
    }); 
    window.$profiler.around({ target: SAXDriver,  method:"getPublicId"}, function(invocation) {
        return __profile__("SAXDriver.getPublicId", invocation);
    }); 
    window.$profiler.around({ target: SAXDriver,  method:"getSystemId"}, function(invocation) {
        return __profile__("SAXDriver.getSystemId", invocation);
    }); 
    window.$profiler.around({ target: SAXDriver,  method:"getLength"}, function(invocation) {
        return __profile__("SAXDriver.getLength", invocation);
    }); 
    window.$profiler.around({ target: SAXDriver,  method:"getName"}, function(invocation) {
        return __profile__("SAXDriver.getName", invocation);
    }); 
    window.$profiler.around({ target: SAXDriver,  method:"getValue"}, function(invocation) {
        return __profile__("SAXDriver.getValue", invocation);
    }); 
    window.$profiler.around({ target: SAXDriver,  method:"getValueByName"}, function(invocation) {
        return __profile__("SAXDriver.getValueByName", invocation);
    }); 
    window.$profiler.around({ target: SAXDriver,  method:"_fireError"}, function(invocation) {
        return __profile__("SAXDriver._fireError", invocation);
    }); 
    window.$profiler.around({ target: SAXDriver,  method:"_fireEvent"}, function(invocation) {
        return __profile__("SAXDriver._fireEvent", invocation);
    }); 
    window.$profiler.around({ target: SAXDriver,  method:"_parseLoop"}, function(invocation) {
        return __profile__("SAXDriver._parseLoop", invocation);
    }); 
    
    /**
    *   SAXStrings    
    */
    window.$profiler.around({ target: SAXStrings,  method:"getColumnNumber"}, function(invocation) {
        return __profile__("SAXStrings.getColumnNumber", invocation);
    }); 
    window.$profiler.around({ target: SAXStrings,  method:"getLineNumber"}, function(invocation) {
        return __profile__("SAXStrings.getLineNumber", invocation);
    }); 
    window.$profiler.around({ target: SAXStrings,  method:"indexOfNonWhitespace"}, function(invocation) {
        return __profile__("SAXStrings.indexOfNonWhitespace", invocation);
    }); 
    window.$profiler.around({ target: SAXStrings,  method:"indexOfWhitespace"}, function(invocation) {
        return __profile__("SAXStrings.indexOfWhitespace", invocation);
    }); 
    window.$profiler.around({ target: SAXStrings,  method:"isEmpty"}, function(invocation) {
        return __profile__("SAXStrings.isEmpty", invocation);
    }); 
    window.$profiler.around({ target: SAXStrings,  method:"lastIndexOfNonWhitespace"}, function(invocation) {
        return __profile__("SAXStrings.lastIndexOfNonWhitespace", invocation);
    }); 
    window.$profiler.around({ target: SAXStrings,  method:"replace"}, function(invocation) {
        return __profile__("SAXStrings.replace", invocation);
    }); 
    
    /**
    *   Stack - SAX Utility
    window.$profiler.around({ target: Stack,  method:"clear"}, function(invocation) {
        return __profile__("Stack.clear", invocation);
    }); 
    window.$profiler.around({ target: Stack,  method:"count"}, function(invocation) {
        return __profile__("Stack.count", invocation);
    }); 
    window.$profiler.around({ target: Stack,  method:"destroy"}, function(invocation) {
        return __profile__("Stack.destroy", invocation);
    }); 
    window.$profiler.around({ target: Stack,  method:"peek"}, function(invocation) {
        return __profile__("Stack.peek", invocation);
    }); 
    window.$profiler.around({ target: Stack,  method:"pop"}, function(invocation) {
        return __profile__("Stack.pop", invocation);
    }); 
    window.$profiler.around({ target: Stack,  method:"push"}, function(invocation) {
        return __profile__("Stack.push", invocation);
    }); 
    */
}
      
/*
*	document.js
*
*	DOM Level 2 /DOM level 3 (partial)
*	
*	This file adds the document object to the window and allows you
*	you to set the window.document using an html string or dom object.
*
*/

// read only reference to the Document object

$debug("Initializing window.document.");
var $async = false;
__extend__(HTMLDocument.prototype, {
	get async(){ return $async;},
	set async(async){ $async = async; },
	get baseURI(){ return $env.location('./'); },
	get URL(){ return $w.location.href;  }
});
	


var $document =  new HTMLDocument($implementation);
$w.__defineGetter__("document", function(){
	return $document;
});
$debug("Defining document.cookie");
/*
*	cookie.js
*   - requires env
*/

var $cookies = {
	persistent:{
		//domain - key on domain name {
			//path - key on path {
				//name - key on name {
					 //value : cookie value
					 //other cookie properties
				//}
			//}
		//}
		//expire - provides a timestamp for expiring the cookie
		//cookie - the cookie!
	},
	temporary:{//transient is a reserved word :(
		//like above
	}
};

//HTMLDocument cookie
document.__defineSetter__("cookie", function(cookie){
	var i,name,value,properties = {},attr,attrs = cookie.split(";");
	//for now the strategy is to simply create a json object
	//and post it to a file in the .cookies.js file.  I hate parsing
	//dates so I decided not to implement support for 'expires' 
	//(which is deprecated) and instead focus on the easier 'max-age'
	//(which succeeds 'expires') 
	cookie = {};//keyword properties of the cookie
	for(i=0;i<attrs.length;i++){
		attr = attrs[i].split("=");
		if(attr.length > 0){
			name = trim(attr[0]);
			value = trim(attr[1]);
			if(name=='max-age'){ 
				//we'll have to set a timer to check these 
				//and garbage collect expired cookies
				cookie[name] = parseInt(value, 10);
			} else if(name=='domain'){
				if(domainValid(value)){
					cookie['domain']=value;
				}else{
					cookie['domain']=$w.location.domain;
				}
			} else if(name=='path'){
				//not sure of any special logic for path
				cookie['path'] = value;
			} else {
				//its not a cookie keyword so store it in our array of properties
				//and we'll serialize individually in a moment
				properties[name] = value;
			}
		}else{
			if(attr[0] == 'secure'){
				cookie[attr[0]] = true;
			}
		}
	}
	if(!cookie['max-age']){
		//it's a transient cookie so it only lasts as long as 
		//the window.location remains the same
		mergeCookie($cookies.temporary, cookie, properties);
	}else if(cookie['max-age']===0){
		//delete the cookies
		//TODO
	}else{
		//the cookie is persistent
		mergeCookie($cookies.persistent, cookie, properties);
		persistCookies();
	}
});

document.__defineGetter__("cookie", function(c){
	//The cookies that are returned must belong to the same domain
	//and be at or below the current window.location.path.  Also
	//we must check to see if the cookie was set to 'secure' in which
	//case we must check our current location.protocol to make sure it's
	//https:
	var allcookies = [], i;
	//TODO 	
});



var domainValid = function(domain){
	//make sure the domain
	//TODO 	
};

var mergeCookie = function(target, cookie, properties){
	var name, now;
	if(!target[cookie.domain]){
		target[cookie.domain] = {};
	}
	if(!target[cookie.domain][cookie.path]){
		target[cookie.domain][cookie.path] = {};
	}
	for(name in properties){
		now = new Date().getTime();
		target[cookie.domain][cookie.path][name] = {
			value:properties[name],
			"@env:secure":cookie.secure,
			"@env:max-age":cookie['max-age'],
			"@env:date-created":now,
			"@env:expiration":now + cookie['max-age']
		};
	}
};

var persistCookies = function(){
	//TODO
	//I think it should be done via $env so it can be customized
};

var loadCookies = function(){
	//TODO
	//should also be configurable via $env	
};

//We simply use the default ajax get to load the .cookies.js file
//if it doesn't exist we create it with a post.  Cookies are maintained
//in memory, but serialized with each set.
$info("Loading Cookies");
try{
	//TODO - load cookies
	loadCookies();
}catch(e){
	//TODO - fail gracefully
}	
	/*
*	outro.js
*/

})(window, __env__, __policy__); 

}catch(e){
    __env__.error("ERROR LOADING ENV : " + e + "\nLINE SOURCE:\n" +__env__.lineSource(e));
}

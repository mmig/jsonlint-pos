/*
 * Standalone Wait Dialog (extracted from jQuery Mobile 1.4.3)
 * 
 * stdlne-wait-dlg
 *
 * <div class="stdlne-wait-dlg stdlne-style-b stdlne-wait-dlg-verbose"><span class="stdlne-icon"></span><h1>title</h1></div>
 * 
 * version 0.1
 * Copyright (C) 2015 russa, DFKI GmbH
 * MIT license
 * 
 * Dependencies:
 *   * document (DOM): body, head
 *     * createElement: div, span, h1
 *     * appendChild
 *     * classList
 *     * className
 *     * childNodes
 */

//(function(module){
define(function(){
	

var types = {
		'default': 'stdlne-wait-dlg-verbose',
		'small':   'stdlne-wait-dlg-small',
		'verbose': 'stdlne-wait-dlg-verbose'
};

var styles = {
		'default': 'stdlne-style-a',
		'a': 'stdlne-style-a',
		'b': 'stdlne-style-b'
};

var activatorClass = 'stdlne-active';
var defaultStyleUrl = 'stdlne-wait-dlg.css';


function StandaloneWaitDialog(){
	if(typeof window !== 'undefined' && this === window){
		return new StandaloneWaitDialog();
	}
	return this;
};

StandaloneWaitDialog.prototype = {
		defaultTitle: '',
		defaultStyle: styles['default'],
		defaultType:  types['default'],
		styleUrl:     defaultStyleUrl,
		_getDom: function(id){//returns: Array
			
			if(id){//if id: only return one element (in an array)
				var element = document.getElementById(id);
				return element? [element] : [];
			}
			return document.getElementsByClassName('stdlne-wait-dlg');
			
		},
		_loadStyle: function(url){
			if(!url){
				url = this.styleUrl;
			}
			var link = document.createElement("link");
			link.type = "text/css";
			link.rel  = "stylesheet";
			link.href = url;
			document.getElementsByTagName("head")[0].appendChild(link);
		},
		create: function(id, options){
			
			//TODO options argument
			var _type  = options && options.type  ? options.type  : this.defaultType;
			var _style = options && options.style ? styles[options.style] : this.defaultStyle;
			var _id = id;
			
			var container = document.createElement("div");
			container.className = 'stdlne-wait-dlg ' + _type +' ' + _style;
			if(_id){
				container.id = _id;
			}
			
			var icon = document.createElement("span");
			icon.className = 'stdlne-icon';
			
			var caption = document.createElement("h1");
//			caption.className = 'stdlne-caption';
			
			container.appendChild(icon);
			container.appendChild(caption);
			
			return container;
		},
		/**
		 * 
		 * @param {String|Object} [title] OPTIONAL
		 * 			if String: the tile to show in the dialog (NOTE: only visible, if dialog-style is "verbose")
		 * 			if Object: an options object with (OPTIONAL) properties:
		 * 				* option.title {String} the title
		 *				* option.id {String} the ID attribute of the dialog to show
		 * @param {String} [id] OPTIONAL
		 * 				an ID for the dialog to show (if omitted the default dialog will be shown)
		 */
		show: function(title, id, options){
			
			var _title, _id;//, _type, _style;
			if(title){
				if(typeof title === 'string'){
					_title = title;
//					_type = this.defaultType;
//					_style = this.defaultStyle;
				}
				else{
					_title = title.title;
//					_type = this.defaultType;
//					_style = this.defaultStyle;
				}
			}
			else {
				_title = this.defaultTitle;
			}
			
			if(id){
				_id = id;
			}
			else if(title.id){
				_id = title.id;
			}
			
			var list = this._getDom(_id);
			var size = list.length;
			if(size < 1){
				list = [this.create(_id, options)];
				size = 1;
				document.body.appendChild(list[0]);
			}
			
			var curr;
			for(var i=0; i < size; ++i){
				curr = list[i];
				curr.classList.add(activatorClass);
				curr.childNodes.item(1).textContent = _title;
			}
		},
		/**
		 * 
		 * @param {String} [id] OPTIONAL
		 * 			the ID for the dialog element (if omitted all dialogs will be hidden)
		 */
		hide: function(id){
			var list = this._getDom(id);
			for(var i=0,size = list.length; i < size; ++i){
				list[i].classList.remove(activatorClass);
			}
		}
};
//module.waitDialog = dlg;

var dlg = new StandaloneWaitDialog();
dlg.newInstance = StandaloneWaitDialog;

return dlg;
});

//})(window);

(function() {
	'use strict';
  var Watcher, LoginManager, Contacts, Conversation;
 
  function exists(obj) {
    return typeof obj !== "undefined" && obj !== null;
  }

  Watcher = {
    init: function() {
      if(!exists(localStorage['gc-auth']) || !exists(localStorage['cp-auth'])) {
        var self = this;
        var lf = new LoginForm();
        lf.complete = function() {
          lf.close();
          self.init();
        };
        return;
      }

      Contacts.load();

			var list = new MessageList('sms');
			list.getMessages();

			window.addEventListener('unload', this.unload);

      return;
    },

		unload: function() {
			// TODO cleanup when the window is unloading.
		}
  };

  function LoginForm() {
    this._view = document.getElementsByClassName('login-area')[0];
    this._view.className += ' active';

    document.getElementById('login-form')
      .addEventListener('submit', this.formSubmitted.bind(this), false);
  }

  LoginForm.prototype = {
    formSubmitted: function(e) {
			e.preventDefault();
      var email = document.getElementsByName('email')[0].value;
      var password = document.getElementsByName('password')[0].value;
      this.logIn(email, password);
    },

    close: function() {
      this._view.className = 'login-area';
    },

    logIn: function(email, password) {
      var info = { "email": email, "password": password };

      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'api/login', true);
      xhr.onreadystatechange = this.loggingIn.bind(this);
      xhr.send(JSON.stringify(info));
    },

    loggingIn: function(e) {
      if(e.target.readyState === 4) {
        var xhr = e.target;
        var info = JSON.parse(xhr.responseText);
        localStorage['email'] = info.email;
        localStorage['gc-auth'] = info.grandcentral;
        localStorage['cp-auth'] = info.cp;
        this.complete();
      }
    }
  };

  function MessageList(type) {
    this._endpoint = 'api/' + type;
    this._elem = document.getElementById('messages');
  }

  MessageList.prototype = {
    getMessages: function(e) {
      this._elem.innerHTML = "Loading messages";
      
      var xhr = new XMLHttpRequest();
      xhr.open('POST', this._endpoint, true);
      xhr.onreadystatechange = this.showMessages.bind(this);
      xhr.send(localStorage['gc-auth']);
    },

    showMessages: function(e) {
      if(e.target.readyState === 4) {
        var self = this;
        var node = self._elem;
        var xml = e.target.responseXML;
        var json = xml.childNodes[0].childNodes[1].textContent;
        var messages = JSON.parse(json)['messages'];
        if(messages)
          node.innerHTML = '';

        Object.keys(messages).forEach(function(key) {
          var msg = messages[key];
          var elem = document.createElement('div');
          elem.id = msg.id;
          elem.className = 'message';

          var from = document.createElement('div');
          from.className = 'from';
          from.innerHTML = msg.phoneNumber;
          var content = document.createElement('div');
          content.className = 'content';
          content.innerHTML = msg.messageText;
          var when = document.createElement('div');
          when.className = 'when';
          var st = new Date(msg.displayStartDateTime);
          when.innerHTML = (st.getMonth() + 1) + '/' + st.getDate();

          elem.appendChild(from);
          elem.appendChild(content);
          elem.appendChild(when);

          elem.addEventListener('click', self.showMessage.bind(self, msg));
          node.appendChild(elem);
        });
      }
    },

    showMessage: function(msg) {
      var conv = new Conversation(msg);
      conv.show();
    }
  };

  Contacts = {
    load: function(page) {
			page = page || 1;
      var info = {
        email: localStorage['email'],
        auth: localStorage['cp-auth'],
				page: page
      };

      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'api/contacts', true);
      xhr.onreadystatechange = this.loaded.bind(this, page);
      xhr.send(JSON.stringify(info));
    },

    loaded: function(page, e) {
      if(e.target.readyState === 4) {
				var cont = false;

        var xhr = e.target;
        var xml = xhr.responseXML;

				var iterator = xml.evaluate('//atom:entry', xml, this._resolver, XPathResult.ANY_TYPE, null);
				var node = iterator.iterateNext();
				if(node)
					cont = true;

				while(node) {
					this._save(node);
					node = iterator.iterateNext();
				}

				if(cont)
					this.load(page++);
      }

			setTimeout(this.load.bind(this), 3600000); // Load again in an hour.
    },

		show: function(node) {
			// TODO find the contact in the document
		},

    complete: function() { },

		_resolver: function() {
			return 'http://www.w3.org/2005/Atom';
		},

		_save: function(node) {
			// TODO Save this node in the database.
		}
  };

  function Conversation(msg) {
    this._elem = document.getElementById('conversation');
  }

  Conversation.prototype = {
    show: function() {
      // TODO Show the conversation items.
      this._elem.className += ' active';
    }
  };

	window.addEventListener('load', function winLoad() {
		window.removeEventListener('load', winLoad);
		Watcher.init();
	});

})();
